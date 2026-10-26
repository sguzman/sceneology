import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import {localRigid,composeRigid,transformPoint,applyBasis} from "./rigid-transform.mjs";
import {analyzeProxyGeometry} from "../site/room-geometry-audit.mjs";

const root=path.resolve(import.meta.dirname,"..");
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const original="scenes/composition-sources/reading-corner-occupancy-candidate.scene.yml";
const occupancyBytes=fs.readFileSync(path.join(root,original));
const gitSha=bytes=>crypto.createHash("sha1").update(Buffer.from("blob "+bytes.length+"\0")).update(bytes).digest("hex");
const sourceSha="c0a7fa68e804eddba895d5875ac9c735343de9d9";
assert.equal(gitSha(occupancyBytes),sourceSha,"Source owner character occupancy study changed");
const occupancySource=occupancyBytes.toString("utf8");
assert.match(occupancySource,/^status: human-review-candidate$/m);
assert.match(occupancySource,/^\s+environment_predecessor_status: accepted$/m);
assert.match(occupancySource,/^\s+character_status: accepted-static-character$/m);
const motion=occupancySource.split("\ncharacter:\n")[1]?.split("\nenvironment:\n")[0];
assert.ok(motion,"Missing authored static occupancy transform");
const vector=motion.match(/translate:\s*\[([^\]]+)\]\s*\n\s*rotate_y_deg:\s*(-?(?:\d+\.?\d*|\.\d+))/);
assert.ok(vector,"No literal authored character position/orientation");
const translation=vector[1].split(",").map(Number),yaw=Number(vector[2]);
assert.equal(translation.length,3);assert.ok(translation.every(Number.isFinite)&&Number.isFinite(yaw));
assert.deepEqual(translation,[.25,0,-1.02]);assert.equal(yaw,-8);
const sourceCharacter=read("characters/quest-girl-v7.json");
assert.equal(sourceCharacter.accepted_visual_baseline,true);
assert.equal(sourceCharacter.parts.length,44);
const model=read("site/family-orbit-data.json");
const reading=read("site/reading-corner-study-data.json");
assert.equal(reading.instances.length,6);
assert.equal(reading.gallery_approved,false);
assert.equal(model.models.length,30);
const registry=new Map(sourceCharacter.parts.map(part=>[part.id,part]));
assert.equal(registry.size,44);
const cache=new Map();
const add=(a,b)=>a.map((v,i)=>v+b[i]),sub=(a,b)=>a.map((v,i)=>v-b[i]);
function world(id,visited=new Set()){
 if(cache.has(id))return cache.get(id);
 const part=registry.get(id);
 assert.ok(part&&!visited.has(id),"Character hierarchy failed at "+id);
 const degrees=part.transform?.rotate_deg||[0,0,0];
 const position=part.transform?.translate||[0,0,0];
 const localRotation=localRigid([0,0,0],degrees);
 let localPosition=[...position];
 if(part.parent){
  const parent=registry.get(part.parent);
  const info=part.attachment||{};
  if(info.parent_anchor){
   const parentAnchor=parent?.anchors?.[info.parent_anchor],childAnchor=part.anchors?.[info.child_anchor];
   assert.ok(parentAnchor&&childAnchor,"Missing original rig anchor "+id);
   const rotatedChild=applyBasis(localRotation.basis,childAnchor);
   localPosition=add(localPosition,sub(add(parentAnchor,info.offset||[0,0,0]),rotatedChild));
  }
 }
 const local=localRigid(localPosition,degrees);
 const result=part.parent?composeRigid(world(part.parent,new Set([...visited,id])),local):local;
 cache.set(id,result);
 return result;
}
const quads=[[0,1,2,3],[0,4,5,1],[1,5,6,2],[2,6,7,3],[3,7,4,0],[4,7,6,5]];
const faces=[];
let wedgeCount=0,shapeCount=0;
for(const part of sourceCharacter.parts){
 const g=part.geometry;
 if(!g?.kind)continue;
 let bw,bd,tw,td,height;
 if(g.kind==="cuboid"||g.kind==="wedge"){
  [bw,height,bd]=g.size;tw=bw;td=bd;
  if(g.kind==="wedge")wedgeCount++;
 }else if(g.kind==="tapered_box"){
  [bw,bd]=g.bottom;[tw,td]=g.top;height=g.height;
 }else throw Error("Unsupported static character primitive "+part.id);
 assert.ok([bw,bd,tw,td,height].every(v=>Number.isFinite(v)&&v>0));
 const color=sourceCharacter.materials[part.material];
 assert.match(color||"",/^#[0-9a-f]{6}$/i,"Unresolved character material "+part.id);
 const vertices=[[-bw/2,-height/2,-bd/2],[bw/2,-height/2,-bd/2],[bw/2,-height/2,bd/2],[-bw/2,-height/2,bd/2],
  [-tw/2,height/2,-td/2],[tw/2,height/2,-td/2],[tw/2,height/2,td/2],[-tw/2,height/2,td/2]]
  .map(v=>transformPoint(world(part.id),v));
 for(const [id,indices] of quads.entries())faces.push({
  part:part.id,index:id,color,vertices:indices.map(i=>vertices[i].map(v=>Number(v.toFixed(6))))
 });
 shapeCount++;
}
assert.ok(shapeCount>35&&faces.length===shapeCount*6);
const character={key:"quest-girl-v7",source_sha:sourceCharacter.original_source_blob,faces};
const modelMap=new Map([...model.models.map(m=>[m.key,m]),[character.key,character]]);
const represented={id:"quest-girl",model_key:character.key,model_sha:character.source_sha,translate:translation,yaw_deg:yaw};
const geometry=analyzeProxyGeometry([...reading.instances,represented],modelMap);
const characterBounds=geometry.instances.find(item=>item.id==="quest-girl");
const rugBounds=geometry.instances.find(item=>item.id==="rug");
assert.ok(characterBounds&&rugBounds);
const offset=Number((characterBounds.origin_plane_min_y-rugBounds.origin_plane_max_y).toFixed(5));
const stage=occupancySource.split("\ncharacter_stage:\n")[1]?.split("\ncharacter:\n")[0];
assert.ok(stage);
const area=stage.match(/center:\s*\[([^\]]+)\][\s\S]*?size:\s*\[([^\]]+)\]/);
assert.ok(area);
const center=area[1].split(",").map(Number),size=area[2].split(",").map(Number);
assert.ok(center.length===2&&size.length===2);
const stageContainsAnchor=Math.abs(translation[0]-center[0])<=size[0]/2&&
 Math.abs(translation[2]-center[1])<=size[1]/2;
