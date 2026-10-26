import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {analyzeProxyGeometry} from "../site/room-geometry-audit.mjs";
const root=path.resolve(import.meta.dirname,"..");
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const data=read("site/room-clearance-audit.json");
const original=read("catalog/room-alias-candidates.json");
const showcase=read("catalog/showcase.json");
assert.equal(data.rooms.length,4);
assert.equal(data.explicitly_positioned_count,24);
assert.equal(data.omitted_parented_count,13);
assert.equal(data.geometry_accepted,false);
assert.equal(data.collision_clearance_accepted,false);
assert.equal(data.original_asset_bindings_certified,false);
assert.equal(showcase.approved_ids.length,24);
let count=0, omitted=0;
for(const room of data.rooms){
 assert.equal(room.source_variants_approved,false);
 const evidence=original.scenes.find(x=>x.id===room.room_id);
 assert.ok(evidence&&evidence.blob_sha===room.source_sha);
 const a=room.geometry;
 assert.equal(a.collision_confirmed,false);
 assert.equal(a.source_model_bindings_certified,false);
 assert.equal(a.geometry_role,"research-proxy-not-accepted-artwork");
 for(const item of a.instances){
  assert.ok(item.bbox.min.every(Number.isFinite)&&item.bbox.max.every(Number.isFinite));
  assert.ok(item.bbox.min.every((v,i)=>v<=item.bbox.max[i]));
  assert.ok(item.source_part_count>0);
 }
 for(const candidate of a.broad_phase_candidates){
  assert.ok(candidate.aabb_overlap.every(v=>v>0));
  assert.equal(candidate.collision_confirmed,false);
  assert.equal(candidate.broad_phase_only,true);
  assert.ok(a.instances.some(x=>x.id===candidate.first)&&a.instances.some(x=>x.id===candidate.second));
 }
 count+=a.instances.length;omitted+=room.omitted_parented.length;
}
assert.equal(count,24);assert.equal(omitted,13);
// Synthetic geometry: a box with known 3D extent, then separated and intersecting copies.
const cube={source_sha:"unit-fixture",faces:[
 {part:"solid",vertices:[[-.5,-.5,-.5],[.5,-.5,-.5],[.5,-.5,.5],[-.5,-.5,.5]]},
 {part:"solid",vertices:[[-.5,.5,-.5],[.5,.5,-.5],[.5,.5,.5],[-.5,.5,.5]]}
]};
const models=new Map([["fixture",cube]]);
const at=(id,x,z=0,yaw_deg=0)=>({id,model_key:"fixture",model_sha:"unit-fixture",translate:[x,0,z],yaw_deg});
const apart=analyzeProxyGeometry([at("a",0),at("b",2)],models);
assert.equal(apart.total_candidate_pairs,0);
assert.deepEqual(apart.instances[0].bbox.min,[-.5,-.5,-.5]);
const touching=analyzeProxyGeometry([at("a",0),at("b",1)],models);
assert.equal(touching.total_candidate_pairs,0,"Surface contact is not volumetric overlap");
const overlap=analyzeProxyGeometry([at("a",0),at("b",.35)],models);
assert.equal(overlap.total_candidate_pairs,1);
assert.equal(overlap.component_bbox_candidate_pairs,1);
assert.equal(overlap.broad_phase_candidates[0].collision_confirmed,false);
const rotated=analyzeProxyGeometry([at("a",0),at("b",1.15,0,45)],models);
assert.equal(rotated.total_candidate_pairs,1,"Rotated source placement must affect broad-phase extents");
assert.throws(()=>analyzeProxyGeometry([at("same",0),at("same",2)],models),/Duplicate/);
assert.throws(()=>analyzeProxyGeometry([at("bad",0)],new Map()),/mismatch/);
console.log("Sceneology conservative clearance QA passed: 24 original placements, 13 unresolved attachments, synthetic separate/contact/overlap/rotated cases; 0 assertions of artistic or exact mesh clearance.");
