import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {spawn} from "node:child_process";

const root=path.resolve(import.meta.dirname,"..");
const site=process.env.SCENEOLOGY_SITE_URL;
assert.ok(site?.startsWith("https://"),"Actual deployed HTTPS URL required");
const base=site.endsWith("/")?site:site+"/";
const spec=JSON.parse(fs.readFileSync(path.join(root,"characters/quest-girl-motion-v0.2.json"),"utf8"));
const showcase=JSON.parse(fs.readFileSync(path.join(root,"catalog/showcase.json"),"utf8"));
assert.equal(spec.clips.length,4);
assert.equal(spec.artistic_approval,false);
assert.ok(!showcase.approved_ids.includes("quest-girl-v7-motion-v0-2"));
const out=path.join(root,"artifacts/live-quest-girl-motion");
fs.mkdirSync(out,{recursive:true});
const profile=fs.mkdtempSync(path.join(os.tmpdir(),"sceneology-motion-cdp-"));
const browser=spawn(process.env.CHROME_BIN||"google-chrome",[
 "--headless=new","--no-sandbox","--disable-dev-shm-usage","--no-first-run",
 "--disable-background-networking","--remote-debugging-port=0","--remote-allow-origins=*",
 "--user-data-dir="+profile,"about:blank"
],{stdio:["ignore","ignore","pipe"]});
let stderr="";
browser.stderr.on("data",d=>{stderr=(stderr+String(d)).slice(-3500);});
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
let ws=null,seq=0;
const pending=new Map();
function rpc(method,params={}){
 const id=++seq;
 return new Promise((resolve,reject)=>{
  const timer=setTimeout(()=>{pending.delete(id);reject(Error("CDP timeout "+method));},15000);
  pending.set(id,response=>{clearTimeout(timer);response.error?reject(Error(JSON.stringify(response.error))):resolve(response.result);});
  ws.send(JSON.stringify({id,method,params}));
 });
}
async function evaluate(expression){
 const response=await rpc("Runtime.evaluate",{expression,returnByValue:true,awaitPromise:true});
 if(response.exceptionDetails)throw Error("Runtime error "+JSON.stringify(response.exceptionDetails).slice(0,700));
 return response.result?.value;
}
async function connect(){
 const filename=path.join(profile,"DevToolsActivePort");
 let port;
 for(let i=0;i<90;i++){
  if(fs.existsSync(filename)){port=Number(fs.readFileSync(filename,"utf8").split("\n")[0]);break;}
  if(browser.exitCode!==null)throw Error("Chrome exited "+stderr);
  await sleep(180);
 }
 assert.ok(port,"Chrome DevTools port never appeared");
 const list=await (await fetch("http://127.0.0.1:"+port+"/json/list")).json();
 const page=list.find(item=>item.type==="page");
 assert.ok(page?.webSocketDebuggerUrl);
 ws=new WebSocket(page.webSocketDebuggerUrl);
 await new Promise((resolve,reject)=>{
  ws.addEventListener("open",resolve,{once:true});
  ws.addEventListener("error",reject,{once:true});
 });
 ws.addEventListener("message",event=>{
  let data;
  try{data=JSON.parse(event.data);}catch{return;}
  if(data.id&&pending.has(data.id)){pending.get(data.id)(data);pending.delete(data.id);}
 });
 await rpc("Page.enable");await rpc("Runtime.enable");
}
const report={schema_version:1,website:site,status:"unknown",artistic_approval:false,clips:[],mobile:null};
try{
 await connect();
 await rpc("Page.navigate",{url:new URL("characters/quest-girl-motion.html",base).href});
 let ready=false;
 for(let i=0;i<55;i++){
  await sleep(300);
  const s=await evaluate("({ready:document.querySelector('#motion-stage')?.dataset.rendered,polygons:document.querySelectorAll('#motion-stage polygon').length,error:document.querySelector('#motion-status')?.textContent})");
  if(s.ready==="true"&&s.polygons>=70){ready=true;break;}
  if(s.error?.includes("Unable to load")||s.error?.includes("rendering failed"))throw Error(s.error);
 }
 assert.ok(ready,"Quest Girl did not render her first frame");
 assert.equal(await evaluate("(()=>{const b=document.getElementById('motion-toggle');b.click();return b.textContent})()"),"Play","Could not pause motion");
 async function pose(id,seconds){
  const motion=spec.clips.find(item=>item.id===id);
  assert.ok(motion,"Unknown motion "+id);
  const ratio=Math.round(seconds/motion.duration_seconds*1000);
  const expression="(()=>{"+
    "const selector=document.getElementById('motion-clip');"+
    "selector.value="+JSON.stringify(id)+";selector.dispatchEvent(new Event('change',{bubbles:true}));"+
    "const scrub=document.getElementById('motion-seek');scrub.value="+JSON.stringify(String(ratio))+";"+
    "scrub.dispatchEvent(new Event('input',{bubbles:true}));"+
    "const stage=document.getElementById('motion-stage');"+
    "return {clip:stage.dataset.clip,rendered:stage.dataset.rendered,seconds:Number(stage.dataset.frameTime),"+
    "polygons:stage.querySelectorAll('polygon').length,"+
    "shape:[...stage.querySelectorAll('polygon')].map(p=>p.getAttribute('points')).join('|'),"+
    "control:document.getElementById('motion-toggle').textContent};"+
    "})()";
  const observed=await evaluate(expression);
  assert.equal(observed.clip,id);
  assert.equal(observed.rendered,"true");
  assert.equal(observed.control,"Play");
  assert.ok(observed.polygons>=70);
  assert.ok(Math.abs(observed.seconds-seconds)<=motion.duration_seconds/1000+.004,"Unexpected sampled time "+id);
  return {...observed,shape_hash:crypto.createHash("sha256").update(observed.shape).digest("hex")};
 }
 const times={"idle-soft":1.2,"look-around":2.4,"small-wave":.52,"step-in-place":.69};
 for(const clip of spec.clips){
  const start=await pose(clip.id,0);
  const other=await pose(clip.id,times[clip.id]);
  if(start.shape_hash===other.shape_hash){
   report.debug={id:clip.id,zeroTime:start.seconds,sampleTime:other.seconds,shapeStart:start.shape.slice(0,120),shapeSample:other.shape.slice(0,120),zeroHash:start.shape_hash,sampleHash:other.shape_hash,polygonCount:start.polygons};
  }
  assert.notEqual(start.shape_hash,other.shape_hash,"Visible pose did not change for "+clip.id);
  const captured=await rpc("Page.captureScreenshot",{format:"png",captureBeyondViewport:false});
  const image=Buffer.from(captured.data,"base64");
  assert.ok(image.length>5000&&image.subarray(0,8).toString("hex")==="89504e470d0a1a0a");
  fs.writeFileSync(path.join(out,clip.id+"-scrub.png"),image);
  report.clips.push({id:clip.id,time:other.seconds,polygons:other.polygons,source_pose_hash:start.shape_hash,sampled_pose_hash:other.shape_hash,screenshot:clip.id+"-scrub.png"});
 }
 assert.equal(await evaluate("(()=>{const b=document.getElementById('motion-toggle');b.click();return b.textContent})()"),"Pause");
 assert.equal(await evaluate("(()=>{const b=document.getElementById('motion-toggle');b.click();return b.textContent})()"),"Play");
 await rpc("Emulation.setDeviceMetricsOverride",{width:390,height:844,deviceScaleFactor:1,mobile:true});
 await sleep(250);
 report.mobile=await evaluate("({windowWidth:innerWidth,scrollWidth:document.documentElement.scrollWidth,painted:document.querySelector('#motion-stage')?.dataset.rendered,hasSlider:!!document.getElementById('motion-seek')})");
 assert.ok(report.mobile.scrollWidth<=report.mobile.windowWidth+1,"Mobile motion page overflows");
 assert.equal(report.mobile.painted,"true");
 assert.equal(report.mobile.hasSlider,true);
 const screenshot=await rpc("Page.captureScreenshot",{format:"png",captureBeyondViewport:false});
 const png=Buffer.from(screenshot.data,"base64");
 assert.ok(png.length>5000);
 fs.writeFileSync(path.join(out,"motion-interactive-mobile.png"),png);
 report.status="passed";
}catch(error){
 report.status="failed";
 report.error=String(error.message||error);
 process.exitCode=1;
}finally{
 fs.writeFileSync(path.join(out,"interaction-report.json"),JSON.stringify(report,null,2)+"\n");
 if(ws)ws.close();
 browser.kill("SIGTERM");
 try{fs.rmSync(profile,{recursive:true,force:true});}catch{}
}
console.log("Sceneology all-four-clips interactive Chrome QA: "+report.status);
if(report.error)console.error(report.error);
else console.log(JSON.stringify({clips:report.clips.map(x=>({id:x.id,frames:x.polygons,time:x.time})),mobile:report.mobile}));
