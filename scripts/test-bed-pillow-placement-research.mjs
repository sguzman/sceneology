import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
const root=path.resolve(import.meta.dirname,"..");
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const info=read("site/bed-pillow-placement-research.json");
const gallery=read("catalog/showcase.json");
const orbit=read("site/family-orbit-data.json");
const staged=read("catalog/accepted-family-sources.json");
assert.equal(info.schema_version,1);
assert.equal(info.kind,"unapproved-bed-pillow-parent-transform-research");
for(const field of ["original_source_bed_parts_preserved","original_source_pillow_parts_preserved",
 "source_bed_bedding_mask_is_only_renderer_experiment","proposed_headboard_gap_not_historical_evidence",
 "all_original_room_binding_unknown","original_blanket_v1_3_still_missing",
 "eligible_only_if_source_embedded_pillow_and_blanket_hidden"])
 assert.equal(info[field],true);
assert.equal(info.human_aesthetic_approval,false);
assert.equal(info.showcase_approved,false);
assert.equal(gallery.approved_ids.length,24);
assert.equal(info.original_bed_candidates.length,3);
assert.equal(info.room_dependencies.length,2);
assert.equal(info.original_pillow_sha,staged.items.find(x=>x.key==="bed-pillow").sha);
assert.deepEqual(info.original_bed_candidates.map(x=>x.bed_source_key),
 ["compact-cozy-bed","simple-study-bed","wide-cute-bed"]);
assert.deepEqual(info.original_bed_candidates.map(x=>x.overhang_each_side),[.04,0,0]);
for(const item of info.original_bed_candidates){
 assert.ok(orbit.models.some(m=>m.key===item.bed_source_key&&m.source_sha===item.bed_source_sha));
 assert.equal(item.external_pillow_source_sha,info.original_pillow_sha);
 assert.equal(item.local_translate[0],0);
 assert.ok(item.local_translate.every(Number.isFinite));
 assert.equal(item.yaw_relative_to_bed_deg,0);
 assert.equal(item.headboard_gap,.02);
 assert.equal(item.mattress_top_y,item.pillow_bottom_y);
 assert.equal(Number((item.headboard_front_z-item.pillow_rear_z).toFixed(6)),.02);
 assert.equal(item.all_z_corners_within_mattress,true);
 assert.equal(item.orientation_and_gap_are_proposed_not_authored,true);
 assert.equal(item.original_room_binding_or_world_transform_recovered,false);
}
assert.deepEqual(info.room_dependencies.map(x=>x.room_id),["cozy-bedroom-study-v1.3","sleep-room-v1"]);
assert.ok(info.room_dependencies.every(x=>x.head_side_precise_local_transform_unavailable===true));
console.log("Sceneology staged external bed-pillow QA: 3 variants with support/headboard clearance evidence, two original parent relations, no historical transform or bed-cover substitution.");
