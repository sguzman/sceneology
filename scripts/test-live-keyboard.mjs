import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {spawn} from "node:child_process";

const site=process.env.SCENEOLOGY_SITE_URL;
if(!site||!site.startsWith("https://"))throw Error("Expected live HTTPS Pages URL");
const root=path.resolve(import.meta.dirname,"..");
const dir=path.join(root,"artifacts","live-site");
fs.mkdirSync(dir,{recursive:true});
const profile=fs.mkdtempSync(path.join(os.tmpdir(),"sceneology-cdp-"));
const browser=spawn(process.env.CHROME_BIN||"google-chrome",[
 "--headless=new","--no-sandbox","--disable-dev-shm-usage","--no-first-run",
 "--remote-debugging-port=0","--remote-allow-origins=*","--user-data-dir="+profile,"about:blank"
],{stdio:["ignore","ignore","pipe"]});
let stderr="";
browser.stderr.on("data",d=>{stderr+=String(d).slice(-1000);});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const portFile=path.join(profile,"DevToolsActivePort");
let ws;
async function connect(){
 let port;
 for(let i=0;i<90;i++){
  if(fs.existsSync(portFile)){port=Number(fs.readFileSync(portFile,"utf8").split("\n")[0]);break;}
  if(browser.exitCode!==null)throw Error("Browser stopped: "+stderr.slice(-1000));
  await sleep(200);
 }
 if(!port)throw Error("DevTools port not ready");
 const list=await (await fetch("http://127.0.0.1:"+port+"/json/list")).json();
 const target=list.find(x=>x.type==="page");
 if(!target?.webSocketDebuggerUrl)throw Error("No debuggable page target");
 ws=new WebSocket(target.webSocketDebuggerUrl);
 await new Promise((resolve,reject)=>{
  ws.addEventListener("open",resolve,{once:true});
  ws.addEventListener("error",reject,{once:true});
 });
}
let next=0;
const pending=new Map();
function rpc(method,params={}){
 const id=++next;
 return new Promise((resolve,reject)=>{
  const timeout=setTimeout(()=>{pending.delete(id);reject(Error(method+" timed out"));},12000);
  pending.set(id,result=>{clearTimeout(timeout);result.error?reject(Error(JSON.stringify(result.error))):resolve(result.result);});
  ws.send(JSON.stringify({id,method,params}));
 });
}
const evaluate=async expression=>{
 const r=await rpc("Runtime.evaluate",{expression,returnByValue:true,awaitPromise:true});
 if(r.exceptionDetails)throw Error("Runtime evaluation failed: "+JSON.stringify(r.exceptionDetails).slice(0,500));
 return r.result?.value;
};
const key=async(name,code,vk)=>{
 await rpc("Input.dispatchKeyEvent",{type:"rawKeyDown",key:name,code,windowsVirtualKeyCode:vk,nativeVirtualKeyCode:vk});
 await rpc("Input.dispatchKeyEvent",{type:"keyUp",key:name,code,windowsVirtualKeyCode:vk,nativeVirtualKeyCode:vk});
};
const report={website:site,keyboard:{},mobile:{},status:"unknown"};
try{
 await connect();
 ws.addEventListener("message",event=>{
  let data;
  try{data=JSON.parse(event.data);}catch{return;}
  if(data.id && pending.has(data.id)){pending.get(data.id)(data);pending.delete(data.id);}
 });
 await rpc("Page.enable");await rpc("Runtime.enable");
 await rpc("Page.navigate",{url:site});
 const approved=JSON.parse(fs.readFileSync(path.join(root,"catalog/showcase.json"),"utf8")).approved_ids;
 let loaded=false;
 for(let i=0;i<50;i++){
  await sleep(500);
  const state=await evaluate("({text:document.querySelector('#gallery')?.textContent?.trim()||'',ids:[...document.querySelectorAll('#gallery [data-record-id]')].map(x=>x.dataset.recordId),images:[...document.querySelectorAll('#gallery img')].map(x=>({complete:x.complete,width:x.naturalWidth}))})");
  if(approved.length===0){
   if(state.text.includes("No works have been selected")){loaded=true;break;}
  }else if(state.ids.length===approved.length){
   await evaluate("([...document.querySelectorAll(\'#gallery img\')].forEach(img=>{img.loading=\'eager\'}),true)");
   const images=await evaluate("[...document.querySelectorAll(\'#gallery img\')].map(img=>({complete:img.complete,width:img.naturalWidth}))");
   if(images.length!==approved.length||images.some(img=>!img.complete||img.width<=0))continue;
   assert.deepEqual(state.ids,approved,"Live gallery order differs from the approved allowlist");
   loaded=true;break;
  }
 }
 assert.ok(loaded,"Live gallery did not render every approved work with real loaded thumbnails");

 if(approved.length>0){
  const items=JSON.parse(fs.readFileSync(path.join(root,"catalog/library.json"),"utf8")).records;
  const types=new Map(items.map(x=>[x.id,x.kind]));
  for(const kind of ["scene","object","character"]){
   const subset=approved.filter(id=>types.get(id)===kind);
   if(!subset.length)continue;
   const filtered=await evaluate("(()=>{const b=document.querySelector('#gallery-filters button[data-kind=\""+kind+"\"]');if(!b)return null;b.click();return {pressed:b.getAttribute('aria-pressed'),ids:[...document.querySelectorAll('#gallery [data-record-id]')].map(el=>el.dataset.recordId)}})()");
   assert.ok(filtered,"Gallery category filter unavailable: "+kind);
   assert.equal(filtered.pressed,"true","Gallery category filter not activated");
   assert.deepEqual(filtered.ids,subset,"Gallery category filter showed incorrect items: "+kind);
  }
  const all=await evaluate("(()=>{const b=document.querySelector('#gallery-filters button[data-kind=\"all\"]');if(!b)return null;b.click();return [...document.querySelectorAll('#gallery [data-record-id]')].map(el=>el.dataset.recordId)})()");
  assert.deepEqual(all,approved,"Gallery All filter failed to restore full exhibition");
  report.gallery_filters="passed";
 }

 await rpc("Runtime.evaluate",{expression:"document.activeElement?.blur?.()"});
 await key("Tab","Tab",9);
 report.keyboard.first_tab=await evaluate("document.activeElement?.className || ''");
 assert.ok(String(report.keyboard.first_tab).includes("skip-link"),"First Tab did not reach the skip link");
 await key("Enter","Enter",13);
 await sleep(200);
 report.keyboard.after_enter=await evaluate("document.activeElement?.id || ''");
 assert.equal(report.keyboard.after_enter,"main-content","Skip link did not move focus into main");
 await rpc("Emulation.setDeviceMetricsOverride",{width:390,height:844,deviceScaleFactor:1,mobile:true});
 await sleep(200);
 const metrics=await evaluate("({windowWidth:innerWidth,scrollWidth:document.documentElement.scrollWidth,viewportHeight:innerHeight,hasGallery:!!document.getElementById('gallery')})");
 report.mobile=metrics;
 assert.ok(metrics.hasGallery && metrics.scrollWidth<=metrics.windowWidth+1,"Mobile viewport has horizontal overflow");
 const capture=await rpc("Page.captureScreenshot",{format:"png",captureBeyondViewport:false});
 const bytes=Buffer.from(capture.data,"base64");
 assert.ok(bytes.length>5000 && bytes.subarray(0,8).toString("hex")==="89504e470d0a1a0a","Invalid mobile PNG");
 fs.writeFileSync(path.join(dir,"keyboard-mobile.png"),bytes);
 report.mobile.screenshot_bytes=bytes.length;
 report.status="passed";
}catch(e){report.status="failed";report.failure=String(e.message||e);process.exitCode=1;}
finally{
 fs.writeFileSync(path.join(dir,"keyboard-report.json"),JSON.stringify(report,null,2)+"\n");
 if(ws)ws.close();
 browser.kill("SIGTERM");
 try{fs.rmSync(profile,{recursive:true,force:true});}catch{}
}
console.log("Sceneology live keyboard/mobile CDP: "+report.status);
if(report.failure)console.error(report.failure);
else console.log(JSON.stringify({focus:report.keyboard,mobile:report.mobile}));
