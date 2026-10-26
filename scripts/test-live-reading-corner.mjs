import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {spawnSync} from "node:child_process";
const root=path.resolve(import.meta.dirname,"..");
const url=process.env.SCENEOLOGY_SITE_URL;
assert.ok(url?.startsWith("https://"),"Expected live Pages origin");
const base=url.endsWith("/")?url:url+"/";
const scene=JSON.parse(fs.readFileSync(path.join(root,"site/reading-corner-study-data.json"),"utf8"));
assert.equal(scene.instances.length,6);
assert.equal(scene.omitted_parented_instances.length,2);
assert.equal(scene.gallery_approved,false);
assert.equal(scene.complete_room,false);
const resources=["site/reading-corner-study.html","site/reading-corner-study.js","site/reading-corner-study-data.json","site/family-orbit-data.json","site/reading-corner-occupancy-data.json","site/reading-support-alignment.mjs","site/reading-lumbar-placement-data.json","site/source-room-region-guide.mjs"];
for(const relative of resources){
 let issue;
 for(let i=0;i<5;i++){
  try{
   const full=new URL(relative,base);full.searchParams.set("rev",process.env.GITHUB_SHA||"latest");
   const resp=await fetch(full,{cache:"no-store",signal:AbortSignal.timeout(16000)});
   assert.equal(resp.status,200,"Missing technical Reading Corner resource "+relative);
   assert.ok(Buffer.from(await resp.arrayBuffer()).equals(fs.readFileSync(path.join(root,relative))),"Reading Corner source/deploy mismatch "+relative);
   issue=null;break;
  }catch(e){issue=e;if(i<4)await new Promise(resolve=>setTimeout(resolve,2700));}
 }
 if(issue)throw issue;
}
const output=path.join(root,"artifacts/live-reading-corner");
fs.mkdirSync(output,{recursive:true});
const browser=process.env.CHROME_BIN||"google-chrome";
const flags=["--headless=new","--no-sandbox","--disable-dev-shm-usage","--disable-background-networking","--no-first-run",
 "--window-size=1250,920","--virtual-time-budget=7000"];
