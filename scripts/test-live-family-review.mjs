import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {spawnSync} from "node:child_process";

const root=path.resolve(import.meta.dirname,"..");
const base=process.env.SCENEOLOGY_SITE_URL;
if(!base||!base.startsWith("https://"))throw Error("Expected deployed HTTPS website");
const baseUrl=base.endsWith("/")?base:base+"/";
const sources=JSON.parse(fs.readFileSync(path.join(root,"catalog/accepted-family-sources.json"),"utf8"));
const selected=JSON.parse(fs.readFileSync(path.join(root,"catalog/showcase.json"),"utf8"));
assert.equal(sources.items.length,9,"Accepted source inventory changed");
for(const record of sources.items){
 assert.equal(record.selection_status,"source-staged-not-in-gallery");
 assert.equal(record.new_renderer_visual_approval,false);
 assert.ok(!selected.approved_ids.includes(record.key),"Unapproved family leaked to gallery");
}
const urls=["site/family-review.html","site/family-review.js","catalog/accepted-family-sources.json",
 ...sources.items.map(x=>"site/family-previews/"+path.basename(x.public_path,".sc3d.yml")+".svg")];
async function download(rel){
 let error;
 for(let attempt=0;attempt<5;attempt++){
  try{
   const u=new URL(rel,baseUrl);
   u.searchParams.set("revision",process.env.GITHUB_SHA||"current");
   const resp=await fetch(u,{cache:"no-store",signal:AbortSignal.timeout(14000)});
   assert.equal(resp.status,200,"Failed HTTP asset "+rel);
   return Buffer.from(await resp.arrayBuffer());
  }catch(e){error=e;if(attempt<4)await new Promise(r=>setTimeout(r,2700));}
 }
 throw error;
}
for(const rel of urls){
 const local=fs.readFileSync(path.join(root,rel));
 const remote=await download(rel);
 assert.ok(local.equals(remote),"Deployed source-derived preview differs from repository "+rel);
 if(rel.endsWith(".svg")){
  const svg=remote.toString("utf8").replace('xmlns="http://www.w3.org/2000/svg"',"");
  assert.ok(svg.startsWith("<svg")&&(svg.match(/<polygon /g)||[]).length>=8,"Invalid source-generated SVG "+rel);
  assert.ok(!/<(?:script|image|foreignObject)\b|https?:\/\//i.test(svg),"External resource in published preview "+rel);
 }
}
const out=path.join(root,"artifacts","live-family-review");
fs.mkdirSync(out,{recursive:true});
const profile=fs.mkdtempSync(path.join(os.tmpdir(),"sceneology-live-families-"));
const url=new URL("site/family-review.html",baseUrl).href;
const chrome=process.env.CHROME_BIN||"google-chrome";
const options=["--headless=new","--no-sandbox","--disable-background-networking","--disable-dev-shm-usage",
 "--no-first-run","--window-size=1280,840","--virtual-time-budget=7500"];
try{
 const run=spawnSync(chrome,[...options,"--user-data-dir="+profile,"--dump-dom",url],{encoding:"utf8",timeout:90000,maxBuffer:16*1024*1024});
 if(run.error||run.status!==0)throw Error("Review-browser startup failed: "+String(run.error||run.stderr).slice(-700));
 const dom=run.stdout;
 fs.writeFileSync(path.join(out,"family-review.dom.html"),dom);
 assert.equal((dom.match(/<article class="review-item"/g)||[]).length,9,"Not all nine families rendered in actual browser");
 assert.ok(dom.includes("zero automatically approved exhibits"),"Explicit unapproved boundary not displayed");
 for(const record of sources.items){
  assert.ok(dom.includes('data-record-id="'+record.key+'"'),"Missing review object "+record.key);
 }
 const file=path.join(out,"family-review-desktop.png");
 const capture=spawnSync(chrome,[...options,"--user-data-dir="+profile+"-capture","--screenshot="+file,url],{encoding:"utf8",timeout:90000});
 if(capture.error||capture.status!==0)throw Error("Review screenshot capture failed");
 const bytes=fs.readFileSync(file);
 assert.ok(bytes.length>5000&&bytes.subarray(0,8).toString("hex")==="89504e470d0a1a0a","Browser screenshot absent");
 console.log("Sceneology family review verified: nine distinct browser cards, "+urls.length+" exact deployed assets, zero new gallery approvals.");
}finally{
 fs.rmSync(profile,{recursive:true,force:true});
 fs.rmSync(profile+"-capture",{recursive:true,force:true});
}
