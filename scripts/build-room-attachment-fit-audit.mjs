import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const root=path.resolve(import.meta.dirname,"..");
const load=relative=>JSON.parse(fs.readFileSync(path.join(root,relative),"utf8"));
const families=load("catalog/accepted-family-sources.json");
const models=load("site/family-orbit-data.json");
const scenes=load("catalog/room-alias-candidates.json");
const gallery=load("catalog/showcase.json");
assert.equal(gallery.approved_ids.length,24);
assert.equal(models.models.length,30);
const modelByKey=new Map(models.models.map(item=>[item.key,item]));
const familyByKey=new Map(families.items.map(item=>[item.key,item]));
const sha=bytes=>crypto.createHash("sha1").update(Buffer.from("blob "+bytes.length+"\0")).update(bytes).digest("hex");
const keys={beds:["compact-cozy-bed","simple-study-bed","wide-cute-bed"],
 chairs:["compact-chair","study-chair","wide-cute-chair"]};
const bounds=(model,part)=>{
 const vertices=model.faces.filter(face=>face.part===part).flatMap(face=>face.vertices);
 assert.ok(vertices.length>=8,"Missing source geometry "+model.key+"/"+part);
 assert.ok(vertices.every(p=>p.length===3&&p.every(Number.isFinite)));
 return {min:[0,1,2].map(axis=>Math.min(...vertices.map(v=>v[axis]))),
 max:[0,1,2].map(axis=>Math.max(...vertices.map(v=>v[axis])))};
};
const rounded=n=>Number(n.toFixed(6));
const width=b=>rounded(b.max[0]-b.min[0]);
const verified=key=>{
 const staged=familyByKey.get(key),model=modelByKey.get(key);
 assert.ok(staged&&model&&model.source_sha===staged.sha&&staged.new_renderer_visual_approval===false);
 const bytes=fs.readFileSync(path.join(root,staged.public_path));
 assert.equal(sha(bytes),staged.sha,"Original constructive model modified "+key);
 return {staged,model};
};
const pillow=verified("lumbar-pillow"),bedPillow=verified("bed-pillow");
const pillowWidth=width(bounds(pillow.model,"body"));
const bedPillowWidth=width(bounds(bedPillow.model,"body"));
assert.equal(pillowWidth,1.10);assert.equal(bedPillowWidth,.98);
const chairCompatibility=keys.chairs.map(key=>{
 const {staged,model}=verified(key);
 const names=new Set(model.faces.map(face=>face.part));
 const surface=names.has("cushion")?"cushion":"seat";
 const platform=bounds(model,surface);
 const seatWidth=width(platform);
 const overhang=rounded(Math.max(0,(pillowWidth-seatWidth)/2));
 return {source_key:key,source_path:staged.source_path,source_blob:staged.sha,
  seat_support_part:surface,seat_width:seatWidth,source_lumbar_pillow_width:pillowWidth,
  estimated_side_overhang:overhang,unscaled_width_fits_support:overhang===0,
  source_origin_not_repositioned:true,chair_identity_certified:false,visual_fit_approved:false};
});
const bedCompatibility=keys.beds.map(key=>{
 const {staged,model}=verified(key);
 const partIds=new Set(model.faces.map(face=>face.part));
 assert.ok(partIds.has("pillow")&&partIds.has("blanket")&&partIds.has("mattress"),"Bed embedded dressing changed "+key);
 const mattress=bounds(model,"mattress");
 const overhang=rounded(Math.max(0,(bedPillowWidth-width(mattress))/2));
 const embeddedPillow=bounds(model,"pillow"),embeddedBlanket=bounds(model,"blanket");
 return {source_key:key,source_path:staged.source_path,source_blob:staged.sha,
  mattress_width:width(mattress),external_bed_pillow_width:bedPillowWidth,
  external_pillow_estimated_side_overhang:overhang,unscaled_external_pillow_width_fits_mattress:overhang===0,
  original_bed_contains_embedded_pillow:true,embedded_pillow_width:width(embeddedPillow),
  original_bed_contains_embedded_blanket:true,embedded_blanket_width:width(embeddedBlanket),
  external_source_attachements_must_not_be_blindly_added:true,
  whether_accepted_renderer_suppressed_embedded_parts_unknown:true,
  accepted_v1_3_blanket_geometry_unrecovered:true,
  source_model_not_automatically_modified:true,original_room_binding_certified:false};
});
const bedsInRooms=[];
for(const id of ["cozy-bedroom-study-v1.3","sleep-room-v1"]){
 const record=scenes.scenes.find(s=>s.id===id);
 assert.ok(record);
 const bytes=fs.readFileSync(path.join(root,record.path));
 assert.equal(sha(bytes),record.blob_sha);
 const source=bytes.toString("utf8");
 assert.match(source,/^status:\s*accepted\s*$/m);
 const instanceSection=source.split("\ninstances:\n")[1]?.split("\nclearance_contract:\n")[0];
 assert.ok(instanceSection);
 const occurrences=[...instanceSection.matchAll(/^  - id:\s*([a-z][a-z0-9-]*)\s*$/gm)];
 const roles=occurrences.map((match,i)=>{
  const text=instanceSection.slice(match.index,i+1<occurrences.length?occurrences[i+1].index:instanceSection.length);
  return {id:match[1],alias:text.match(/^\s*asset_ref:\s*(\S+)/m)?.[1],
   parent:text.match(/^\s*parent_relation:\s*(\S+)/m)?.[1]||null};
 });
 const bed=roles.find(x=>x.id==="bed");
 const attachments=roles.filter(x=>x.parent==="on_bed");
 assert.ok(bed&&attachments.length===2);
 assert.equal(attachments.filter(x=>x.alias?.includes("pillow")).length,1);
 assert.equal(attachments.filter(x=>x.alias?.includes("blanket")).length,1);
 if(id==="sleep-room-v1")assert.ok(attachments.some(x=>x.alias.endsWith("blanket/bed-cover-v1.3")));
 bedsInRooms.push({room_id:id,scene_sha:record.blob_sha,bed_alias:bed.alias,
  external_attachements:attachments,embedded_vs_separate_resolution:"not established",
  no_original_binding_certified:true});
}
const data={schema_version:1,scope:"original sourced bedding and lumbar attachment compatibility",
 historical_accepted_room_render_recovered:false,original_asset_binding_recovered:false,
 accepted_character_or_scene_geometry_rewritten:false,no_new_gallery_approval:true,
 exact_model_sources_sha_verified:true,
 lumbar_pillow:{key:"lumbar-pillow",source_sha:pillow.staged.sha,
  source_width:pillowWidth,chair_candidates:chairCompatibility,
  one_to_one_unscaled_fully_supported_by_any_candidate:chairCompatibility.some(c=>c.unscaled_width_fits_support)},
 bed_pillow:{key:"bed-pillow",source_sha:bedPillow.staged.sha,source_width:bedPillowWidth,
  bed_candidates:bedCompatibility},
 accepted_room_bedding_dependencies:bedsInRooms,
 research_consequence:"Do not place additional loose pillow or blanket parts over already-dressed source beds without checking original renderer suppression, exact variant and contact; do not rescale accepted lumbar pillow or pick a chair to hide incompatibility."
};
assert.equal(data.lumbar_pillow.one_to_one_unscaled_fully_supported_by_any_candidate,false);
fs.writeFileSync(path.join(root,"site/room-attachment-fit-audit.json"),JSON.stringify(data,null,2)+"\n");
console.log("Sceneology attachment fit: 3/3 chairs narrower than 1.10 lumbar pillow; 3/3 beds embed both pillow and blanket; 2 original accepted rooms separately request bedding attachments; no inferred accepted bindings.");
