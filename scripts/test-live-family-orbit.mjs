import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import crypto from "node:crypto";
import {spawnSync} from "node:child_process";
const root=path.resolve(import.meta.dirname,"..");
const base=process.env.SCENEOLOGY_SITE_URL;
assert.ok(base?.startsWith("https://"),"Expected HTTPS Pages deployment");
const site=base.endsWith("/")?base:base+"/";
const catalog=JSON.parse(fs.readFileSync(path.join(root,"site/family-orbit-data.json"),"utf8"));
const gallery=JSON.parse(fs.readFileSync(path.join(root,"catalog/showcase.json"),"utf8"));
assert.equal(catalog.review_only,true);
assert.equal(catalog.automatic_gallery_approval,false);
assert.equal(catalog.models.length,30);
assert.equal(gallery.approved_ids.length,24);
const remote=["site/family-orbit.html","site/family-orbit.js","site/family-orbit-data.json"];
for(const relative of remote){
 let last;
 for(let i=0;i<5;i++){
  try{
   const url=new URL(relative,site);url.searchParams.set("revision",process.env.GITHUB_SHA||"current");
   const response=await fetch(url,{cache:"no-store",signal:AbortSignal.timeout(15000)});
   assert.equal(response.status,200,"Unpublished orbit asset "+relative);
   const bytes=Buffer.from(await response.arrayBuffer());
   assert.ok(bytes.equals(fs.readFileSync(path.join(root,relative))),"Orbit asset differs after deployment "+relative);
   last=null;break;
  }catch(error){last=error;if(i<4)await new Promise(resolve=>setTimeout(resolve,2600));}
 }
 if(last)throw last;
}
const output=path.join(root,"artifacts/live-family-orbit");
fs.mkdirSync(output,{recursive:true});
const chrome=process.env.CHROME_BIN||"google-chrome";
const flags=["--headless=new","--no-sandbox","--disable-dev-shm-usage","--disable-background-networking",
 "--no-first-run","--window-size=1200,840","--virtual-time-budget=6500"];
function snapshot(model,yaw){
 const profile=fs.mkdtempSync(path.join(os.tmpdir(),"sceneology-orbit-"));
 try{
  const url=new URL("site/family-orbit.html",site);
  url.searchParams.set("model",model);url.searchParams.set("yaw",String(yaw));
  const run=spawnSync(chrome,[...flags,"--user-data-dir="+profile,"--dump-dom",url.href],
   {encoding:"utf8",timeout:100000,maxBuffer:25*1024*1024});
  if(run.error||run.status!==0)throw Error("Orbit browser startup failed: "+String(run.error||run.stderr).slice(-600));
  const dom=run.stdout;
  fs.writeFileSync(path.join(output,model+"-"+yaw+".dom.html"),dom);
  const stage=dom.match(/<div id="orbit-stage"[^>]*>/)?.[0]||"";
  assert.ok(stage.includes('data-model="'+model+'"')&&stage.includes('data-rendered="true"'),"Orbit model did not render "+model);
  assert.ok(stage.includes('data-yaw="'+yaw+'"'),"Camera yaw ignored");
  assert.ok(!dom.includes("Unable to show source model:")&&!dom.includes("Orbit preview error:"));
  assert.equal((dom.match(/<option /g)||[]).length,30);
  const polygons=[...dom.matchAll(/<polygon [^>]*points="([^"]+)"/g)].map(x=>x[1]);
  assert.ok(polygons.length>=3,"Missing authored model faces");
  assert.ok(polygons.every(p=>!p.includes("NaN")&&!p.includes("Infinity")),"Nonfinite orbit projection");
  return {model,yaw,faces:polygons.length,sha256:crypto.createHash("sha256").update(polygons.join("|")).digest("hex")};
 }finally{fs.rmSync(profile,{recursive:true,force:true});}
}
const first=snapshot("task-lamp",130),second=snapshot("task-lamp",-45),third=snapshot("wide-cute-chair",130);
assert.notEqual(first.sha256,second.sha256,"Yaw rotation did not change visible geometry");
assert.notEqual(first.sha256,third.sha256,"Source model choice did not change geometry");
const report={schema_version:1,review_only:true,artistic_approval:false,status:"passed",shots:[first,second,third]};
fs.writeFileSync(path.join(output,"orbit-verification.json"),JSON.stringify(report,null,2)+"\n");
console.log("Sceneology orbit: 30 source choices, 3 exact HTTPS assets and 3 independently rendered browser views passed; zero gallery promotions.");
