// Generate *review-only* browser screenshots. Never alters showcase approvals.
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {spawnSync} from "node:child_process";
import {pathToFileURL} from "node:url";

const root=path.resolve(import.meta.dirname,"..");
const output=path.join(root,"artifacts","curation-review");
fs.mkdirSync(output,{recursive:true});
const candidates=JSON.parse(fs.readFileSync(path.join(root,"docs/curation-candidates.json"),"utf8"));
const library=JSON.parse(fs.readFileSync(path.join(root,"catalog/library.json"),"utf8"));
const showcase=JSON.parse(fs.readFileSync(path.join(root,"catalog/showcase.json"),"utf8"));
assert.equal(candidates.schema_version,1);
assert.equal(candidates.purpose,"owner-review-only");
assert.equal(candidates.automatic_exhibition,false);
assert.ok(Array.isArray(candidates.ids)&&candidates.ids.length>0);
assert.equal(new Set(candidates.ids).size,candidates.ids.length);
assert.ok(Array.isArray(showcase.approved_ids));
const byId=new Map(library.records.map(r=>[r.id,r]));
const chrome=process.env.CHROME_BIN||"google-chrome";
const flags=[
 "--headless=new","--no-sandbox","--enable-webgl","--enable-unsafe-swiftshader",
 "--use-angle=swiftshader","--disable-dev-shm-usage","--disable-background-networking",
 "--no-first-run","--no-default-browser-check","--window-size=1280,800",
 "--virtual-time-budget=5500"
];
const escapeHtml=s=>String(s).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;");
const expectedStatus={
 "backyard-daynight-legacy-webgl2":{id:"dn-status",phrase:"181 archived geometry parts"},
 "backyard-outline-screen-space-v2":{id:"sl-status",phrase:"181 archival parts"},
 "backyard-rain-wind-archival":{id:"rain-status",phrase:"181 archival geometry parts"},
 "backyard-snow-archival":{id:"snow-status",phrase:"181 archival geometry parts"}
};
const captures=[];
function run(args,name){
 const r=spawnSync(chrome,args,{encoding:"utf8",timeout:100000,maxBuffer:14*1024*1024});
 fs.writeFileSync(path.join(output,name+".stderr.txt"),r.stderr||"");
 if(r.error||r.status!==0)throw Error(name+": Chrome error "+(r.error?.message||r.stderr?.slice(-700)));
 return r.stdout;
}
let failed=false;
for(const id of candidates.ids){
 const rec=byId.get(id),spec=expectedStatus[id];
 assert.ok(rec&&spec,"Unrecognized/unregistered candidate "+id);
 assert.ok(!["failed","blocked"].includes(rec.status),"Rejected candidate nominated: "+id);
 assert.ok(!showcase.approved_ids.includes(id),"Review artifact must not impersonate an already published exhibit: "+id);
 assert.ok(/^experiments\/[a-z0-9._/-]+\.html$/.test(rec.viewer),"Unreviewed candidate path: "+id);
 const file=path.join(root,rec.viewer);
 assert.ok(fs.statSync(file).isFile());
 const uri=pathToFileURL(file).href;
 const profile=fs.mkdtempSync(path.join(os.tmpdir(),"sceneology-curate-"));
 const result={id,title:rec.title,kind:rec.kind,status:rec.status,summary:rec.summary,viewer:rec.viewer,limitations:rec.limitations,approved:false};
 try{
  const dom=run([...flags,"--user-data-dir="+profile,"--dump-dom",uri],id+"-dom");
  const match=dom.match(new RegExp('<[^>]+id=["\\\x27]'+spec.id+'["\\\x27][^>]*>([^<]+)<',"i"));
  if(!match||!match[1].includes(spec.phrase))throw Error("First-draw status missing for "+id);
  const image=path.join(output,id+".png");
  run([...flags,"--user-data-dir="+profile+"-capture","--screenshot="+image,uri],id+"-image");
  const raw=fs.readFileSync(image);
  if(raw.length<5000||raw.subarray(0,8).toString("hex")!=="89504e470d0a1a0a")throw Error("Missing real framebuffer: "+id);
  result.screenshot=id+".png";
  result.capture_bytes=raw.length;
  result.first_draw_status=match[1].trim();
  result.capture="passed";
 }catch(e){result.capture="failed";result.error=String(e.message||e);failed=true;}
 finally{fs.rmSync(profile,{recursive:true,force:true});fs.rmSync(profile+"-capture",{recursive:true,force:true});}
 captures.push(result);
}
const cards=captures.map(c=>'<article><figure>'+(
 c.screenshot?'<img src="'+escapeHtml(c.screenshot)+'" alt="Actual headless-browser capture of '+escapeHtml(c.title)+'">':'<p>Capture failed</p>'
 )+'</figure><h2>'+escapeHtml(c.title)+'</h2><p>'+escapeHtml(c.summary)+'</p><p class="meta">ID: <code>'+escapeHtml(c.id)+'</code> · Technical status: '+escapeHtml(c.status)+' · Review-only</p><p>'+escapeHtml(c.limitations)+'</p><p><a href="https://sguzman.github.io/sceneology/'+escapeHtml(c.viewer)+'">Open live viewer</a></p></article>').join("\n");
const page=`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Sceneology · owner review contact sheet</title><style>
body{font:16px/1.55 system-ui;background:#f3f4f5;color:#172534;margin:0;padding:28px;max-width:1380px;margin-inline:auto}
header{max-width:1000px;margin:0 auto 25px}h1{font-size:clamp(1.6rem,4vw,2.5rem)}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,480px),1fr));gap:22px}
article{border:1px solid #bdc8d0;background:white;border-radius:12px;overflow:hidden;padding-bottom:20px}
article>h2,article>p{margin:12px 20px}figure{margin:0;min-height:220px;background:#e5e9ed}
img{display:block;width:100%;height:auto;object-fit:contain}a{color:#07598b}
.meta{font-size:.8rem;color:#52616f}footer{margin-top:25px;color:#52616f}
@media(prefers-reduced-motion:reduce){*{scroll-behavior:auto!important}}
</style><header><h1>Sceneology: owner visual review</h1>
<p>Browser-generated first-render captures of source-backed experiments. These are <strong>not gallery exhibits</strong>. No image indicates aesthetic acceptance, production quality, or owner approval. Links open the real live viewers. Gallery approval is a separate explicit decision.</p></header><main class="grid">${cards}</main>
<footer><p>Captured under headless Chrome software WebGL. Screenshots may contain viewer controls. Inspect animations and effects in the linked interactive viewers before judging them. Failed studies are retained separately in the research repository.</p></footer></html>`;
fs.writeFileSync(path.join(output,"index.html"),page);
fs.writeFileSync(path.join(output,"manifest.json"),JSON.stringify({
 schema_version:1,review_only:true,approved_ids:showcase.approved_ids,candidates:captures,
 evidence_scope:"Chrome SwiftShader framebuffer screenshots, not aesthetic judgment"
},null,2)+"\n");
for(const c of captures)console.log(c.id+": "+c.capture+(c.error?" ("+c.error+")":""));
if(failed)process.exitCode=1;
else console.log("Owner review contact sheet: "+captures.length+" source-backed captures; no showcase changes.");
