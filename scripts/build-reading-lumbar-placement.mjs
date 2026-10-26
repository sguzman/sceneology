import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import {analyzeProxyGeometry} from "../site/room-geometry-audit.mjs";
const root=path.resolve(import.meta.dirname,"..");
const load=rel=>JSON.parse(fs.readFileSync(path.join(root,rel),"utf8"));
const scene=load("site/reading-corner-study-data.json");
const aliases=load("catalog/room-alias-candidates.json");
const orbit=load("site/family-orbit-data.json");
const families=load("catalog/accepted-family-sources.json");
const gallery=load("catalog/showcase.json");
assert.equal(scene.instances.length,6);
assert.equal(scene.omitted_parented_instances.length,2);
assert.equal(scene.gallery_approved,false);
assert.equal(gallery.approved_ids.length,24);
const omitted=scene.omitted_parented_instances.find(item=>item.id==="lumbar-pillow");
assert.ok(omitted&&omitted.parent_instance==="chair"&&omitted.parent_relation==="on_chair");
assert.equal(omitted.geometry_omitted,true);
const pillowAlias=aliases.aliases.find(item=>item.alias===omitted.alias);
assert.ok(pillowAlias&&pillowAlias.candidate_count===1&&pillowAlias.selected_binding===null);
const files=fs.readFileSync(path.join(root,scene.source_scene));
const sha=crypto.createHash("sha1").update(Buffer.from("blob "+files.length+"\0")).update(files).digest("hex");
assert.equal(sha,scene.source_scene_sha);
const original=files.toString("utf8");
for(const constraint of ["upright: true","accent_face_outward: true","plain_rear_face_touches_backrest: true",
 "bottom_supported_by_seat: true","no_support_penetration: true"])assert.ok(original.includes(constraint),"Missing source review constraint "+constraint);
const models=new Map(orbit.models.map(item=>[item.key,item]));
const chair=scene.instances.find(item=>item.id==="chair");
assert.ok(chair&&chair.model_key==="wide-cute-chair");
const chairModel=models.get(chair.model_key);
const pillow= families.items.find(item=>item.key==="lumbar-pillow");
assert.ok(pillow&&pillow.new_renderer_visual_approval===false);

assert.ok(pillowAlias.candidates[0].blob_sha===pillow.sha&&pillowAlias.candidates[0].path===pillow.source_path);
const sourceModel=models.get("lumbar-pillow");
assert.ok(sourceModel&&sourceModel.source_sha===pillow.sha);
assert.ok(chairModel&&chairModel.source_sha===chair.model_sha);
const bounds=(model,part)=>{
 const points=model.faces.filter(f=>f.part===part).flatMap(f=>f.vertices);
 assert.ok(points.length>0,"Missing named support primitive "+part);
 return {min:[0,1,2].map(i=>Math.min(...points.map(v=>v[i]))),
         max:[0,1,2].map(i=>Math.max(...points.map(v=>v[i])))};
};
const cushion=bounds(chairModel,"cushion");
const back=bounds(chairModel,"back");
const body=bounds(sourceModel,"body");
const panel=bounds(sourceModel,"center_panel");
assert.ok(body.max[1]<=panel.min[1]+.00001,"Original accent panel orientation changed");
const seatTop=cushion.max[1];
const backFront=back.min[2];
const lift=seatTop-body.min[2];
const localBackOffset=backFront+body.min[1];
assert.ok(Number.isFinite(lift)&&Number.isFinite(localBackOffset));
const rotateSourceToUpright=v=>[v[0],v[2]+lift,-v[1]+localBackOffset];
const faces=sourceModel.faces.map(f=>({...f,vertices:f.vertices.map(v=>rotateSourceToUpright(v).map(n=>Number(n.toFixed(6))))}));
const proposalModel={
 key:"reading-lumbar-upright-proposal",
 source_sha:pillow.sha,
 proposal_transform:"rotate source by Rx(-90deg), align lower body z-derived edge with cushion top and flat backside with back front",
 faces
};
const uprightBody=bounds(proposalModel,"body"),uprightPanel=bounds(proposalModel,"center_panel");
assert.ok(Math.abs(uprightBody.min[1]-seatTop)<.000001,"Pillow not resting at seat surface");
assert.ok(Math.abs(uprightBody.max[2]-backFront)<.000001,"Pillow back not in contact with seat backrest");
assert.ok(uprightPanel.max[2]<uprightBody.max[2],"Accent face points away from backrest");
const cushionWidth=cushion.max[0]-cushion.min[0];
const pillowWidth=uprightBody.max[0]-uprightBody.min[0];
const overhang=Math.max(0,(pillowWidth-cushionWidth)/2);
const representative={id:"lumbar-pillow",model_key:proposalModel.key,model_sha:proposalModel.source_sha,
 translate:chair.translate,yaw_deg:chair.yaw_deg};
const sceneMap=new Map([...models,[proposalModel.key,proposalModel]]);
const screened=analyzeProxyGeometry([...scene.instances,representative],sceneMap);
const supportPairs=screened.broad_phase_candidates.filter(p=>p.first==="lumbar-pillow"||p.second==="lumbar-pillow");
const data={
 schema_version:1,study:"reading-corner-lumbar-pillow-placement-proposal",
 historical_source_scene:scene.source_scene,historical_scene_sha:sha,
 source_relation:"on_chair",source_constraints:["upright","accent_face_outward","back_face_touches_backrest","bottom_supported_by_seat","no_support_penetration"],
 source_pillow_path:pillow.source_path,source_pillow_sha:pillow.sha,
 source_chair_key:chair.model_key,source_chair_sha:chair.model_sha,
 approved_original_room_placement_recovered:false,proposal_accepted:false,artistically_approved:false,
 source_pillow_modified:false,source_room_modified:false,gallery_approved:false,
 candidate_support:{
  basis:"wide-cute-chair representative from a later unapproved occupancy proof, not certified original room chair",
  source_chair_seat_top_y:Number(seatTop.toFixed(6)),
  source_chair_back_front_z:Number(backFront.toFixed(6)),
  candidate_pillow_bottom_y:Number(uprightBody.min[1].toFixed(6)),
  candidate_pillow_back_z:Number(uprightBody.max[2].toFixed(6)),
  proposed_rx_deg:-90,
  candidate_center_panel_faces_outward:uprightPanel.max[2]<uprightBody.max[2],
  horizontal_pillow_overhang_each_side:Number(overhang.toFixed(6)),
  width_mismatch_requires_owner_review:overhang>0,
  chair_touching_other_objects_unverified:true,
  mesh_collision_certified:false,
  scene_identity_inferred:false,
  broad_phase_pairs:supportPairs.map(p=>({first:p.first,second:p.second,aabb_overlap:p.aabb_overlap,
   part_box_candidates:p.part_bound_candidate_pairs,exact_mesh_collision_confirmed:false}))
 },
 instance:representative,model:proposalModel
};

fs.writeFileSync(path.join(root,"site/reading-lumbar-placement-data.json"),JSON.stringify(data)+"\n");
console.log("Reading Corner lumbar support proposal: grounded seat/back placement, outward pillow panel, "+overhang.toFixed(3)+"-unit side overhang; no original geometry binding or gallery approval.");

