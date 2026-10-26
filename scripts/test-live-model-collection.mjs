import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {spawnSync} from "node:child_process";

const root=path.resolve(import.meta.dirname,"..");
const base=process.env.SCENEOLOGY_SITE_URL;
if(!base||!/^https:\/\//.test(base))throw Error("Expected deployed HTTPS Pages URL");
const dir=path.join(root,"artifacts","model-site");
fs.mkdirSync(dir,{recursive:true});
const source=JSON.parse(fs.readFileSync(path.join(root,"catalog/expanded-source-index.json"),"utf8"));
const library=JSON.parse(fs.readFileSync(path.join(root,"catalog/library.json"),"utf8"));
const allowed=JSON.parse(fs.readFileSync(path.join(root,"catalog/showcase.json"),"utf8"));
const byId=new Map(library.records.map(x=>[x.id,x]));
const chosen=allowed.approved_ids.map(x=>byId.get(x)).filter(x=>x?.kind==="object");
const familyCount=new Set(source.models.map(x=>x.category+"|"+x.id.replace(/-v\d+(?:\.\d+)*(?:r)?$/,""))).size;
assert.ok(chosen.length>0&&familyCount>0,"No approved objects or candidate models");
const resources=["site/models.html","site/models.js","catalog/expanded-source-index.json"];
for(const rel of resources){
 const url=new URL(rel,base.endsWith("/")?base:base+"/");
 url.searchParams.set("revision",process.env.GITHUB_SHA||"verify");
 const response=await fetch(url,{cache:"no-store",signal:AbortSignal.timeout(18000)});
 assert.equal(response.status,200,"Deployed model resource: "+rel);
 const actual=Buffer.from(await response.arrayBuffer());
 const local=fs.readFileSync(path.join(root,rel));
 assert.ok(actual.equals(local),"Deployed model source mismatch: "+rel);
}
const chrome=process.env.CHROME_BIN||"google-chrome";
const flags=["--headless=new","--no-sandbox","--disable-dev-shm-usage","--disable-background-networking","--no-first-run",
 "--virtual-time-budget=10000","--window-size=1260,850"];
const profile=fs.mkdtempSync(path.join(os.tmpdir(),"sceneology-model-site-"));
const address=new URL("site/models.html",base.endsWith("/")?base:base+"/").href;
try{
 const run=spawnSync(chrome,[...flags,"--user-data-dir="+profile,"--dump-dom",address],{encoding:"utf8",timeout:110000,maxBuffer:24*1024*1024});
 if(run.error||run.status!==0)throw Error("Model-browser Chrome DOM failed: "+String(run.error||run.stderr).slice(-450));
 const dom=run.stdout;
 fs.writeFileSync(path.join(dir,"models.dom.html"),dom);
 const featured=(dom.match(/<article class="model featured">/g)||[]).length;
 const research=(dom.match(/<article class="model">/g)||[]).length;
 assert.equal(featured,chosen.length,"Featured gallery model-card count differs from owner-selected list");
 assert.equal(research,familyCount,"Technical model family list incomplete");
 assert.ok(!dom.includes("Featured models could not be loaded."),"Featured models fetch failed");
 assert.ok(!dom.includes("The model collection could not be loaded."),"Model index fetch failed");
 for(const record of chosen){
   if(!dom.includes('src="../'+record.thumbnail+'"'))throw Error("Actual approved model thumbnail omitted: "+record.id);
   if(!dom.includes('href="../'+record.viewer+'"'))throw Error("Approved model viewer omitted: "+record.id);
 }
 const image=path.join(dir,"models-desktop.png");
 const capture=spawnSync(chrome,[...flags,"--user-data-dir="+profile+"-capture","--screenshot="+image,address],{encoding:"utf8",timeout:110000});
 if(capture.error||capture.status!==0)throw Error("Model site screenshot failed");
 const png=fs.readFileSync(image);
 if(png.length<6000||png.subarray(0,8).toString("hex")!=="89504e470d0a1a0a")throw Error("Model page screenshot invalid");
 fs.writeFileSync(path.join(dir,"report.json"),JSON.stringify({status:"passed",approved_models:featured,versioned_model_families:research,screenshot_bytes:png.length,limit:"Browser DOM and screenshots do not constitute owner aesthetic approval."},null,2)+"\n");
 console.log("Sceneology live model collection passed: "+featured+" featured approved models, "+research+" indexed source families.");
} finally {
 fs.rmSync(profile,{recursive:true,force:true});
 fs.rmSync(profile+"-capture",{recursive:true,force:true});
}
