import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {spawnSync} from "node:child_process";
import {pathToFileURL} from "node:url";

const root=path.resolve(import.meta.dirname,"..");
const dest=path.join(root,"artifacts","model-candidates");
fs.mkdirSync(dest,{recursive:true});
const published=path.join(root,"site","model-previews");
fs.mkdirSync(published,{recursive:true});
const names=["clock","projector","drone","cpu-cooler","graphics-card","motherboard","desk-fan","gramophone","rotary-telephone","sewing-machine","typewriter","case-fan","power-supply","pc-chassis","desktop-cpu","claw-machine","atx-power-cables","front-fan-carrier","front-fan-pwm-harness"];
const chrome=process.env.CHROME_BIN||"google-chrome";
const flags=["--headless=new","--no-sandbox","--disable-dev-shm-usage","--enable-webgl","--enable-unsafe-swiftshader",
 "--use-angle=swiftshader","--no-first-run","--disable-background-networking","--virtual-time-budget=5500","--window-size=1200,800"];
const report={source:"owner-authored standalone 3d model previews",renderer:"headless Chrome software graphics",artistic_approval_inferred:false,models:[]};
let failed=false;
for(const name of names){
 const file=path.join(root,"models",name+"-review.html");
 const profile=fs.mkdtempSync(path.join(os.tmpdir(),"sceneology-model-"));
 const result={name,status:"not-tested"};
 try{
  const src=fs.readFileSync(file,"utf8");
  if(/https?:\/\//.test(src)||/\bfetch\s*\(/.test(src))throw Error("Unscreened runtime dependency: "+name);
  const uri=pathToFileURL(file).href;
  const dom=spawnSync(chrome,[...flags,"--user-data-dir="+profile,"--dump-dom",uri],{encoding:"utf8",timeout:100000,maxBuffer:12*1024*1024});
  if(dom.error||dom.status!==0)throw Error("DOM render failed "+String(dom.error||dom.stderr).slice(-600));
  fs.writeFileSync(path.join(dest,name+".dom.html"),dom.stdout||"");
  if(!dom.stdout.includes("<canvas"))throw Error("No rendered canvas element");
  const visibleDom=dom.stdout.replace(/<script[^>]*>[^]*?<\/script>/gi,"").replace(/<style[^>]*>[^]*?<\/style>/gi,"");
  if(/<div[^>]*id="(?:failure|fail)"[^>]*style="[^"]*display:\s*(?:block|flex|grid|inline)[^"]*"[^>]*>/i.test(visibleDom))throw Error("Viewer displayed an active WebGL failure notice");
  const png=path.join(dest,name+".png");
  const capture=spawnSync(chrome,[...flags,"--user-data-dir="+profile+"-image","--screenshot="+png,uri],{encoding:"utf8",timeout:100000});
  if(capture.error||capture.status!==0)throw Error("Screenshot process failed "+String(capture.error||capture.stderr).slice(-600));
  const bytes=fs.readFileSync(png);
  if(bytes.length<7000||bytes.subarray(0,8).toString("hex")!=="89504e470d0a1a0a")throw Error("Invalid screenshot bytes");
  result.status="passed";result.capture_bytes=bytes.length;result.png=name+".png";
  if(name!=="clock")fs.copyFileSync(png,path.join(published,name+".png"));
 }catch(e){result.status="failed";result.error=String(e.message||e);failed=true;}
 finally{fs.rmSync(profile,{recursive:true,force:true});fs.rmSync(profile+"-image",{recursive:true,force:true});}
 report.models.push(result);
}
fs.writeFileSync(path.join(dest,"manifest.json"),JSON.stringify(report,null,2)+"\n");
for(const x of report.models)console.log("Model "+x.name+": "+x.status+(x.error?" / "+x.error:""));
if(failed)process.exitCode=1;
