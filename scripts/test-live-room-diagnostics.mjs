import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {spawnSync} from "node:child_process";

const root=path.resolve(import.meta.dirname,"..");
const base=process.env.SCENEOLOGY_SITE_URL;
assert.ok(base?.startsWith("https://"),"Expected actual HTTPS Pages deployment");
const baseUrl=base.endsWith("/")?base:base+"/";
const manifest=JSON.parse(fs.readFileSync(path.join(root,"site/room-previews/manifest.json"),"utf8"));
const gallery=JSON.parse(fs.readFileSync(path.join(root,"catalog/showcase.json"),"utf8"));
assert.equal(manifest.scenes.length,4);
assert.equal(manifest.artistic_approval,false);
assert.equal(manifest.geometry_reconstructed,false);
for(const scene of manifest.scenes)assert.ok(!gallery.approved_ids.includes(scene.id),"Room diagram incorrectly selected");
const paths=["site/room-recovery.html","site/room-recovery.js","site/room-previews/manifest.json","site/room-attachment-fit-audit.json",...manifest.scenes.map(s=>s.svg)];
async function exact(rel){
 let last;
 for(let trial=0;trial<5;trial++){
  try{
   const u=new URL(rel,baseUrl);u.searchParams.set("revision",process.env.GITHUB_SHA||"current");
   const response=await fetch(u,{cache:"no-store",signal:AbortSignal.timeout(14000)});
   assert.equal(response.status,200,"Missing deployed room diagnostic "+rel);
   const remote=Buffer.from(await response.arrayBuffer());
   const local=fs.readFileSync(path.join(root,rel));
   assert.ok(remote.equals(local),"Live room diagnostic has stale bytes "+rel);
   return;
  }catch(error){last=error;if(trial<4)await new Promise(resolve=>setTimeout(resolve,2500));}
 }
 throw last;
}
for(const rel of paths)await exact(rel);
const sourceFit=JSON.parse(fs.readFileSync(path.join(root,"site/room-attachment-fit-audit.json"),"utf8"));
assert.equal(sourceFit.original_asset_binding_recovered,false);
assert.equal(sourceFit.no_new_gallery_approval,true);
assert.equal(sourceFit.lumbar_pillow.chair_candidates.length,3);
assert.equal(sourceFit.lumbar_pillow.one_to_one_unscaled_fully_supported_by_any_candidate,false);
assert.equal(sourceFit.bed_pillow.bed_candidates.filter(x=>x.original_bed_contains_embedded_pillow&&x.original_bed_contains_embedded_blanket).length,3);
assert.equal(sourceFit.accepted_room_bedding_dependencies.length,2);
const out=path.join(root,"artifacts/live-room-review");
fs.mkdirSync(out,{recursive:true});
const profile=fs.mkdtempSync(path.join(os.tmpdir(),"sceneology-room-review-"));
const browser=process.env.CHROME_BIN||"google-chrome";
const flags=["--headless=new","--no-sandbox","--disable-dev-shm-usage","--disable-background-networking",
 "--no-first-run","--window-size=1280,850","--virtual-time-budget=6500"];
const url=new URL("site/room-recovery.html",baseUrl).href;
try{
 const run=spawnSync(browser,[...flags,"--user-data-dir="+profile,"--dump-dom",url],
  {encoding:"utf8",timeout:90000,maxBuffer:16*1024*1024});
 if(run.error||run.status!==0)throw Error("Live room DOM failed: "+String(run.error||run.stderr).slice(-800));
 const dom=run.stdout;
 fs.writeFileSync(path.join(out,"room-review.dom.html"),dom);
 assert.equal((dom.match(/<article class="room-card"/g)||[]).length,4,"Chrome did not render four rooms");
 for(const item of manifest.scenes)assert.ok(dom.includes('data-room-id="'+item.id+'"'),"Missing room "+item.id);
 assert.ok(dom.includes("zero newly rendered exhibitions"),"Missing source-only warning");
 const picture=path.join(out,"room-review-desktop.png");
 const capture=spawnSync(browser,[...flags,"--user-data-dir="+profile+"-image","--screenshot="+picture,url],
  {encoding:"utf8",timeout:90000});
 if(capture.error||capture.status!==0)throw Error("Live room screenshot failed");
 const png=fs.readFileSync(picture);
 assert.ok(png.length>5000&&png.subarray(0,8).toString("hex")==="89504e470d0a1a0a","No room screenshot");
 console.log("Room diagnostics: 4 rooms, 8 byte-identical live resources, staged source attachment-fit audit, actual Chrome DOM and screenshot, zero gallery changes.");
}finally{
 fs.rmSync(profile,{recursive:true,force:true});
 fs.rmSync(profile+"-image",{recursive:true,force:true});
}
