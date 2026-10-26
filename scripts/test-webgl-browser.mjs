import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import assert from "node:assert/strict";

const root = path.resolve(import.meta.dirname, "..");
const runs = [
  { id:"daynight", file:"experiments/backyard-daynight-legacy-webgl2.html", statusId:"dn-status", errorId:"dn-error", ready:"181 archived geometry parts" },
  { id:"rejected-outline", file:"experiments/backyard-outline-inverted-hull-rejected.html", statusId:"sl-status", errorId:"sl-error", ready:"181 archival parts" },
  { id:"screen-outline", file:"experiments/backyard-outline-screen-space-v2.html", statusId:"sl-status", errorId:"sl-error", ready:"181 archival parts" },
  { id:"rain-wind", file:"experiments/backyard-rain-wind-archival.html", statusId:"rain-status", errorId:"rain-error", ready:"181 archival geometry parts" },
  { id:"snow", file:"experiments/backyard-snow-archival.html", statusId:"snow-status", errorId:"snow-error", ready:"181 archival geometry parts" }
];
const outDir = path.resolve(process.env.SCENEOLOGY_BROWSER_ARTIFACTS || path.join(root,"artifacts","browser-smoke"));
fs.mkdirSync(outDir, { recursive:true });
const chrome = process.env.CHROME_BIN || "google-chrome";
const flags = [
  "--headless=new", "--no-sandbox", "--enable-webgl", "--enable-unsafe-swiftshader",
  "--use-angle=swiftshader", "--disable-dev-shm-usage",
  "--disable-background-networking", "--no-first-run", "--no-default-browser-check",
  "--virtual-time-budget=5000", "--window-size=1160,900"
];
const elementText = (dom,id) => {
  const safe = id.replace(/[.*+?^$()|[\]{}]/g,"\\$&");
  const match = dom.match(new RegExp("<([a-zA-Z0-9]+)\\b[^>]*\\bid=[\\\"']"+safe+"[\\\"'][^>]*>([\\s\\S]*?)<\\/\\1>","i"));
  return match?.[2]?.replace(/<[^>]+>/g,"").trim() ?? "";
};
function execute(args,name){
  const result = spawnSync(chrome,args,{cwd:root,encoding:"utf8",timeout:85000,maxBuffer:12*1024*1024});
  fs.writeFileSync(path.join(outDir,name+".stderr.log"),result.stderr||"");
  if(result.error || result.status!==0) throw Error(name+": chrome exit "+result.status+" "+String(result.error||result.stderr).slice(-900));
  return result.stdout||"";
}
const report={browser:"headless Chrome with SwiftShader software WebGL",hardware_certified:false,visual_approval:false,results:[]};
let failure = false;
for(const test of runs){
  const item={id:test.id,status:"not-run",runtime_status:"",runtime_error:"",screenshot:""};
  report.results.push(item);
  try{
    const file=path.join(root,test.file);
    assert.ok(fs.statSync(file).isFile());
    const url=pathToFileURL(file).href;
    const profile=fs.mkdtempSync(path.join(os.tmpdir(),"sceneology-chrome-"));
    try{
      const dom=execute([...flags,"--user-data-dir="+profile,"--dump-dom",url],test.id);
      fs.writeFileSync(path.join(outDir,test.id+".dom.html"),dom);
      item.runtime_status=elementText(dom,test.statusId);
      item.runtime_error=elementText(dom,test.errorId);
      assert.ok(item.runtime_status.includes(test.ready), "First draw absent: "+item.runtime_status);
      assert.equal(item.runtime_error,"","Viewer reported a runtime error");
      const image=path.join(outDir,test.id+".png");
      execute([...flags,"--user-data-dir="+profile+"-capture","--screenshot="+image,url],test.id+"-capture");
      const bytes=fs.readFileSync(image);
      assert.ok(bytes.length>5000 && bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])),"Screenshot missing or invalid");
      item.screenshot=path.relative(root,image);
      item.status="passed";
    } finally {
      fs.rmSync(profile,{recursive:true,force:true});
      fs.rmSync(profile+"-capture",{recursive:true,force:true});
    }
  }catch(err){item.status="failed";item.failure=String(err.message||err);failure=true;}
}
fs.writeFileSync(path.join(outDir,"report.json"),JSON.stringify(report,null,2)+"\n");
for(const r of report.results) console.log(r.id+": "+r.status+" — "+(r.runtime_status||r.failure||"no status"));
if(failure)process.exitCode=1;
