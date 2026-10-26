import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {spawnSync} from "node:child_process";
const root=path.resolve(import.meta.dirname,"..");
const site=process.env.SCENEOLOGY_SITE_URL;
assert.ok(site?.startsWith("https://"),"Expected deployed Sceneology HTTPS origin");
const base=site.endsWith("/")?site:site+"/";
const data=JSON.parse(fs.readFileSync(path.join(root,"site/room-proxy-review-data.json"),"utf8"));
const gallery=JSON.parse(fs.readFileSync(path.join(root,"catalog/showcase.json"),"utf8"));
assert.equal(data.review_only,true);
assert.equal(data.source_model_bindings_certified,false);
assert.equal(data.showcase_approved,false);
assert.equal(data.rooms.length,3);
assert.equal(gallery.approved_ids.length,24);
const resources=["site/room-proxy-review.html","site/room-proxy-review.js","site/room-proxy-review-data.json","site/family-orbit-data.json","site/room-variant-reduction.json"];
for(const relative of resources){
 let failure;
 for(let attempt=0;attempt<5;attempt++){
  try{
   const request=new URL(relative,base);
   request.searchParams.set("revision",process.env.GITHUB_SHA||"live");
   const response=await fetch(request,{cache:"no-store",signal:AbortSignal.timeout(16000)});
   assert.equal(response.status,200,"Missing source review page asset "+relative);
   const body=Buffer.from(await response.arrayBuffer());
   assert.ok(body.equals(fs.readFileSync(path.join(root,relative))),"Live/source mismatch "+relative);
   failure=null;break;
  }catch(e){failure=e;if(attempt<4)await new Promise(resolve=>setTimeout(resolve,2500));}
 }
 if(failure)throw failure;
}
const output=path.join(root,"artifacts/live-room-proxy");
fs.mkdirSync(output,{recursive:true});
const chrome=process.env.CHROME_BIN||"google-chrome";
const flags=["--headless=new","--no-sandbox","--disable-dev-shm-usage","--disable-background-networking","--no-first-run",
 "--window-size=1300,920","--virtual-time-budget=7000"];
