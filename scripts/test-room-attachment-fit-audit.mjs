import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
const root=path.resolve(import.meta.dirname,"..");
const get=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const data=get("site/room-attachment-fit-audit.json");
const gallery=get("catalog/showcase.json");
const accepted=get("catalog/accepted-family-sources.json");
assert.equal(data.schema_version,1);
assert.equal(data.historical_accepted_room_render_recovered,false);
assert.equal(data.original_asset_binding_recovered,false);
assert.equal(data.accepted_character_or_scene_geometry_rewritten,false);
assert.equal(data.no_new_gallery_approval,true);
assert.equal(data.exact_model_sources_sha_verified,true);
assert.equal(gallery.approved_ids.length,24);
assert.equal(data.lumbar_pillow.source_width,1.1);
assert.equal(data.lumbar_pillow.chair_candidates.length,3);
assert.equal(data.lumbar_pillow.one_to_one_unscaled_fully_supported_by_any_candidate,false);
assert.deepEqual(data.lumbar_pillow.chair_candidates.map(c=>[c.source_key,c.seat_support_part,c.seat_width,c.estimated_side_overhang]),
 [["compact-chair","seat",.52,.29],["study-chair","seat",.6,.25],["wide-cute-chair","cushion",.7,.2]]);
assert.equal(data.bed_pillow.source_width,.98);
assert.equal(data.bed_pillow.bed_candidates.length,3);
assert.deepEqual(data.bed_pillow.bed_candidates.map(c=>[c.source_key,c.mattress_width,c.external_pillow_estimated_side_overhang]),
 [["compact-cozy-bed",.9,.04],["simple-study-bed",1.12,0],["wide-cute-bed",1.38,0]]);
for(const row of [...data.lumbar_pillow.chair_candidates,...data.bed_pillow.bed_candidates]){
 const staged=accepted.items.find(x=>x.key===row.source_key);
 assert.ok(staged&&staged.source_path===row.source_path&&staged.sha===row.source_blob);
 assert.equal(staged.new_renderer_visual_approval,false);
}
for(const candidate of data.bed_pillow.bed_candidates){
 assert.equal(candidate.original_bed_contains_embedded_pillow,true);
 assert.equal(candidate.original_bed_contains_embedded_blanket,true);
 assert.equal(candidate.whether_accepted_renderer_suppressed_embedded_parts_unknown,true);
 assert.equal(candidate.accepted_v1_3_blanket_geometry_unrecovered,true);
 assert.equal(candidate.original_room_binding_certified,false);
 assert.equal(candidate.source_model_not_automatically_modified,true);
}
assert.deepEqual(data.accepted_room_bedding_dependencies.map(x=>x.room_id),["cozy-bedroom-study-v1.3","sleep-room-v1"]);
for(const room of data.accepted_room_bedding_dependencies){
 assert.equal(room.external_attachements.length,2);
 assert.equal(room.embedded_vs_separate_resolution,"not established");
 assert.equal(room.no_original_binding_certified,true);
}
assert.ok(data.accepted_room_bedding_dependencies[1].external_attachements.some(x=>x.alias.endsWith("blanket/bed-cover-v1.3")));
console.log("Sceneology source attachment QA: all chair/bed width combinations checked and four original room bedding references preserved; zero invented or approved scene changes.");
