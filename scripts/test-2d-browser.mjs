import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {spawnSync} from "node:child_process";
import {pathToFileURL} from "node:url";

const root=path.resolve(import.meta.dirname,"..");
const source=path.join(root,"scenes","mirror-vector-motion-study.html");
const html=fs.readFileSync(source,"utf8");
assert.ok(html.includes("../runtime/timeline-lite.js"));
assert.ok(!/https?:\/\/(?!www\.w3\.org\/2000\/svg)/.test(html),"Unexpected external resources");
assert.ok(!/gsap|__HYPERFRAMES_RENDERER__|\bprivate\b/i.test(html),"Source was not cleansed");

const probe=`<script>
(() => {
  const result=(ok,message)=>{document.body.dataset.qaResult=ok?"passed":"failed";document.body.dataset.qaDetail=message;};
  try {
    const ctl=window.sceneologyTimeline;
    if(!ctl||typeof ctl.seek!=="function")throw Error("Timeline controller absent");
    const head=document.querySelector("#princess-rig .head");
    const eyes=document.querySelector("#princess-rig .eyes");
    const reflection=document.querySelector("#mirror-reflection");
    const stage=document.querySelector("#stage");
    if(!head||!eyes||!reflection?.children.length||!stage)throw Error("Layered rig or reflected clone absent");
    ctl.pause().seek(0);
    const headBefore=head.style.transform;
    ctl.seek(2.4);
    const headAfter=head.style.transform;
    if(!headBefore||headBefore===headAfter)throw Error("Articulation remained static");
    ctl.seek(4.58);
    const blink=eyes.style.transform;
    if(!blink.includes("scaleY(")||blink.includes("scaleY(1)"))throw Error("Blink interpolation absent");
    const size=stage.getBoundingClientRect();
    if(size.width<20||size.height<20||size.width>innerWidth+1||size.height>innerHeight+1)throw Error("Stage clips out of viewport");
    if(ctl.duration()<7.3)throw Error("Timeline duration truncated");
    result(true,"rig-clone, head-motion, blink, responsive-fit");
  } catch(e){result(false,String(e.message||e));}
})();
</script>`;
if(!html.includes("</body>"))throw Error("Invalid scene document");
const temp=path.join(root,"scenes","__sceneology-browser-probe.html");
const artifacts=path.join(root,"artifacts","2d-browser");
fs.mkdirSync(artifacts,{recursive:true});
fs.writeFileSync(temp,html.replace("</body>",probe+"</body>"));
const chrome=process.env.CHROME_BIN||"google-chrome";
const flags=["--headless=new","--no-sandbox","--disable-dev-shm-usage","--disable-background-networking","--virtual-time-budget=6000","--window-size=390,844"];
try {
 const profile=fs.mkdtempSync(path.join(os.tmpdir(),"sceneology-motion-"));
 try {
  const run=spawnSync(chrome,[...flags,"--user-data-dir="+profile,"--dump-dom",pathToFileURL(temp).href],{encoding:"utf8",timeout:90000,maxBuffer:12*1024*1024});
  fs.writeFileSync(path.join(artifacts,"stderr.log"),run.stderr||"");
  fs.writeFileSync(path.join(artifacts,"dom.html"),run.stdout||"");
  if(run.error||run.status!==0)throw Error("Chrome failed: "+String(run.error||run.stderr).slice(-900));
  const match=run.stdout.match(/<body[^>]*data-qa-result="([^"]+)"[^>]*data-qa-detail="([^"]+)"/i);
  if(!match||match[1]!=="passed")throw Error("2D motion QA failed: "+(match?.[2]||"no result"));
  const file=path.join(artifacts,"motion-mobile.png");
  const capture=spawnSync(chrome,[...flags,"--user-data-dir="+profile+"-image","--screenshot="+file,pathToFileURL(temp).href],{encoding:"utf8",timeout:90000});
  if(capture.error||capture.status!==0)throw Error("Screenshot process failed");
  const png=fs.readFileSync(file);
  if(png.length<5000||png.subarray(0,8).toString("hex")!=="89504e470d0a1a0a")throw Error("PNG missing");
  console.log("Sceneology archived 2D SVG browser QA passed: "+match[2]+"; "+png.length+" PNG bytes.");
  console.log("Evidence is behavioral and software-rendered; artistic acceptance and exact tween parity remain unverified.");
 } finally {
  fs.rmSync(profile,{recursive:true,force:true});
  fs.rmSync(profile+"-image",{recursive:true,force:true});
 }
} finally {fs.rmSync(temp,{force:true});}
