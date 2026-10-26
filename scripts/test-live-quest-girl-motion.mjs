import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {spawnSync} from "node:child_process";
const root=path.resolve(import.meta.dirname,"..");
const base=process.env.SCENEOLOGY_SITE_URL;
assert.ok(base?.startsWith("https://"),"Expected HTTPS deployed Sceneology");
const baseUrl=base.endsWith("/")?base:base+"/";
const spec=JSON.parse(fs.readFileSync(path.join(root,"characters/quest-girl-motion-v0.2.json"),"utf8"));
const selected=JSON.parse(fs.readFileSync(path.join(root,"catalog/showcase.json"),"utf8"));
assert.equal(spec.clips.length,4);
assert.equal(spec.artistic_approval,false);
assert.ok(!selected.approved_ids.includes("quest-girl-v7-motion-v0-2"));
const files=["characters/quest-girl-motion.html","characters/quest-girl-motion-v0.2.json",
 "characters/quest-girl-v7.json","site/quest-girl-motion-lab.js","site/quest-girl-motion-sampler.mjs"];
async function same(rel){
 let last;
 for(let i=0;i<5;i++){
  try{
   const u=new URL(rel,baseUrl);u.searchParams.set("revision",process.env.GITHUB_SHA||"live");
   const response=await fetch(u,{cache:"no-store",signal:AbortSignal.timeout(14000)});
   assert.equal(response.status,200,"Unavailable player resource "+rel);
   assert.ok(Buffer.from(await response.arrayBuffer()).equals(fs.readFileSync(path.join(root,rel))),"Deployed player byte drift "+rel);
   return;
  }catch(e){last=e;if(i<4)await new Promise(r=>setTimeout(r,2800));}
 }
 throw last;
}
for(const rel of files)await same(rel);
const output=path.join(root,"artifacts/live-quest-girl-motion");
fs.mkdirSync(output,{recursive:true});
const chrome=process.env.CHROME_BIN||"google-chrome";
const args=["--headless=new","--no-sandbox","--disable-dev-shm-usage","--disable-background-networking",
 "--no-first-run","--window-size=1180,950","--virtual-time-budget=7000"];
const profile=fs.mkdtempSync(path.join(os.tmpdir(),"sceneology-questgirl-"));
const url=new URL("characters/quest-girl-motion.html",baseUrl).href;
try{
 const run=spawnSync(chrome,[...args,"--user-data-dir="+profile,"--dump-dom",url],
  {encoding:"utf8",timeout:100000,maxBuffer:24*1024*1024});
 if(run.error||run.status!==0)throw Error("Quest Girl browser failed: "+String(run.error||run.stderr).slice(-700));
 const dom=run.stdout;
 fs.writeFileSync(path.join(output,"motion.dom.html"),dom);
 const errorStatus=dom.match(/id="motion-status"[^>]*>([^<]*)</)?.[1]||"";
 if(errorStatus.startsWith("Motion rendering failed")||errorStatus.startsWith("Unable to load"))
  throw Error("Character renderer reported: "+errorStatus);
 assert.ok(/id="motion-stage"[^>]*data-clip="idle-soft"[^>]*data-rendered="true"/.test(dom),
  "Headless Chrome did not actually paint idle clip");
 assert.ok((dom.match(/<polygon /g)||[]).length>=70,"Motion player geometry missing");
 assert.ok(!/<polygon[^>]*points="[^"]*(?:NaN|Infinity)/i.test(dom),"Animated polygons contain nonfinite projected coordinates");
 assert.ok(dom.includes("not aesthetic approval"),"Motion source review boundary omitted");
 assert.ok(!dom.includes("Unable to load character motion"),"Motion player load failed");
 const pngPath=path.join(output,"motion-desktop.png");
 const shot=spawnSync(chrome,[...args,"--user-data-dir="+profile+"-screenshot","--screenshot="+pngPath,url],
  {encoding:"utf8",timeout:100000});
 if(shot.error||shot.status!==0)throw Error("Motion screenshot capture failed");
 const png=fs.readFileSync(pngPath);
 assert.ok(png.length>6000&&png.subarray(0,8).toString("hex")==="89504e470d0a1a0a");
 console.log("Quest Girl motion live Chrome: source parity, 44-part animated draw and screenshot passed; no gallery promotion.");
}finally{
 fs.rmSync(profile,{recursive:true,force:true});
 fs.rmSync(profile+"-screenshot",{recursive:true,force:true});
}
