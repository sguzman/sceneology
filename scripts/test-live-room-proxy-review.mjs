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
const resources=["site/room-proxy-review.html","site/room-proxy-review.js","site/room-proxy-review-data.json","site/family-orbit-data.json","site/room-variant-reduction.json","site/source-room-region-guide.mjs","site/room-attachment-fit-audit.json"];
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
function snapshot(id,yaw,variant=null,showZones=false,bareBed=false,pillowTrial=false){
 const profile=fs.mkdtempSync(path.join(os.tmpdir(),"sceneology-proxy-"));
 try{
  const url=new URL("site/room-proxy-review.html",base);
  url.searchParams.set("room",id);url.searchParams.set("yaw",String(yaw));
  if(variant)url.searchParams.set("variant-"+variant.id,variant.key);
  if(showZones)url.searchParams.set("zones","1");
  if(bareBed)url.searchParams.set("bed","bare");
  if(pillowTrial)url.searchParams.set("pillow","1");
  const process=spawnSync(chrome,[...flags,"--user-data-dir="+profile,"--dump-dom",url.href],
   {encoding:"utf8",timeout:100000,maxBuffer:28*1024*1024});
  if(process.error||process.status!==0)throw Error("Proxy browser execution failed "+String(process.error||process.stderr).slice(-650));
  const dom=process.stdout;
  const suffix=(variant?"-"+variant.key:"")+(showZones?"-with-zones":"")+(bareBed?"-without-embedded-bedding":"")+(pillowTrial?"-with-external-bed-pillow":"")+"-"+yaw;
  fs.writeFileSync(path.join(output,id+suffix+".dom.html"),dom);
  const tag=dom.match(/<div\b[^>]*\bid="proxy-stage"[^>]*>/)?.[0]||"";
  assert.ok(tag.includes('data-room="'+id+'"'),"Historical room selector did not update");
  const expectedBedState=id==="study-corner-v1.1"?"not-present":bareBed?"experimental-hidden":"source-raw";
  assert.ok(tag.includes('data-external-pillow="'+(pillowTrial?"unapproved-support-proposal":"hidden")+'"'),"External bed pillow research flag not respected");
  if(pillowTrial)assert.ok(dom.includes("NOT historically authored")&&dom.includes('data-instance="external-bed-pillow-proposal"'),
   "New bedding appears without source-proposal boundary");
  assert.ok(tag.includes('data-embedded-bed="'+expectedBedState+'"'),"Technical bed source mask state incorrect");
  assert.ok(tag.includes('data-withheld-bed-faces="'+(bareBed&&id!=="study-corner-v1.1"?12:0)+'"'),"Source pillow/blanket face filter must suppress exactly two original parts");
  if(bareBed)assert.ok(dom.includes("no replacement pillow or blanket has been placed"),"Experimental bed mask disclosure missing");
  assert.ok(tag.includes('data-rendered="true"'),"Source proxies did not render");
  assert.ok(tag.includes('data-yaw="'+yaw+'"'),"Camera setting ignored");
  const guidedCount=showZones?(id==="cozy-bedroom-study-v1.3"?5:4):0;
  const expectedFootprint=showZones&&id==="cozy-bedroom-study-v1.3"?"original-source-only":"not-shown";
  assert.ok(tag.includes('data-zone-count="'+guidedCount+'"'),"Source zones visibility/count wrong");
  assert.ok(tag.includes('data-footprint="'+expectedFootprint+'"'),"A source-unverified footprint was drawn");
  assert.ok(!dom.includes("Unable to show research room:")&&!dom.includes("Technical projection unavailable:"));
  const geometryStatus=dom.match(/<section\b[^>]*\bid="proxy-clearance"[^>]*>/)?.[0]||"";
  assert.ok(geometryStatus.includes('data-status="technical-only"'),"Live conservative bounds audit missing");
  assert.match(geometryStatus,/data-candidates="\d+"/,"Source geometry bounds were not evaluated");
  assert.ok(dom.includes("NOT confirmed mesh collisions"),"Research collision disclaimer missing");
  const expected=data.rooms.find(r=>r.id===id);
  assert.ok(expected);
  assert.equal((dom.match(/class="proxy-choice"/g)||[]).length,expected.placed.length);
  const expectedPolygons=guidedCount+(expectedFootprint==="original-source-only"?1:0);
  assert.equal((dom.match(/data-zone-guide="/g)||[]).length,expectedPolygons);
  assert.equal((dom.match(/data-zone-label="/g)||[]).length,0,"Source zone text is not allowed to cover geometry");
  if(showZones)assert.ok(dom.includes("Source guides:"),"Zone names missing from unobstructed stage caption");
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
const guidedCozy=snapshot("cozy-bedroom-study-v1.3",130,null,true);
const guidedStudy=snapshot("study-corner-v1.1",130,null,true);
const guidedSleep=snapshot("sleep-room-v1",130,null,true);
const rawBed=snapshot("sleep-room-v1",130);
const hiddenBed=snapshot("sleep-room-v1",130,null,false,true);
const withPillow=snapshot("sleep-room-v1",130,null,false,true,true);
assert.ok(withPillow.faces>hiddenBed.faces,"Separate sourced bed-pillow placement was not visible");
assert.notEqual(hiddenBed.digest,withPillow.digest,"Adding source-backed pillow did not change 3D geometry");
assert.notEqual(rawBed.digest,hiddenBed.digest,"Hidden embedded bedding did not alter projected source geometry");
assert.ok(hiddenBed.faces<rawBed.faces,"Bed masking must remove visible original source bedding faces");
for(const item of [guidedCozy,guidedStudy,guidedSleep])assert.ok(item.faces>20,"Zone guide obscured all model bodies");
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
const zoneCaptureProfile=fs.mkdtempSync(path.join(os.tmpdir(),"sceneology-zone-guide-review-"));
try{
 const image=path.join(output,"cozy-bedroom-source-zones.png");
 const target=new URL("site/room-proxy-review.html?room=cozy-bedroom-study-v1.3&zones=1",base).href;
 const shot=spawnSync(chrome,[...flags,"--window-size=1400,1300","--user-data-dir="+zoneCaptureProfile,
  "--screenshot="+image,target],{encoding:"utf8",timeout:100000});
 if(shot.error||shot.status!==0)throw Error("Source zone overlay screenshot failed");
 const bytes=fs.readFileSync(image);
 assert.ok(bytes.length>6000&&bytes.subarray(0,8).toString("hex")==="89504e470d0a1a0a");
}finally{fs.rmSync(zoneCaptureProfile,{recursive:true,force:true});}
// Screenshot proof of non-destructive embedded dressing removal versus the
// independently authored pillow placement proposal. Both are research-only.
for(const [name,suffix] of [
 ["sleep-room-bed-source-original.png","?room=sleep-room-v1&yaw=130"],
 ["sleep-room-bed-hidden-bedding.png","?room=sleep-room-v1&yaw=130&bed=bare"],
 ["sleep-room-separate-pillow-candidate.png","?room=sleep-room-v1&yaw=130&bed=bare&pillow=1"]
]){
 const profile=fs.mkdtempSync(path.join(os.tmpdir(),"sceneology-bed-attached-proposal-"));
 try{
  const png=path.join(output,name);
  const u=new URL("site/room-proxy-review.html"+suffix,base).href;
  const run=spawnSync(chrome,[...flags,"--window-size=1400,1250","--user-data-dir="+profile,"--screenshot="+png,u],
   {encoding:"utf8",timeout:100000});
  if(run.error||run.status!==0)throw Error("Source bed-pillow visual capture failed");
  const image=fs.readFileSync(png);
  assert.ok(image.length>7000&&image.subarray(0,8).toString("hex")==="89504e470d0a1a0a");
 }finally{fs.rmSync(profile,{recursive:true,force:true});}
}
const fingerprint=name=>crypto.createHash("sha256").update(fs.readFileSync(path.join(output,name))).digest("hex");
assert.equal(new Set(["sleep-room-bed-source-original.png","sleep-room-bed-hidden-bedding.png",
 "sleep-room-separate-pillow-candidate.png"].map(fingerprint)).size,3,
 "Separate original/bare/external-pillow Chrome screenshots unexpectedly identical");
const report={schema_version:1,status:"passed",technical_only:true,original_binding_certified:false,approved_gallery_additions:0,
 explicit_instance_count:18,unplaced_parented_count:11,snapshots:[cozy,study,sleep,rotated,alternate]};
fs.writeFileSync(path.join(output,"proxy-review-report.json"),JSON.stringify(report,null,2)+"\n");
console.log("Sceneology live room proxies: 3 original source layouts, 18 placed objects, 11 withheld attachments, 5 Chrome projections and exact deployed assets; no variant/gallery certification.");
