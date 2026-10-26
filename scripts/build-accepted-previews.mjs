import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";

const root=path.resolve(import.meta.dirname,"..");
const index=JSON.parse(fs.readFileSync(path.join(root,"catalog/expanded-source-index.json"),"utf8"));
const out=path.join(root,"site/generated");
fs.mkdirSync(out,{recursive:true});
const nums=(value,fallback)=>{
 if(value===undefined||value===null||value==="-")return fallback.slice();
 const a=Array.isArray(value)?value:String(value).split(",");
 return a.map((v,i)=>Number.isFinite(Number(v))?Number(v):fallback[i]??0);
};
const add=(a,b)=>a.map((x,i)=>x+b[i]);
const sub=(a,b)=>a.map((x,i)=>x-b[i]);
const dot=(a,b)=>a.reduce((s,x,i)=>s+x*b[i],0);
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const unit=v=>v.map(x=>x/Math.hypot(...v));
function rotate(v,degrees){
 let [x,y,z]=v;
 const [ax,ay,az]=degrees.map(x=>x*Math.PI/180);
 let c=Math.cos(ax),s=Math.sin(ax);[y,z]=[y*c-z*s,y*s+z*c];
 c=Math.cos(ay);s=Math.sin(ay);[x,z]=[x*c+z*s,-x*s+z*c];
 c=Math.cos(az);s=Math.sin(az);return[x*c-y*s,x*s+y*c,z];
}
function tint(hex,factor){
 const n=parseInt(hex,16);
 return "#"+[n>>16,n>>8&255,n&255].map(c=>Math.max(0,Math.min(255,Math.round(c*factor+8))).toString(16).padStart(2,"0")).join("");
}
function build(data){
 const parts=data.parts.split("\n").filter(Boolean).map(line=>{
  const p=line.split("|");
  assert.ok(p.length===8||p.length===9,"Unexpected geometry line");
  return{group:Number(p[0]),id:p[1],parent:p[2],shape:p[3],size:p[4].split(",").map(Number),
   color:p[5],offset:nums(p[6],[0,0,0]),rotation:nums(p[7],[0,0,0]),scale:nums(p[8],[1,1,1])};
 });
 assert.equal(parts.length,data.geometry_count??data.mesh_count,"Geometry count drift");
 const lookup=new Map(parts.map(x=>[x.group+"|"+x.id,x]));
 function place(vertex,part){
  let v=vertex.slice(),current=part,depth=0;
  while(current&&depth++<12){
   v=add(rotate(v.map((x,i)=>x*current.scale[i]),current.rotation),current.offset);
   current=current.parent&&current.parent!=="-"?lookup.get(current.group+"|"+current.parent):null;
  }
  assert.ok(depth<13,"Part parent cycle");
  const g=data.groups[part.group]||{};
  return add(rotate(v.map((x,i)=>x*nums(g.scale,[1,1,1])[i]),nums(g.rotate_deg,[0,0,0])),nums(g.translate,[0,0,0]));
 }
 const camera=unit([.65,.62,-.75]),right=unit([.75,0,.65]),up=unit(cross(right,camera)),light=unit([.48,.91,-.4]);
 const faces=[];
 for(const part of parts){
  let dims=part.size;
  if(dims.some(x=>!Number.isFinite(x)||x<=0))continue;
  const [bw,bd,tw,td,height]=part.shape==="b"?[dims[0],dims[2],dims[0],dims[2],dims[1]]:dims;
  if(![bw,bd,tw,td,height].every(x=>Number.isFinite(x)&&x>0))continue;
  const corners=[[-bw/2,-height/2,-bd/2],[bw/2,-height/2,-bd/2],[bw/2,-height/2,bd/2],[-bw/2,-height/2,bd/2],
   [-tw/2,height/2,-td/2],[tw/2,height/2,-td/2],[tw/2,height/2,td/2],[-tw/2,height/2,td/2]].map(p=>place(p,part));
  for(const indices of [[0,4,5,1],[1,5,6,2],[2,6,7,3],[3,7,4,0],[4,7,6,5]]){
   const vertices=indices.map(i=>corners[i]);
   const normal=unit(cross(sub(vertices[1],vertices[0]),sub(vertices[2],vertices[0])));
   if(dot(normal,camera)<.08)continue;
   const factor=.57+.43*Math.max(0,dot(normal,light));
   faces.push({vertices,depth:dot(vertices.reduce((a,b)=>add(a,b),[0,0,0]).map(v=>v/4),camera),
    fill:tint(part.color,factor),stroke:tint(part.color,factor*.81)});
  }
 }
 assert.ok(faces.length>10,"Missing drawable geometry");
 const projected=faces.flatMap(face=>face.vertices.map(v=>[dot(v,right),-dot(v,up)]));
 const xs=projected.map(v=>v[0]),ys=projected.map(v=>v[1]);
 const minX=Math.min(...xs),maxX=Math.max(...xs),minY=Math.min(...ys),maxY=Math.max(...ys);
 const factor=Math.min(820/(maxX-minX||1),470/(maxY-minY||1));
 const dx=480-(minX+maxX)*factor/2,dy=315-(minY+maxY)*factor/2;
 const svg=['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 640" role="img" aria-label="Source-derived '+data.scene+' geometric preview">',
  '<defs><linearGradient id="sky" x2="0" y2="1"><stop stop-color="#e7ecec"/><stop offset="1" stop-color="#cddcdd"/></linearGradient></defs>',
  '<rect width="960" height="640" fill="url(#sky)"/>','<ellipse cx="480" cy="562" rx="300" ry="41" fill="#657982" opacity=".1"/>'];
 faces.sort((a,b)=>a.depth-b.depth);
 for(const face of faces){
  const points=face.vertices.map(v=>(dx+dot(v,right)*factor).toFixed(1)+","+(dy-dot(v,up)*factor).toFixed(1)).join(" ");
  svg.push('<polygon points="'+points+'" fill="'+face.fill+'" stroke="'+face.stroke+'" stroke-width=".45" stroke-linejoin="round"/>');
 }
 svg.push("</svg>");
 return svg.join("\n")+"\n";
}
for(const record of index.accepted_environments){
 assert.equal(record.artistic_status,"previously-owner-accepted");
 const file=path.join(root,"source-scenes",record.id+".json");
 const data=JSON.parse(fs.readFileSync(file,"utf8"));
 assert.equal(data.scene,record.id);
 const result=build(data);
 const dest=path.join(out,record.id+".svg");
 fs.writeFileSync(dest,result);
 console.log(record.id+": "+(result.match(/<polygon /g)||[]).length+" derived polygons");
}
console.log("Generated "+index.accepted_environments.length+" source-based previews; alternate renderings, not assertions of canonical renderer parity.");
