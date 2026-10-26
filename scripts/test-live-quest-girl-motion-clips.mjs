import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {spawnSync} from "node:child_process";
const site=process.env.SCENEOLOGY_SITE_URL;
assert.ok(site?.startsWith("https://"),"Expected deployed HTTPS URL");
const root=path.resolve(import.meta.dirname,"..");
const out=path.join(root,"artifacts/live-quest-girl-motion");
fs.mkdirSync(out,{recursive:true});
const spec=JSON.parse(fs.readFileSync(path.join(root,"characters/quest-girl-motion-v0.2.json"),"utf8"));
assert.equal(spec.artistic_approval,false);
const chrome=process.env.CHROME_BIN||"google-chrome";
const flags=["--headless=new","--no-sandbox","--disable-dev-shm-usage","--disable-background-networking","--no-first-run","--window-size=1200,900","--virtual-time-budget=5500"];
const clips=["idle-soft","look-around","small-wave","step-in-place"];
const digests=new Set(),results=[];
for(const id of clips){
 const profile=fs.mkdtempSync(path.join(os.tmpdir(),"sceneology-clip-"));
 const url=new URL("characters/quest-girl-motion.html",site.endsWith("/")?site:site+"/");
 url.searchParams.set("clip",id);url.searchParams.set("phase","0.26");
 try{
  const run=spawnSync(chrome,[...flags,"--user-data-dir="+profile,"--dump-dom",url.href],{encoding:"utf8",timeout:90000,maxBuffer:24*1024*1024});
  if(run.error||run.status!==0)throw Error(id+" Chrome failed: "+String(run.error||run.stderr).slice(-600));
  const dom=run.stdout;
  fs.writeFileSync(path.join(out,id+".dom.html"),dom);
  const stage=dom.match(/<div id="motion-stage"[^>]*>/)?.[0]||"";
  assert.ok(stage.includes('data-clip="'+id+'"')&&stage.includes('data-rendered="true"'),"Clip did not render "+id);
  const time=Number(stage.match(/data-frame-time="([^"]+)"/)?.[1]);
  const faces=[...dom.matchAll(/<polygon [^>]*points="([^"]+)"/g)].map(match=>match[1]);
  assert.ok(Number.isFinite(time)&&time>0&&faces.length>=70,"Missing nonzero source-based character pose "+id);
  const hash=crypto.createHash("sha256").update(faces.join("|")).digest("hex");
  digests.add(hash);results.push({id,seconds:time,faces:faces.length,geometry_digest:hash});
 }finally{fs.rmSync(profile,{recursive:true,force:true});}
}
assert.equal(digests.size,4,"Four distinct technical motion poses are required");
const profile=fs.mkdtempSync(path.join(os.tmpdir(),"sceneology-wave-shot-"));
try{
 const file=path.join(out,"small-wave-desktop.png");
 const url=new URL("characters/quest-girl-motion.html",site.endsWith("/")?site:site+"/");
 url.searchParams.set("clip","small-wave");url.searchParams.set("phase","0.26");
 const shot=spawnSync(chrome,[...flags,"--user-data-dir="+profile,"--screenshot="+file,url.href],{encoding:"utf8",timeout:90000});
 if(shot.error||shot.status!==0)throw Error("Small-wave screenshot failed");
 const data=fs.readFileSync(file);
 assert.ok(data.length>6500&&data.subarray(0,8).toString("hex")==="89504e470d0a1a0a","Invalid clip PNG");
}finally{fs.rmSync(profile,{recursive:true,force:true});}
fs.writeFileSync(path.join(out,"all-clips-report.json"),JSON.stringify({schema_version:1,artistic_approval:false,status:"passed",clips:results},null,2)+"\n");
console.log("Sceneology four motion clips: Chrome rendered four distinct technical poses with original parameter values; still no artistic approval.");
