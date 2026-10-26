import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {spawnSync} from "node:child_process";
const root=path.resolve(import.meta.dirname,"..");
const site=process.env.SCENEOLOGY_SITE_URL;
assert.ok(/^https:\/\//.test(site||""),"Expected real GitHub Pages HTTPS URL");
const base=site.endsWith("/")?site:site+"/";
const m=JSON.parse(fs.readFileSync(path.join(root,"catalog/blanket-reconstruction-review.json"),"utf8"));
assert.equal(m.original_accepted_artifact_recovered,false);
assert.equal(m.artwork_approved,false);
assert.equal(m.allowed_in_showcase,false);
const resources=["site/blanket-review.html","catalog/blanket-reconstruction-review.json","site/blanket-previews/reference.svg",
 "site/blanket-previews/proposal.svg",m.reference.path,m.proposal.path];
async function exact(rel){
 let last;
 for(let i=0;i<5;i++){
  try{
   const url=new URL(rel,base);url.searchParams.set("revision",process.env.GITHUB_SHA||"verify");
   const response=await fetch(url,{cache:"no-store",signal:AbortSignal.timeout(15000)});
   assert.equal(response.status,200,"Missing live blanket resource "+rel);
   const remote=Buffer.from(await response.arrayBuffer());
   const local=fs.readFileSync(path.join(root,rel));
   assert.ok(remote.equals(local),"Live blanket resource differs from source "+rel);
   return;
  }catch(e){last=e;if(i<4)await new Promise(r=>setTimeout(r,2700));}
 }
 throw last;
}
for(const resource of resources)await exact(resource);
const destination=path.join(root,"artifacts/live-blanket-review");
fs.mkdirSync(destination,{recursive:true});
const chrome=process.env.CHROME_BIN||"google-chrome";
const flags=["--headless=new","--no-sandbox","--disable-dev-shm-usage","--disable-background-networking",
 "--no-first-run","--window-size=1280,820","--virtual-time-budget=6000"];
const profile=fs.mkdtempSync(path.join(os.tmpdir(),"sceneology-blanket-"));
const address=new URL("site/blanket-review.html",base).href;
try{
 const run=spawnSync(chrome,[...flags,"--user-data-dir="+profile,"--dump-dom",address],
 {encoding:"utf8",timeout:90000,maxBuffer:16*1024*1024});
 if(run.error||run.status!==0)throw Error("Blanket comparison browser failed "+String(run.error||run.stderr).slice(-600));
 const dom=run.stdout;
 fs.writeFileSync(path.join(destination,"blanket-review.dom.html"),dom);
 assert.equal((dom.match(/<article class="candidate">/g)||[]).length,2);
 assert.ok(dom.includes("Neither preview is the original accepted v1.3."),"Missing original-version warning");
 for(const name of ["reference","proposal"])assert.ok(dom.includes("./blanket-previews/"+name+".svg"),"Missing diagram "+name);
 const photo=path.join(destination,"blanket-review-desktop.png");
 const capture=spawnSync(chrome,[...flags,"--user-data-dir="+profile+"-capture","--screenshot="+photo,address],
  {encoding:"utf8",timeout:90000});
 if(capture.error||capture.status!==0)throw Error("Blanket screenshot failed");
 const png=fs.readFileSync(photo);
 assert.ok(png.length>5000&&png.subarray(0,8).toString("hex")==="89504e470d0a1a0a","No screenshot");
 console.log("Bed-cover review live QA: 2 browser candidates, 6 exact HTTPS resources, screenshot captured; no artwork approval.");
}finally{
 fs.rmSync(profile,{recursive:true,force:true});
 fs.rmSync(profile+"-capture",{recursive:true,force:true});
}
