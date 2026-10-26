import {spawnSync} from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import crypto from "node:crypto";

const root=path.resolve(import.meta.dirname,"..");
const base=process.env.SCENEOLOGY_SITE_URL;
if(!base || !/^https:\/\//.test(base))throw Error("HTTPS deployment URL required");
const urlBase=base.endsWith("/")?base:base+"/";
const outDir=path.join(root,"artifacts","live-site");
fs.mkdirSync(outDir,{recursive:true});
const sha=bytes=>crypto.createHash("sha256").update(bytes).digest("hex");
const paths=[
 "index.html","site/main.js","site/style.css","catalog/library.json","catalog/showcase.json",
 "ontology/schemas/scene-v1.schema.json","runtime/timeline-lite.js",
 "experiments/backyard-daynight-legacy-webgl2.html",
 "experiments/backyard-outline-inverted-hull-rejected.html",
 "experiments/backyard-outline-screen-space-v2.html",
 "experiments/backyard-rain-wind-archival.html",
 "experiments/backyard-snow-archival.html",
 "scenes/mirror-vector-motion-study.html"
];
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function getWithRetries(rel){
 let error;
 for(let attempt=0;attempt<6;attempt++){
  try{
   const request=new URL(rel,urlBase);
   request.searchParams.set("ci",process.env.GITHUB_SHA||"test");
   const response=await fetch(request,{cache:"no-store",signal:AbortSignal.timeout(16000)});
   if(!response.ok)throw Error("HTTP "+response.status);
   return Buffer.from(await response.arrayBuffer());
  }catch(e){error=e;if(attempt<5)await wait(3500);}
 }
 throw Error("Could not fetch "+rel+": "+String(error));
}
const report={base:urlBase,status:"unknown",verified_files:[],browser:[],limitations:["Automated screenshots are not a human artistic review. Browser smoke does not measure GPU or guarantee keyboard accessibility."]};
try{
 for(const rel of paths){
  const expected=fs.readFileSync(path.join(root,rel));
  const received=await getWithRetries(rel);
  if(!expected.equals(received))throw Error("Deployed bytes differ: "+rel+" ("+sha(expected)+" != "+sha(received)+")");
  report.verified_files.push({path:rel,bytes:expected.length,sha256:sha(received)});
 }
 const lib=JSON.parse(fs.readFileSync(path.join(root,"catalog/library.json"),"utf8"));
 const selected=JSON.parse(fs.readFileSync(path.join(root,"catalog/showcase.json"),"utf8"));
 if(!Array.isArray(lib.records)||!Array.isArray(selected.approved_ids))throw Error("Malformed gallery catalogs");
 if(selected.approved_ids.some(id=>!lib.records.find(entry=>entry.id===id)))throw Error("Unknown gallery record");
 const chrome=process.env.CHROME_BIN||"google-chrome";
 for(const viewport of [{name:"desktop",width:1280,height:900},{name:"mobile",width:390,height:844}]){
  const profile=fs.mkdtempSync(path.join(os.tmpdir(),"sceneology-live-"));
  const flags=["--headless=new","--no-sandbox","--disable-dev-shm-usage","--disable-background-networking","--virtual-time-budget=8000","--window-size="+viewport.width+","+viewport.height,"--user-data-dir="+profile];
  try{
   const run=spawnSync(chrome,[...flags,"--dump-dom",urlBase],{encoding:"utf8",timeout:90000,maxBuffer:12*1024*1024});
   if(run.error||run.status!==0)throw Error("Chrome "+viewport.name+": "+String(run.error||run.stderr).slice(-700));
   const dom=run.stdout;
   fs.writeFileSync(path.join(outDir,viewport.name+".dom.html"),dom);
   if(!dom.includes('id="gallery"'))throw Error("Gallery container absent in "+viewport.name);
   if(selected.approved_ids.length===0){
    if(!dom.includes("No works have been selected for the public showcase yet."))throw Error("Gallery empty-state did not render in "+viewport.name);
   }else if(dom.includes("The gallery could not be loaded."))throw Error("Gallery failed to load");
   const png=path.join(outDir,viewport.name+".png");
   const screenshot=spawnSync(chrome,[...flags.slice(0,-1),"--user-data-dir="+profile+"-capture","--screenshot="+png,urlBase],{encoding:"utf8",timeout:90000});
   if(screenshot.error||screenshot.status!==0)throw Error("Screenshot failed "+viewport.name);
   const bytes=fs.readFileSync(png);
   if(bytes.length<=5000||bytes.subarray(0,8).toString("hex")!=="89504e470d0a1a0a")throw Error("Invalid screenshot "+viewport.name);
   report.browser.push({viewport:viewport.name,requested_size:viewport.width+"x"+viewport.height,dom_updated:true,screenshot_bytes:bytes.length});
  }finally{fs.rmSync(profile,{recursive:true,force:true});fs.rmSync(profile+"-capture",{recursive:true,force:true});}
 }
 report.status="passed";
}catch(e){report.status="failed";report.failure=String(e.message||e);process.exitCode=1;}
fs.writeFileSync(path.join(outDir,"report.json"),JSON.stringify(report,null,2)+"\n");
console.log("Sceneology Pages live verification: "+report.status);
console.log("Exact deployed resources: "+report.verified_files.length);
for(const b of report.browser)console.log(b.viewport+" browser: DOM+PNG "+b.screenshot_bytes+" bytes");
if(report.failure)console.error(report.failure);