assert.equal(stageContainsAnchor,true,"Authored character origin falls outside authored stage");
const output={
 schema_version:1,study:"quest-girl-reading-corner-static-occupancy",
 historical_occupancy_proof_status:"human-review-candidate",
 original_occupancy_render_recovered:false,
 accepted_character_geometry_source:true,
 occupancy_approved:false,stage_contact_certified:false,scale_and_clearance_certified:false,
 room_geometry_complete:false,showcase_approved:false,
 source_scene:original,source_scene_sha:sourceSha,
 original_character_source_blob:sourceCharacter.original_source_blob,
 accepted_character_scope:"static character design only",
 character_mesh_approximation:wedgeCount?"original wedge primitives represented by cuboids; exact renderer parity not claimed":"none",
 wedge_parts_approximated:wedgeCount,
 character_source_part_count:sourceCharacter.parts.length,
 character_geometry_part_count:shapeCount,
 authored_character:{id:"quest-girl",translate:translation,yaw_deg:yaw,
  source_character_key:character.key,source_model_sha:character.source_sha,
  stage_contains_authored_origin:stageContainsAnchor},
 comparison:{
  proxy_floor_reference_only:true,
  character_mesh_min_y:characterBounds.origin_plane_min_y,
  rug_proxy_max_y:rugBounds.origin_plane_max_y,
  signed_character_bottom_minus_rug_top:offset,
  not_a_support_or_contact_verdict:true,
  possible_volume_overlaps:geometry.broad_phase_candidates.filter(p=>p.first==="quest-girl"||p.second==="quest-girl")
 },
 model:character
};
const dest=path.join(root,"site/reading-corner-occupancy-data.json");
fs.writeFileSync(dest,JSON.stringify(output)+"\n");
console.log("Sceneology occupancy research: 44 accepted character source parts; preserved author-specified transform, unknown rug contact; still awaiting original human visual approval.");
