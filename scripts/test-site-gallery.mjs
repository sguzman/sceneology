import assert from "node:assert/strict";
import fs from "node:fs";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import {spawn} from "node:child_process";

const root=path.resolve(import.meta.dirname,"..");
const chrome=process.env.CHROME_BIN||"google-chrome";
const selected=[
 {id:"fixture-selected-one",title:"Fixture One",kind:"scene",status:"experimental",
  summary:"Simple scene preview.",viewer:"scenes/fixture-one.html",
  thumbnail:"assets/fixture-one.svg",rights:"original",
  provenance:{public_source:"https://github.com/sguzman/sceneology/blob/main/index.html"}},
 {id:"fixture-selected-two",title:"Fixture Two",kind:"scene",status:"validated",
  summary:"Missing thumbnail must show a fallback.",viewer:"scenes/fixture-two.html",
  thumbnail:"assets/fixture-missing.png",rights:"original"},
 {id:"fixture-failed-hidden",title:"Hidden Rejected Specimen",kind:"experiment",
  status:"failed",summary:"Must not display.",viewer:"experiments/fixture-rejected.html",
  thumbnail:"assets/fixture-missing.png",rights:"original"}
];
let mode="approved";
const rootFiles=new Map([
 ["/catalog/library.json",()=>[JSON.stringify({schema_version:1,records:selected}),"application/json"]],
 ["/catalog/showcase.json",()=>[JSON.stringify({schema_version:1,approved_ids:mode==="approved"?selected.slice(0,2).map(x=>x.id):mode==="invalid"?[selected[2].id]:[]}),"application/json"]],
 ["/assets/fixture-one.svg",()=>['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480"><rect width="640" height="480" fill="#669999"/></svg>',"image/svg+xml"]],
 ["/scenes/fixture-one.html",()=>["<!doctype html><title>Fixture One Viewer</title>","text/html"]],
 ["/scenes/fixture-two.html",()=>["<!doctype html><title>Fixture Two Viewer</title>","text/html"]]
]);
const server=http.createServer((request,response)=>{
 const url=new URL(request.url,"http://localhost");
 const rel=url.pathname==="/"?"/index.html":url.pathname;
 if(rel.includes("..")){response.writeHead(400).end();return;}
 let body,mime;
 if(rootFiles.has(rel))([body,mime]=rootFiles.get(rel)());
 else if(["/index.html","/site/main.js","/site/style.css"].includes(rel)){
  body=fs.readFileSync(path.join(root,rel.slice(1)),"utf8");
  mime=rel.endsWith(".js")?"text/javascript":rel.endsWith(".css")?"text/css":"text/html";
 }else{response.writeHead(404).end();return;}
 response.writeHead(200,{"content-type":mime});response.end(body);
});
async function runChrome(url,label){
 const profile=fs.mkdtempSync(path.join(os.tmpdir(),"sceneology-gallery-"));
 try{
  const args=["--headless=new","--no-sandbox","--disable-dev-shm-usage",
   "--disable-background-networking","--no-first-run","--no-default-browser-check",
   "--virtual-time-budget=7000","--user-data-dir="+profile,"--dump-dom",url];
  return await new Promise((resolve,reject)=>{
   const child=spawn(chrome,args,{stdio:["ignore","pipe","pipe"]});
   let output="",error="";
   const timeout=setTimeout(()=>{child.kill("SIGKILL");reject(Error(label+": browser timeout"));},60000);
   child.stdout.on("data",d=>{output+=d.toString();if(output.length>12e6)child.kill("SIGKILL");});
   child.stderr.on("data",d=>{error+=d.toString().slice(-2000);});
   child.on("error",e=>{clearTimeout(timeout);reject(e);});
   child.on("close",code=>{clearTimeout(timeout);code===0?resolve(output):reject(Error(label+": Chrome exited "+code+" "+error.slice(-500)));});
  });
 }finally{fs.rmSync(profile,{recursive:true,force:true});}
}
await new Promise(resolve=>server.listen(0,"127.0.0.1",resolve));
const url="http://127.0.0.1:"+server.address().port+"/";
try{
 const good=await runChrome(url,"approved");
 assert.ok(good.includes('data-record-id="fixture-selected-one"'),"First approved item missing");
 assert.ok(good.includes('data-record-id="fixture-selected-two"'),"Second approved item missing");
 assert.ok(!good.includes('data-record-id="fixture-failed-hidden"'),"Failed work leaked to gallery");
 assert.ok(good.includes("Preview unavailable"),"Missing image fallback absent");
 assert.ok(good.includes("Technical status: experimental"),"Technical status is not disclosed");
 assert.ok(good.includes("Original public source"),"Public provenance link missing");
 assert.ok(good.includes('class="skip-link"'),"Keyboard skip link missing");

 mode="empty";
 const empty=await runChrome(url,"empty");
 assert.ok(empty.includes("No works have been selected for the public showcase yet."),"Empty gallery state broken");
 assert.ok(!empty.includes('data-record-id="fixture-selected-one"'),"Empty state leaked a technical catalog item");

 mode="invalid";
 const bad=await runChrome(url,"invalid");
 assert.ok(bad.includes("The gallery could not be loaded."),"Invalid failed approval did not fail closed");
 assert.ok(!bad.includes('data-record-id="fixture-failed-hidden"'),"Failed item displayed despite restriction");
 console.log("Sceneology gallery browser integration: approved fixtures, broken thumbnail fallback, empty state and failed-item exclusion passed.");
}finally{server.close();}