function sample(yaw,zones=false){
 const profile=fs.mkdtempSync(path.join(os.tmpdir(),"sceneology-reading-"));
 try{
  const url=new URL("site/reading-corner-study.html",base);
  url.searchParams.set("yaw",String(yaw));
  if(zones)url.searchParams.set("zones","1");
  const result=spawnSync(browser,[...flags,"--user-data-dir="+profile,"--dump-dom",url.href],
   {encoding:"utf8",timeout:100000,maxBuffer:26*1024*1024});
  if(result.error||result.status!==0)throw Error("Reading Corner Chrome failed: "+String(result.error||result.stderr).slice(-650));
  const dom=result.stdout;
  fs.writeFileSync(path.join(output,"reading-corner-"+yaw+(zones?"-zones":"")+".dom.html"),dom);
  const stage=dom.match(/<div[^>]*\bid="reading-stage"[^>]*>/)?.[0]||"";
  assert.ok(stage.includes('data-rendered="true"'),"Partial room did not render actual geometry");
  assert.ok(stage.includes('data-yaw="'+yaw+'"'),"Room camera angle ignored");
  assert.ok(stage.includes('data-zone-count="'+(zones?4:0)+'"'),"Reading Corner source-zone count changed");
  assert.ok(stage.includes('data-footprint="not-shown"'),"Reading Corner falsely acquired a sourced room outline");
  assert.equal((dom.match(/data-zone-guide="/g)||[]).length,zones?4:0);
  assert.equal((dom.match(/data-zone-label="/g)||[]).length,0,"Source zone text should be below scene, not on models");
  if(zones)assert.ok(dom.includes("Source guides:"),"Reading zone legend absent from caption");
  const top=Number(stage.match(/data-viewport-top="(-?\d+)"/)?.[1]);
  assert.ok(Number.isFinite(top)&&top>50&&top<600,"Room visual stage pushed below desktop first viewport: "+top);
  assert.ok(!dom.includes("Unable to reconstruct research layout:"));
  const faces=[...dom.matchAll(/<polygon [^>]*points="([^"]+)"/g)].map(m=>m[1]);
  assert.ok(faces.length>=30&&faces.every(v=>!v.includes("NaN")&&!v.includes("Infinity")),"Invalid visible room geometry");
  assert.ok(dom.includes('data-instance="chair"')&&dom.includes('data-instance="rug"'),"Source object instances missing");
  assert.ok(dom.includes("two")||dom.includes("2 deliberately omitted attachments"),"Incomplete room disclaimer disappeared");
  const geometryStatus=dom.match(/<section\b[^>]*\bid="reading-clearance"[^>]*>/)?.[0]||"";
  assert.ok(geometryStatus.includes('data-status="technical-only"'),"Reading Corner bounds QA never appeared");
  assert.match(geometryStatus,/data-candidates="\d+"/);
  assert.ok(dom.includes("neither confirmed collisions"),"Source clearance gate disclaimer missing");
  assert.ok(dom.includes('data-omitted-instance="lumbar-pillow"')&&dom.includes('data-omitted-instance="shelf-books"'),"Unpositioned parent links not displayed");
  return {yaw,faces:faces.length,digest:crypto.createHash("sha256").update(faces.join("|")).digest("hex")};
 }finally{fs.rmSync(profile,{recursive:true,force:true});}
}
const first=sample(130),second=sample(-45),guided=sample(130,true);
assert.ok(guided.faces>=first.faces,"Source zone guide removed furniture");
const occupancyProfile=fs.mkdtempSync(path.join(os.tmpdir(),"sceneology-reading-occupancy-"));
try{
 const url=new URL("site/reading-corner-study.html?yaw=130&occupancy=1",base);
 const visit=spawnSync(browser,[...flags,"--user-data-dir="+occupancyProfile,"--dump-dom",url.href],
  {encoding:"utf8",timeout:100000,maxBuffer:32*1024*1024});
 if(visit.error||visit.status!==0)throw Error("Static character occupancy Chrome failed");
 const dom=visit.stdout;
 fs.writeFileSync(path.join(output,"reading-corner-occupancy.dom.html"),dom);
 const stage=dom.match(/<div[^>]*\bid="reading-stage"[^>]*>/)?.[0]||"";
 assert.ok(stage.includes('data-occupancy="research-candidate"'),"Source-authored occupancy toggle did not render");
 assert.ok(dom.includes('data-instance="quest-girl"'),"Accepted static character geometry was not incorporated");
 assert.ok(/NOT verified contact/i.test(dom),"Missing source support warning");
 assert.ok(stage.includes('data-support="authored-unaligned"'),"Original source-authored pose not retained");
 assert.ok(stage.includes('data-character-y="0"'),"Original character Y was silently modified");
 const unique=new Set([...dom.matchAll(/data-instance="([^"]+)"/g)].map(x=>x[1]));
 assert.ok(unique.has("quest-girl")&&unique.has("chair")&&unique.has("rug"));
 const altered=new URL("site/reading-corner-study.html?yaw=130&occupancy=1&support=1",base);
 const alternative=spawnSync(browser,[...flags,"--user-data-dir="+occupancyProfile+"-aligned","--dump-dom",altered.href],
  {encoding:"utf8",timeout:100000,maxBuffer:32*1024*1024});
 if(alternative.error||alternative.status!==0)throw Error("Optional shoe support alignment Chrome failed");
 const dom2=alternative.stdout;
 fs.writeFileSync(path.join(output,"reading-corner-support-proposal.dom.html"),dom2);
 const stage2=dom2.match(/<div[^>]*\bid="reading-stage"[^>]*>/)?.[0]||"";
 assert.ok(stage2.includes('data-support="alignment-proposal"'),"Source-specific support toggle was not respected");
 assert.ok(stage2.includes('data-character-y="0.99"'),"Foot correction does not match source-measured rug field offset");
 assert.ok(dom2.includes("original geometry and scene coordinates unchanged"),"Support alignment was incorrectly described as source");
 const characterPolygons=body=>[...body.matchAll(/<polygon\b[^>]*data-instance="quest-girl"[^>]*points="([^"]+)"/g)].map(x=>x[1]);
 const origin=characterPolygons(dom),raised=characterPolygons(dom2);
 assert.ok(origin.length>80&&raised.length===origin.length,"Aligned overlay lost source character geometry");
 assert.notDeepEqual(origin,raised,"Viewer alignment has no visible effect on actual character pixels");
 fs.rmSync(occupancyProfile+"-aligned",{recursive:true,force:true});
}finally{fs.rmSync(occupancyProfile,{recursive:true,force:true});}
// Optional pillow research must render a distinct source-derived object and preserve the accepted-room source.
const pillowProfile=fs.mkdtempSync(path.join(os.tmpdir(),"sceneology-reading-lumbar-"));
try{
 const url=new URL("site/reading-corner-study.html?yaw=130&pillow=1",base);
 const result=spawnSync(browser,[...flags,"--user-data-dir="+pillowProfile,"--dump-dom",url.href],
  {encoding:"utf8",timeout:100000,maxBuffer:32*1024*1024});
 if(result.error||result.status!==0)throw Error("Lumbar support browser rendering failed");
 const dom=result.stdout;
 fs.writeFileSync(path.join(output,"reading-lumbar-proposal.dom.html"),dom);
 const stage=dom.match(/<div[^>]*\bid="reading-stage"[^>]*>/)?.[0]||"";
 assert.ok(stage.includes('data-pillow="seat-back-proposal"'),"Source-aware lumbar support candidate not selected");
 assert.ok(stage.includes('data-pillow-overhang="0.2"'),"Pillow width compatibility warning disappeared");
 assert.ok(dom.includes('data-instance="lumbar-pillow"'),"Lumbar pillow geometry is not visible");
 assert.ok(dom.includes("historical placement remains unknown")||dom.includes("not an original-world-placement"),
  "Pillow proposal lost original-source qualification");
 const faces=[...dom.matchAll(/<polygon[^>]*data-instance="lumbar-pillow"[^>]*points="([^"]+)"/g)];
 assert.ok(faces.length>=5&&faces.every(m=>!/(?:NaN|Infinity)/.test(m[1])),"Pillow projection is not finite");
 const screenshotProfile=fs.mkdtempSync(path.join(os.tmpdir(),"sceneology-lumbar-capture-"));
 try{
  const png=path.join(output,"reading-lumbar-placement-proposal.png");
  const shot=spawnSync(browser,[...flags,"--window-size=1250,1460","--user-data-dir="+screenshotProfile,
   "--screenshot="+png,url.href],{encoding:"utf8",timeout:100000});
  if(shot.error||shot.status!==0)throw Error("Lumbar review screenshot not captured");
  const b=fs.readFileSync(png);
  assert.ok(b.length>7000&&b.subarray(0,8).toString("hex")==="89504e470d0a1a0a");
 }finally{fs.rmSync(screenshotProfile,{recursive:true,force:true});}
}finally{fs.rmSync(pillowProfile,{recursive:true,force:true});}

assert.notEqual(first.digest,second.digest,"Camera rotation did not change source-composition geometry");
const shotProfile=fs.mkdtempSync(path.join(os.tmpdir(),"sceneology-reading-shot-"));
try{
 const picture=path.join(output,"reading-corner-desktop.png");
 const address=new URL("site/reading-corner-study.html?yaw=130",base).href;
 const run=spawnSync(browser,[...flags,"--user-data-dir="+shotProfile,"--screenshot="+picture,address],{encoding:"utf8",timeout:100000});
 if(run.error||run.status!==0)throw Error("Reading-corner screenshot failed");
 const bytes=fs.readFileSync(picture);
 assert.ok(bytes.length>7000&&bytes.subarray(0,8).toString("hex")==="89504e470d0a1a0a");
}finally{fs.rmSync(shotProfile,{recursive:true,force:true});}
const occupancyScreenshotProfile=fs.mkdtempSync(path.join(os.tmpdir(),"sceneology-occupancy-screen-"));
try{
 const pngPath=path.join(output,"reading-corner-quest-girl-candidate.png");
 const url=new URL("site/reading-corner-study.html?yaw=130&occupancy=1",base).href;
 const chromeShot=spawnSync(browser,[...flags,"--window-size=1250,1460","--user-data-dir="+occupancyScreenshotProfile,"--screenshot="+pngPath,url],
  {encoding:"utf8",timeout:100000});
 if(chromeShot.error||chromeShot.status!==0)throw Error("Quest Girl occupancy screenshot failed "+String(chromeShot.error||chromeShot.stderr).slice(-250));
 const png=fs.readFileSync(pngPath);
 assert.ok(png.length>8500&&png.subarray(0,8).toString("hex")==="89504e470d0a1a0a","Invalid research occupancy PNG");
}finally{fs.rmSync(occupancyScreenshotProfile,{recursive:true,force:true});}
const proposedScreenshotProfile=fs.mkdtempSync(path.join(os.tmpdir(),"sceneology-occupancy-aligned-screen-"));
try{
 const pngPath=path.join(output,"reading-corner-shoe-alignment-proposal.png");
 const url=new URL("site/reading-corner-study.html?yaw=130&occupancy=1&support=1",base).href;
 const capture=spawnSync(browser,[...flags,"--window-size=1250,1460","--user-data-dir="+proposedScreenshotProfile,
  "--screenshot="+pngPath,url],{encoding:"utf8",timeout:100000});
 if(capture.error||capture.status!==0)throw Error("Optional shoe alignment capture failed");
 const png=fs.readFileSync(pngPath);
 assert.ok(png.length>8500&&png.subarray(0,8).toString("hex")==="89504e470d0a1a0a","Bad aligned occupancy screenshot");
 const baseline=fs.readFileSync(path.join(output,"reading-corner-quest-girl-candidate.png"));
 assert.notEqual(crypto.createHash("sha256").update(baseline).digest("hex"),
  crypto.createHash("sha256").update(png).digest("hex"),"Aligned image cannot be identical to source pose image");
}finally{fs.rmSync(proposedScreenshotProfile,{recursive:true,force:true});}
const forwardPillowProfile=fs.mkdtempSync(path.join(os.tmpdir(),"sceneology-pillow-front-capture-"));
try{
 const picture=path.join(output,"reading-lumbar-placement-front-perspective.png");
 const url=new URL("site/reading-corner-study.html?yaw=-45&pillow=1",base).href;
 const run=spawnSync(browser,[...flags,"--window-size=1250,1460","--user-data-dir="+forwardPillowProfile,
  "--screenshot="+picture,url],{encoding:"utf8",timeout:100000});
 if(run.error||run.status!==0)throw Error("Lumbar front-face review capture failed");
 const png=fs.readFileSync(picture);
 assert.ok(png.length>7000&&png.subarray(0,8).toString("hex")==="89504e470d0a1a0a");
}finally{fs.rmSync(forwardPillowProfile,{recursive:true,force:true});}
const regionCaptureProfile=fs.mkdtempSync(path.join(os.tmpdir(),"sceneology-reading-zone-capture-"));
try{
 const image=path.join(output,"reading-corner-zone-guides.png");
 const target=new URL("site/reading-corner-study.html?zones=1&yaw=130",base).href;
 const shot=spawnSync(browser,[...flags,"--window-size=1250,1450","--user-data-dir="+regionCaptureProfile,
  "--screenshot="+image,target],{encoding:"utf8",timeout:100000});
 if(shot.error||shot.status!==0)throw Error("Reading Corner source-zone snapshot failed");
 const bytes=fs.readFileSync(image);
 assert.ok(bytes.length>7000&&bytes.subarray(0,8).toString("hex")==="89504e470d0a1a0a");
}finally{fs.rmSync(regionCaptureProfile,{recursive:true,force:true});}
const report={schema_version:1,status:"passed",artwork_approved:false,original_accepted_room_render:false,
 partial_placed_instances:6,unplaced_instances:2,source_shoe_gap:-.99,
 opt_in_support_offset:.99,original_occupancy_transform_preserved:true,cameras:[first,second]};
fs.writeFileSync(path.join(output,"room-report.json"),JSON.stringify(report,null,2)+"\n");
console.log("Partial Reading Corner Chrome QA: 6/8 authored instances with distinct camera projections, byte-exact release assets; no gallery approval.");
