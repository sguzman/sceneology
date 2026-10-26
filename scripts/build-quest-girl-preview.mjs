import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root=path.resolve(import.meta.dirname,"..");
const file=path.join(root,"characters/quest-girl-v7.json");
const source=JSON.parse(fs.readFileSync(file,"utf8"));
assert.equal(source.id,"quest-girl-v7");
assert.equal(source.accepted_visual_baseline,true);
assert.equal(source.parts.length,44);
const out=path.join(root,"site/generated/quest-girl-v7.svg");
const I=[[1,0,0],[0,1,0],[0,0,1]];
const add=(a,b)=>a.map((v,i)=>v+b[i]),sub=(a,b)=>a.map((v,i)=>v-b[i]);
const dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0);
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const unit=v=>v.map(x=>x/Math.hypot(...v));
const mm=(a,b)=>a.map(row=>b[0].map((_,j)=>row.reduce((s,v,k)=>s+v*b[k][j],0)));
const mv=(m,v)=>m.map(row=>dot(row,v));
const radians=a=>a*Math.PI/180;
function rot(deg){
 const [x,y,z]=(deg||[0,0,0]).map(radians);
 const cx=Math.cos(x),sx=Math.sin(x),cy=Math.cos(y),sy=Math.sin(y),cz=Math.cos(z),sz=Math.sin(z);
 const rx=[[1,0,0],[0,cx,-sx],[0,sx,cx]];
 const ry=[[cy,0,sy],[0,1,0],[-sy,0,cy]];
 const rz=[[cz,-sz,0],[sz,cz,0],[0,0,1]];
 return mm(rz,mm(ry,rx));
}
const all=new Map(source.parts.map(p=>[p.id,p]));
const cache=new Map();
function world(id,parents=new Set()){
 if(cache.has(id))return cache.get(id);
 assert.ok(!parents.has(id),"Character hierarchy cycle: "+id);
 const part=all.get(id);assert.ok(part,"Missing referenced body part "+id);
 const localRot=rot(part.transform?.rotate_deg);
 let result={pos:part.transform?.translate||[0,0,0],rotation:localRot};
 if(part.parent){
  const pp=all.get(part.parent),pw=world(part.parent,new Set([...parents,id]));
  const aa=part.attachment||{};
  let delta=part.transform?.translate||[0,0,0];
  if(aa.parent_anchor){
   const anchor=pp.anchors?.[aa.parent_anchor],child=part.anchors?.[aa.child_anchor];
   assert.ok(anchor&&child,"Unresolved SC3D anchor "+id);
   delta=add(delta,sub(add(anchor,aa.offset||[0,0,0]),mv(localRot,child)));
  }
  result={pos:add(pw.pos,mv(pw.rotation,delta)),rotation:mm(pw.rotation,localRot)};
 }
 cache.set(id,result);return result;
}
const eye=unit([.60,.45,-.73]),right=unit([.78,0,.63]),up=unit(cross(right,eye)),light=unit([.45,.88,-.32]);
const color=(hex,factor)=>{
 const n=parseInt(hex.slice(1),16);
 return "#"+[n>>16,(n>>8)&255,n&255].map(v=>Math.min(255,Math.max(0,Math.round(v*factor+6))).toString(16).padStart(2,"0")).join("");
};
const faces=[];
for(const part of source.parts){
 const g=part.geometry;if(!g?.kind)continue;
 assert.ok(source.materials[part.material],"Unknown character material "+part.id);
 let bw,bd,tw,td,h;
 if(g.kind==="cuboid"||g.kind==="wedge"){
  [bw,h,bd]=g.size;tw=bw;td=bd;
 }else if(g.kind==="tapered_box"){
  [bw,bd]=g.bottom;[tw,td]=g.top;h=g.height;
 }else throw Error("Unsupported admitted shape "+g.kind);
 assert.ok([bw,bd,tw,td,h].every(x=>Number.isFinite(x)&&x>0),"Invalid shape "+part.id);
 const v=[
  [-bw/2,-h/2,-bd/2],[bw/2,-h/2,-bd/2],[bw/2,-h/2,bd/2],[-bw/2,-h/2,bd/2],
  [-tw/2,h/2,-td/2],[tw/2,h/2,-td/2],[tw/2,h/2,td/2],[-tw/2,h/2,td/2]
 ].map(pt=>{const t=world(part.id);return add(t.pos,mv(t.rotation,pt))});
 for(const indices of [[0,4,5,1],[1,5,6,2],[2,6,7,3],[3,7,4,0],[4,7,6,5]]){
  const verts=indices.map(i=>v[i]);
  const normal=unit(cross(sub(verts[1],verts[0]),sub(verts[2],verts[0])));
  if(dot(normal,eye)<.05)continue;
  const factor=.59+.41*Math.max(0,dot(normal,light));
  faces.push({verts,depth:dot(verts.reduce((a,b)=>add(a,b),[0,0,0]).map(x=>x/4),eye),fill:color(source.materials[part.material],factor),stroke:color(source.materials[part.material],factor*.76)});
 }
}
assert.ok(faces.length>70,"Unexpectedly sparse character output");
const pts=faces.flatMap(f=>f.verts.map(v=>[dot(v,right),-dot(v,up)]));
const xs=pts.map(v=>v[0]),ys=pts.map(v=>v[1]);
const bounds=[Math.min(...xs),Math.max(...xs),Math.min(...ys),Math.max(...ys)];
const scale=Math.min(540/(bounds[1]-bounds[0]),660/(bounds[3]-bounds[2]));
const ox=360-(bounds[0]+bounds[1])*scale/2,oy=410-(bounds[2]+bounds[3])*scale/2;
const svg=['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 820" role="img" aria-label="Static Quest Girl v7 source-derived character geometry">',
 '<defs><linearGradient id="background" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#e8e8ee"/><stop offset="1" stop-color="#c9ccd8"/></linearGradient></defs>',
 '<rect width="720" height="820" fill="url(#background)"/>','<ellipse cx="360" cy="720" rx="205" ry="29" fill="#59616b" opacity=".11"/>'];
faces.sort((a,b)=>a.depth-b.depth);
for(const f of faces){
 const p=f.verts.map(v=>(ox+dot(v,right)*scale).toFixed(1)+","+(oy-dot(v,up)*scale).toFixed(1)).join(" ");
 svg.push('<polygon points="'+p+'" fill="'+f.fill+'" stroke="'+f.stroke+'" stroke-width=".65" stroke-linejoin="round"/>');
}
svg.push("</svg>");
fs.mkdirSync(path.dirname(out),{recursive:true});
fs.writeFileSync(out,svg.join("\n")+"\n");
console.log("Quest Girl v7: generated "+faces.length+" visible source-based faces from "+source.parts.length+" body parts; wedge geometry approximated as cuboids.");
