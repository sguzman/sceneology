import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {spawnSync} from "node:child_process";
import {pathToFileURL} from "node:url";

const root=path.resolve(import.meta.dirname,"..");
const manifest=JSON.parse(fs.readFileSync(path.join(root,"catalog/accepted-family-sources.json"),"utf8"));
assert.equal(manifest.items.length,30);
const destination=path.join(root,"artifacts","accepted-family-review");
fs.mkdirSync(destination,{recursive:true});
const browser=process.env.CHROME_BIN||"google-chrome";
const report={schema_version:1,review_only:true,software_renderer:true,artistic_approval:false,captures:[]};
for(const model of manifest.items){
 const svg=path.join(root,"site","family-previews",path.basename(model.public_path,".sc3d.yml")+".svg");
 const source=fs.readFileSync(svg,"utf8");
 assert.ok(source.startsWith("<svg"),"Invalid SVG "+model.key);
 const polygons=(source.match(/<polygon /g)||[]).length;
 if(model.family==="rugs")assert.ok(!source.includes("<ellipse "),"Invented detached shadow beneath a floor rug");
 if(model.key==="task-lamp")assert.match(source,/<polygon data-part="emitter" data-face="0"/,"Downward emitter face missing from task lamp preview");
 assert.ok(polygons>=(model.family==="rugs"?3:model.family==="pillows"?5:8),"Sparse geometric preview "+model.key);
 const withoutSvgNamespace=source.replace('xmlns="http://www.w3.org/2000/svg"',"");
 assert.ok(!/<(?:image|foreignObject|script)\b|https?:\/\//i.test(withoutSvgNamespace),"External asset in generated review preview");
 const file=path.join(destination,model.key+".png");
 const profile=fs.mkdtempSync(path.join(os.tmpdir(),"sceneology-family-"));
 try {
  const args=[browser,"--headless=new","--no-sandbox","--disable-dev-shm-usage","--disable-background-networking",
   "--no-first-run","--window-size=960,640","--virtual-time-budget=2000",
   "--user-data-dir="+profile,"--screenshot="+file,pathToFileURL(svg).href];
  const run=spawnSync(args[0],args.slice(1),{encoding:"utf8",timeout:90000});
  if(run.status!==0||run.error)throw Error("Chrome failed "+model.key+": "+String(run.error||run.stderr).slice(-500));
  const png=fs.readFileSync(file);
  assert.ok(png.length>5000&&png.subarray(0,8).toString("hex")==="89504e470d0a1a0a","Empty browser PNG "+model.key);
  report.captures.push({id:model.key,source_blob:model.sha,polygons,screenshot:model.key+".png",png_bytes:png.length,visual_judgment:"pending"});
  console.log("Family review "+model.key+": "+polygons+" polygons, captured "+png.length+" bytes");
 }finally{fs.rmSync(profile,{recursive:true,force:true});}
}
fs.writeFileSync(path.join(destination,"manifest.json"),JSON.stringify(report,null,2)+"\n");
console.log("Sceneology accepted-family visual review bundle: "+report.captures.length+" source-derived screenshots; gallery unchanged.");
