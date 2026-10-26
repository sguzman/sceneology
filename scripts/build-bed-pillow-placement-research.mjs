import assert from "node:assert/strict";
import fs from "node:fs";
import crypto from "node:crypto";
import path from "node:path";

const root=path.resolve(import.meta.dirname,"..");
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const families=read("catalog/accepted-family-sources.json");
const sources=read("catalog/room-alias-candidates.json");
const orbit=read("site/family-orbit-data.json");
const attached=read("site/room-attachment-fit-audit.json");
const gallery=read("catalog/showcase.json");
assert.equal(gallery.approved_ids.length,24);
assert.equal(attached.bed_pillow.bed_candidates.length,3);
const models=new Map(orbit.models.map(x=>[x.key,x]));
const staged=new Map(families.items.map(x=>[x.key,x]));
const parts=(model,id)=>{
 const vertices=model.faces.filter(f=>f.part===id).flatMap(f=>f.vertices);
 assert.ok(vertices.length>=8,model.key+" missing "+id);
 return {min:[0,1,2].map(i=>Math.min(...vertices.map(v=>v[i]))),
 max:[0,1,2].map(i=>Math.max(...vertices.map(v=>v[i])))};
};
const r=n=>Number(n.toFixed(6));
const pillow=staged.get("bed-pillow"),pillowModel=models.get("bed-pillow");
assert.ok(pillow&&pillowModel&&pillow.sha===pillowModel.source_sha);
assert.equal(pillow.new_renderer_visual_approval,false);
const body=parts(pillowModel,"body");
const source=fs.readFileSync(path.join(root,pillow.public_path));
const gitSha=b=>crypto.createHash("sha1").update(Buffer.from("blob "+b.length+"\0")).update(b).digest("hex");
assert.equal(gitSha(source),pillow.sha,"Approved-family pillow source changed");
const studies=[];
for(const record of attached.bed_pillow.bed_candidates){
 const model=models.get(record.source_key),stagedBed=staged.get(record.source_key);
 assert.ok(model&&stagedBed&&model.source_sha===record.source_blob&&stagedBed.sha===record.source_blob);
 const mattress=parts(model,"mattress"),headboard=parts(model,"headboard");
 const bedPillowEmbedded=parts(model,"pillow"),bedBlanketEmbedded=parts(model,"blanket");
 assert.ok(bedPillowEmbedded.max[1]>mattress.max[1]&&bedBlanketEmbedded.max[1]>mattress.max[1]);
 const clearGap=.02;
 // Pillow local +Z edge is close to (but behind) the headboard's front -Z surface.
 // The source says head-side; the precise 2cm gap is a research choice, never original evidence.
 const position=[0,r(mattress.max[1]-body.min[1]),r(headboard.min[2]-body.max[2]-clearGap)];
 const supported={min:[body.min[0]+position[0],body.min[1]+position[1],body.min[2]+position[2]],
 max:[body.max[0]+position[0],body.max[1]+position[1],body.max[2]+position[2]]};
 const footprintWidth=body.max[0]-body.min[0],mattressWidth=mattress.max[0]-mattress.min[0];
 const overhang=r(Math.max(0,(footprintWidth-mattressWidth)/2));
 assert.equal(overhang,record.external_pillow_estimated_side_overhang);
 assert.ok(Math.abs(supported.min[1]-mattress.max[1])<=.000001,"External pillow bottom does not meet mattress");
 assert.ok(Math.abs(headboard.min[2]-supported.max[2]-clearGap)<=.000001,"Headboard approach clearance changed");
 assert.ok(supported.min[2]>=mattress.min[2],"External pillow front hangs off the mattress");
 assert.ok(supported.max[2]<=mattress.max[2],"External pillow back hangs off the mattress");
 studies.push({bed_source_key:record.source_key,bed_source_sha:record.source_blob,
  external_pillow_source_key:"bed-pillow",external_pillow_source_sha:pillow.sha,
  local_translate:position,yaw_relative_to_bed_deg:0,headboard_gap:clearGap,
  mattress_top_y:r(mattress.max[1]),pillow_bottom_y:r(supported.min[1]),
  headboard_front_z:r(headboard.min[2]),pillow_rear_z:r(supported.max[2]),
  external_pillow_width:r(footprintWidth),mattress_width:r(mattressWidth),
  overhang_each_side:overhang,all_z_corners_within_mattress:true,
  orientation_and_gap_are_proposed_not_authored:true,
  original_room_binding_or_world_transform_recovered:false,
  correct_original_bedding_renderer_identified:false});
}
const rooms=["cozy-bedroom-study-v1.3","sleep-room-v1"].map(id=>{
 const room=sources.scenes.find(x=>x.id===id);
 assert.ok(room);
 const bytes=fs.readFileSync(path.join(root,room.path));
 assert.equal(gitSha(bytes),room.blob_sha);
 const text=bytes.toString("utf8");
 const bedPillow=text.match(/- id:\s*(bed-pillow|pillow)\s*\n\s*asset_ref:\s*(\S+)\s*\n[\s\S]*?parent_relation:\s*on_bed/m);
 assert.ok(bedPillow&&bedPillow[2].includes("pillow/bed"),"Historical pillow dependency changed");
 return {room_id:id,source_sha:room.blob_sha,source_external_pillow_relation:"on_bed",
  head_side_originally_required:true,head_side_precise_local_transform_unavailable:true};
});
const output={
 schema_version:1,kind:"unapproved-bed-pillow-parent-transform-research",
 original_source_bed_parts_preserved:true,original_source_pillow_parts_preserved:true,
 source_bed_bedding_mask_is_only_renderer_experiment:true,
 proposed_headboard_gap_not_historical_evidence:true,
 all_original_room_binding_unknown:true,original_blanket_v1_3_still_missing:true,
 eligible_only_if_source_embedded_pillow_and_blanket_hidden:true,
 human_aesthetic_approval:false,showcase_approved:false,
 original_pillow_sha:pillow.sha,original_bed_candidates:studies,room_dependencies:rooms
};
fs.writeFileSync(path.join(root,"site/bed-pillow-placement-research.json"),JSON.stringify(output,null,2)+"\n");
console.log("Sceneology bed-pillow external placement research: 3 source-exact bed variants, 2 original source parent relations, mattress-top/headboard-relative proposed coordinates; neither bedding nor placement approved.");
