import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import {localRigid,composeRigid,transformPoint} from "./rigid-transform.mjs";

const root=path.resolve(import.meta.dirname,"..");
const manifest=JSON.parse(fs.readFileSync(path.join(root,"catalog/accepted-family-sources.json"),"utf8"));
assert.equal(manifest.schema_version,1);
assert.equal(manifest.items.length,30);
const output=path.join(root,"site","family-previews");
fs.mkdirSync(output,{recursive:true});

const vector=s=>s.split(",").map(Number);
const property=(s,key)=>{
 const m=s.match(new RegExp("(?:^|[\\s,{])"+key+"\\s*:\\s*(\\[[^\\]]+\\]|[^,}\\n]+)"));
 return m?m[1].trim():null;
};
const numberArray=(s,key,defaultValue)=>{
 const v=property(s,key);
 return v?v.startsWith("[")?vector(v.slice(1,-1)):null:defaultValue;
};
const add=(a,b)=>a.map((v,i)=>v+b[i]);
const sub=(a,b)=>a.map((v,i)=>v-b[i]);
const dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0);
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const unit=a=>{const n=Math.hypot(...a);assert.ok(n>0);return a.map(v=>v/n);};
function parseParts(source){
 const raw=source.slice(source.indexOf("\nparts:\n")+7);
 assert.ok(raw.length>0&&source.includes("\nparts:\n"),"No parts section");
 const end=raw.search(/^\S[^\n]*:\s*$/m);
 const content=end>=0?raw.slice(0,end):raw;
 const starts=[...content.matchAll(/^  ([a-z][a-z0-9_]*):[^\n]*$/gm)];
 assert.ok(starts.length>1,"Missing part definitions");
 const parts=new Map();
 for(let i=0;i<starts.length;i++){
  const id=starts[i][1],start=starts[i].index+starts[i][0].length,end=i+1<starts.length?starts[i+1].index:content.length;
  const lines=content.slice(start,end);
  const field=(key)=>lines.match(new RegExp("^    "+key+":\\s*(.+)$","m"))?.[1]?.trim()||null;
  const kind=property(lines,"kind");
  let geometry=null;
  if(kind){
   if(!["cuboid","tapered_box"].includes(kind))throw Error("Unsupported constructive shape "+kind+" in "+id);
   geometry={kind,size:numberArray(lines,"size",null),bottom:numberArray(lines,"bottom",null),top:numberArray(lines,"top",null),height:property(lines,"height")?Number(property(lines,"height")):null};
  }
  const colorRef=field("material");
  let transform=[0,0,0],degrees=[0,0,0];
  const transformSection=lines.match(/^    transform:\s*(\{[^\n]*\})?\s*$/m);
  if(transformSection){
    const after=lines.slice(transformSection.index+transformSection[0].length);
    const scope=transformSection[1]||after.split(/\n    [a-z][a-z_]*:/)[0];
    transform=numberArray(scope,"translate",[0,0,0])||[0,0,0];
    degrees=numberArray(scope,"rotate_deg",[0,0,0])||[0,0,0];
  }
  const parent=field("parent")?.replace(/[,'"]+/g,"")||null;
  parts.set(id,{id,parent:parent==="null"?null:parent,geometry,colorRef,translate:transform,rotate:degrees});
 }
 return parts;
}
function parseMaterials(source){
 const chunk=source.split("\nmaterials:\n")[1]?.split("\nasset:\n")[0];
 assert.ok(chunk,"No material table");
 const names=[...chunk.matchAll(/^  ([a-z][a-z0-9_]*):\s*$/gm)];
 const table=new Map();
 for(let i=0;i<names.length;i++){
  const current=names[i],body=chunk.slice(current.index+current[0].length,i+1<names.length?names[i+1].index:chunk.length);
  const color=body.match(/base_color:\s*["']?(#[a-fA-F0-9]{6})/)?.[1];
  if(color)table.set(current[1],color);
 }
 return table;
}
function projectArtifact(source,identity,minimumFaces=8){
 const parts=parseParts(source),materials=parseMaterials(source);
 const transforms=new Map();
 function world(id,visiting=new Set()){
  if(transforms.has(id))return transforms.get(id);
  assert.ok(parts.has(id)&&!visiting.has(id),"Parent missing/cyclic: "+id);
  const p=parts.get(id);
  // Rotation matrices compose in hierarchy order; Euler angles cannot simply be added.
  const local=localRigid(p.translate,p.rotate);
  let t=local;
  if(p.parent){
    const parent=world(p.parent,new Set([...visiting,id]));
    t=composeRigid(parent,local);
  }
  transforms.set(id,t);return t;
 }
 const camera=unit([.65,.58,-.75]),right=unit([.75,0,.65]),up=unit(cross(right,camera)),light=unit([.50,.92,-.38]);
 const shade=(hex,factor)=>{const n=parseInt(hex.slice(1),16);return"#"+[n>>16,n>>8&255,n&255].map(v=>Math.min(255,Math.max(0,Math.round(v*factor+7))).toString(16).padStart(2,"0")).join("");};
 const faces=[];
 for(const p of parts.values()){
  if(!p.geometry)continue;
  assert.ok(p.colorRef&&materials.has(p.colorRef),"Unknown material "+p.colorRef+" in "+p.id);
  const g=p.geometry;let bw,bd,tw,td,h;
  if(g.kind==="cuboid"){assert.equal(g.size?.length,3);[bw,h,bd]=g.size;tw=bw;td=bd;}
  else {assert.equal(g.bottom?.length,2);assert.equal(g.top?.length,2);[bw,bd]=g.bottom;[tw,td]=g.top;h=g.height;}
  assert.ok([bw,bd,tw,td,h].every(x=>Number.isFinite(x)&&x>0),"Invalid primitive dimensions "+p.id);
  const verts=[[-bw/2,-h/2,-bd/2],[bw/2,-h/2,-bd/2],[bw/2,-h/2,bd/2],[-bw/2,-h/2,bd/2],
    [-tw/2,h/2,-td/2],[tw/2,h/2,-td/2],[tw/2,h/2,td/2],[-tw/2,h/2,td/2]]
   .map(v=>transformPoint(world(p.id),v));
  // Include the underside: a rotated lamp head can face the camera from below.
  for(const [faceIndex,indices] of [[0,1,2,3],[0,4,5,1],[1,5,6,2],[2,6,7,3],[3,7,4,0],[4,7,6,5]].entries()){
   const vs=indices.map(i=>verts[i]);
   const normal=unit(cross(sub(vs[1],vs[0]),sub(vs[2],vs[0])));
   if(dot(normal,camera)<.08)continue;
   const f=.58+.42*Math.max(0,dot(normal,light));
   faces.push({partId:p.id,faceIndex,vs,depth:dot(vs.reduce((a,b)=>add(a,b),[0,0,0]).map(v=>v/4),camera),color:shade(materials.get(p.colorRef),f),stroke:shade(materials.get(p.colorRef),f*.78)});
  }
 }
 assert.ok(faces.length>=minimumFaces,"Sparse SVG geometry "+identity);
 const pts=faces.flatMap(f=>f.vs.map(v=>[dot(v,right),-dot(v,up)])),xs=pts.map(v=>v[0]),ys=pts.map(v=>v[1]);
 const minX=Math.min(...xs),maxX=Math.max(...xs),minY=Math.min(...ys),maxY=Math.max(...ys);
 const scale=Math.min(710/(maxX-minX||1),400/(maxY-minY||1)),ox=480-(minX+maxX)*scale/2,oy=300-(minY+maxY)*scale/2;
 faces.sort((a,b)=>a.depth-b.depth);
 const svg=['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 640" role="img" aria-label="Source-derived '+identity+' preview">',
 '<defs><linearGradient id="bg" x2="0" y2="1"><stop stop-color="#edf2f2"/><stop offset="1" stop-color="#cfdbdc"/></linearGradient></defs>',
 '<rect width="960" height="640" fill="url(#bg)"/>'];
 // Rugs are the ground-contact surface itself: a detached floating shadow misrepresents them.
 if(!identity.endsWith("-rug"))svg.push('<ellipse cx="480" cy="535" rx="225" ry="27" fill="#778995" opacity=".12"/>');
 for(const f of faces)svg.push('<polygon data-part="'+f.partId+'" data-face="'+f.faceIndex+'" points="'+f.vs.map(v=>(ox+dot(v,right)*scale).toFixed(1)+","+(oy-dot(v,up)*scale).toFixed(1)).join(" ")+'" fill="'+f.color+'" stroke="'+f.stroke+'" stroke-width=".65" stroke-linejoin="round"/>');
 svg.push("</svg>");
 return{svg:svg.join("\n")+"\n",polygons:faces.length,parts:[...parts.values()].filter(p=>p.geometry).length};
}
for(const record of manifest.items){
 const pathIn=path.join(root,record.public_path),bytes=fs.readFileSync(pathIn);
 const sourceSha=crypto.createHash("sha1").update(Buffer.from("blob "+bytes.length+"\0")).update(bytes).digest("hex");
 assert.equal(sourceSha,record.sha,"Family source modified without review: "+record.key);
 assert.equal(record.new_renderer_visual_approval,false,"New renderer was auto-approved");
 const result=projectArtifact(bytes.toString("utf8"),record.key,record.family==="rugs"?3:record.family==="pillows"?5:8);
 if(record.key==="task-lamp")assert.match(result.svg,/<polygon data-part="emitter" data-face="0"/,"The task lamp's source-defined downward-facing emitter must be visible");
 const name=path.basename(record.public_path,".sc3d.yml")+".svg";
 fs.writeFileSync(path.join(output,name),result.svg);
 console.log(record.key+": "+result.parts+" authored shapes, "+result.polygons+" source-derived preview faces (review-only)");
}
console.log("Sceneology: generated "+manifest.items.length+" accepted-source family candidates; no new gallery approvals.");