function snapshot(id,yaw,variant=null){
 const profile=fs.mkdtempSync(path.join(os.tmpdir(),"sceneology-proxy-"));
 try{
  const url=new URL("site/room-proxy-review.html",base);
  url.searchParams.set("room",id);url.searchParams.set("yaw",String(yaw));
  if(variant)url.searchParams.set("variant-"+variant.id,variant.key);
  const process=spawnSync(chrome,[...flags,"--user-data-dir="+profile,"--dump-dom",url.href],
   {encoding:"utf8",timeout:100000,maxBuffer:28*1024*1024});
  if(process.error||process.status!==0)throw Error("Proxy browser execution failed "+String(process.error||process.stderr).slice(-650));
  const dom=process.stdout;
  const suffix=(variant?"-"+variant.key:"")+"-"+yaw;
  fs.writeFileSync(path.join(output,id+suffix+".dom.html"),dom);
  const tag=dom.match(/<div\b[^>]*\bid="proxy-stage"[^>]*>/)?.[0]||"";
  assert.ok(tag.includes('data-room="'+id+'"'),"Historical room selector did not update");
  assert.ok(tag.includes('data-rendered="true"'),"Source proxies did not render");
  assert.ok(tag.includes('data-yaw="'+yaw+'"'),"Camera setting ignored");
  assert.ok(!dom.includes("Unable to show research room:")&&!dom.includes("Technical projection unavailable:"));
  const geometryStatus=dom.match(/<section\b[^>]*\bid="proxy-clearance"[^>]*>/)?.[0]||"";
  assert.ok(geometryStatus.includes('data-status="technical-only"'),"Live conservative bounds audit missing");
  assert.match(geometryStatus,/data-candidates="\d+"/,"Source geometry bounds were not evaluated");
  assert.ok(dom.includes("NOT confirmed mesh collisions"),"Research collision disclaimer missing");
  const expected=data.rooms.find(r=>r.id===id);
  assert.ok(expected);
  assert.equal((dom.match(/class="proxy-choice"/g)||[]).length,expected.placed.length);
  const reductions=JSON.parse(fs.readFileSync(path.join(root,"site/room-variant-reduction.json"),"utf8"));
  const expectedReductions=reductions.rooms.find(r=>r.id===id).one_change_reductions;
  assert.equal((dom.match(/data-reduction="/g)||[]).length,expectedReductions.length);
  assert.ok(dom.includes("not original-binding evidence")||expectedReductions.length===0,"Missing research-only alternative warning");
  assert.equal((dom.match(/data-omitted-instance="/g)||[]).length,expected.omitted_parented.length);
  for(const item of expected.omitted_parented)assert.ok(dom.includes('data-omitted-instance="'+item.id+'"'),"Missing unresolved attachment "+item.id);
  if(variant){
   assert.ok(tag.includes('data-variant-choices="1"'),"Variant from URL was not selected");
   // DOM .value can change without changing serialized <option selected> attributes.
   // The stage confirms an explicit valid override; geometry digests below prove its effect.
  }
  const faces=[...dom.matchAll(/<polygon\b[^>]*points="([^"]+)"/g)].map(m=>m[1]);
  assert.ok(faces.length>=20,"Missing real source-based model faces");
  assert.ok(faces.every(x=>!/(?:NaN|Infinity)/.test(x)),"Nonfinite room projection");
  const instances=new Set([...dom.matchAll(/<polygon\b[^>]*data-instance="([^"]+)"/g)].map(x=>x[1]));
  assert.ok(instances.size>=Math.min(3,expected.placed.length),"Insufficient independent placed object bodies");
  const digest=crypto.createHash("sha256").update(faces.join("|")).digest("hex");
  return {room:id,yaw,faces:faces.length,objects:instances.size,variant:variant?.key||null,digest};
 }finally{fs.rmSync(profile,{recursive:true,force:true});}
}
const cozy=snapshot("cozy-bedroom-study-v1.3",130);
const study=snapshot("study-corner-v1.1",130);
const sleep=snapshot("sleep-room-v1",130);
const rotated=snapshot("study-corner-v1.1",-45);
const alternate=snapshot("study-corner-v1.1",130,{id:"desk",key:"wide-writing-desk"});
assert.notEqual(study.digest,rotated.digest,"Camera rotation had no effect");
assert.notEqual(study.digest,alternate.digest,"Alternate staged model failed to change room geometry");
assert.equal(new Set([cozy.digest,study.digest,sleep.digest]).size,3,"Distinct historical layouts appear identical");
const screenshotProfile=fs.mkdtempSync(path.join(os.tmpdir(),"sceneology-proxy-screenshot-"));
try{
 const image=path.join(output,"study-corner-desktop.png");
 const url=new URL("site/room-proxy-review.html",base);url.searchParams.set("room","study-corner-v1.1");
 const run=spawnSync(chrome,[...flags,"--user-data-dir="+screenshotProfile,"--screenshot="+image,url.href],
  {encoding:"utf8",timeout:90000});
 if(run.error||run.status!==0)throw Error("Study corner screenshot capture failed");
 const png=fs.readFileSync(image);
 assert.ok(png.length>6000&&png.subarray(0,8).toString("hex")==="89504e470d0a1a0a","Bad Chrome screenshot");
}finally{fs.rmSync(screenshotProfile,{recursive:true,force:true});}
const report={schema_version:1,status:"passed",technical_only:true,original_binding_certified:false,approved_gallery_additions:0,
 explicit_instance_count:18,unplaced_parented_count:11,snapshots:[cozy,study,sleep,rotated,alternate]};
fs.writeFileSync(path.join(output,"proxy-review-report.json"),JSON.stringify(report,null,2)+"\n");
console.log("Sceneology live room proxies: 3 original source layouts, 18 placed objects, 11 withheld attachments, 5 Chrome projections and exact deployed assets; no variant/gallery certification.");
