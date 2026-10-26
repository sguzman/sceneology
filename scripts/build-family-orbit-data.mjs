import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import {parseParts,parseMaterials} from "./build-family-previews.mjs";
import {localRigid,composeRigid,transformPoint} from "./rigid-transform.mjs";
const root=path.resolve(import.meta.dirname,"..");
const manifest=JSON.parse(fs.readFileSync(path.join(root,"catalog/accepted-family-sources.json"),"utf8"));
assert.equal(manifest.items.length,30);
const sha=b=>crypto.createHash("sha1").update(Buffer.from("blob "+b.length+"\0")).update(b).digest("hex");
const shapes=[[0,1,2,3],[0,4,5,1],[1,5,6,2],[2,6,7,3],[3,7,4,0],[4,7,6,5]];
const results=[];
for(const item of manifest.items){
 const bytes=fs.readFileSync(path.join(root,item.public_path));
 assert.equal(sha(bytes),item.sha,"Changed model source "+item.key);
 assert.equal(item.new_renderer_visual_approval,false);
 const source=bytes.toString("utf8"),parts=parseParts(source),materials=parseMaterials(source);
 const cache=new Map();
 function world(id,visiting=new Set()){
  if(cache.has(id))return cache.get(id);
  const p=parts.get(id);
  assert.ok(p&&!visiting.has(id),"Invalid constructive part parent "+id);
  const local=localRigid(p.translate,p.rotate);
  const result=p.parent?composeRigid(world(p.parent,new Set([...visiting,id])),local):local;
  cache.set(id,result);return result;
 }
 const faces=[];
 for(const p of parts.values()){
  if(!p.geometry)continue;
  const color=materials.get(p.colorRef);
  assert.match(color||"",/^#[0-9a-f]{6}$/i,"Missing source material "+p.id);
  const g=p.geometry;
  let bw,bd,tw,td,h;
  if(g.kind==="cuboid"){assert.equal(g.size?.length,3);[bw,h,bd]=g.size;tw=bw;td=bd;}
  else if(g.kind==="tapered_box"){assert.equal(g.bottom?.length,2);assert.equal(g.top?.length,2);[bw,bd]=g.bottom;[tw,td]=g.top;h=g.height;}
  else throw Error("Unsupported source primitive "+p.id);
  assert.ok([bw,bd,tw,td,h].every(x=>Number.isFinite(x)&&x>0));
  const corners=[[-bw/2,-h/2,-bd/2],[bw/2,-h/2,-bd/2],[bw/2,-h/2,bd/2],[-bw/2,-h/2,bd/2],
   [-tw/2,h/2,-td/2],[tw/2,h/2,-td/2],[tw/2,h/2,td/2],[-tw/2,h/2,td/2]]
   .map(v=>transformPoint(world(p.id),v));
  assert.ok(corners.every(v=>v.length===3&&v.every(Number.isFinite)),"Nonfinite geometry "+p.id);
  for(const [faceId,indices] of shapes.entries()){
   faces.push({part:p.id,index:faceId,color,vertices:indices.map(i=>corners[i].map(n=>Number(n.toFixed(6))))});
  }
 }
 assert.ok(faces.length>=6,"No model geometry "+item.key);
 results.push({key:item.key,family:item.family,source_sha:item.sha,faces});
}
const output={schema_version:1,generated_from:"exact Git-blob-verified accepted-family source files",review_only:true,
 renderer_equivalent_to_source:false,automatic_gallery_approval:false,models:results};
const destination=path.join(root,"site/family-orbit-data.json");
fs.writeFileSync(destination,JSON.stringify(output)+"\n");
console.log("Sceneology: emitted 30 exact-source technical orbit models; all remain unapproved reconstructed presentations.");
