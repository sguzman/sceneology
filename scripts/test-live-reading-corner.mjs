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
const resources=["site/reading-corner-study.html","site/reading-corner-study.js","site/reading-corner-study-data.json","site/family-orbit-data.json"];
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
function sample(yaw){
 const profile=fs.mkdtempSync(path.join(os.tmpdir(),"sceneology-reading-"));
 try{
  const url=new URL("site/reading-corner-study.html",base);
  url.searchParams.set("yaw",String(yaw));
  const result=spawnSync(browser,[...flags,"--user-data-dir="+profile,"--dump-dom",url.href],
   {encoding:"utf8",timeout:100000,maxBuffer:26*1024*1024});
  if(result.error||result.status!==0)throw Error("Reading Corner Chrome failed: "+String(result.error||result.stderr).slice(-650));
  const dom=result.stdout;
  fs.writeFileSync(path.join(output,"reading-corner-"+yaw+".dom.html"),dom);
  const stage=dom.match(/<div[^>]*\bid="reading-stage"[^>]*>/)?.[0]||"";
  assert.ok(stage.includes('data-rendered="true"'),"Partial room did not render actual geometry");
  assert.ok(stage.includes('data-yaw="'+yaw+'"'),"Room camera angle ignored");
  assert.ok(!dom.includes("Unable to reconstruct research layout:"));
  const faces=[...dom.matchAll(/<polygon [^>]*points="([^"]+)"/g)].map(m=>m[1]);
  assert.ok(faces.length>=30&&faces.every(v=>!v.includes("NaN")&&!v.includes("Infinity")),"Invalid visible room geometry");
  assert.ok(dom.includes('data-instance="chair"')&&dom.includes('data-instance="rug"'),"Source object instances missing");
  assert.ok(dom.includes("two")||dom.includes("2 deliberately omitted attachments"),"Incomplete room disclaimer disappeared");
  assert.ok(dom.includes('data-omitted-instance="lumbar-pillow"')&&dom.includes('data-omitted-instance="shelf-books"'),"Unpositioned parent links not displayed");
  return {yaw,faces:faces.length,digest:crypto.createHash("sha256").update(faces.join("|")).digest("hex")};
 }finally{fs.rmSync(profile,{recursive:true,force:true});}
}
const first=sample(130),second=sample(-45);
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
const report={schema_version:1,status:"passed",artwork_approved:false,original_accepted_room_render:false,partial_placed_instances:6,unplaced_instances:2,cameras:[first,second]};
fs.writeFileSync(path.join(output,"room-report.json"),JSON.stringify(report,null,2)+"\n");
console.log("Partial Reading Corner Chrome QA: 6/8 authored instances with distinct camera projections, byte-exact release assets; no gallery approval.");
