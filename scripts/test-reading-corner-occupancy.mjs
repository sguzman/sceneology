import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
const root=path.resolve(import.meta.dirname,"..");
const data=JSON.parse(fs.readFileSync(path.join(root,"site/reading-corner-occupancy-data.json"),"utf8"));
const gallery=JSON.parse(fs.readFileSync(path.join(root,"catalog/showcase.json"),"utf8"));
const char=JSON.parse(fs.readFileSync(path.join(root,"characters/quest-girl-v7.json"),"utf8"));
const bytes=fs.readFileSync(path.join(root,data.source_scene));
const sha=crypto.createHash("sha1").update(Buffer.from("blob "+bytes.length+"\0")).update(bytes).digest("hex");
assert.equal(sha,data.source_scene_sha);
assert.equal(data.schema_version,1);
assert.equal(data.historical_occupancy_proof_status,"human-review-candidate");
assert.equal(data.original_occupancy_render_recovered,false);
assert.equal(data.accepted_character_geometry_source,true);
assert.equal(data.occupancy_approved,false);
assert.equal(data.stage_contact_certified,false);
assert.equal(data.scale_and_clearance_certified,false);
assert.equal(data.room_geometry_complete,false);
assert.equal(data.showcase_approved,false);
assert.equal(data.character_source_part_count,44);
assert.equal(data.model.source_sha,char.original_source_blob);
assert.deepEqual(data.authored_character.translate,[.25,0,-1.02]);
assert.equal(data.authored_character.yaw_deg,-8);
assert.equal(data.authored_character.stage_contains_authored_origin,true);
assert.equal(data.comparison.not_a_support_or_contact_verdict,true);
const support=data.comparison.source_shoe_support_research;
assert.equal(support.original_occupancy_position_preserved,true);
assert.equal(support.stage_floor_geometry_verified,false);
assert.equal(support.exact_mesh_contact_certified,false);
assert.equal(support.proposal_is_original_source_transform,false);
assert.equal(support.all_shoe_corners_within_rug_field,true);
assert.equal(support.source_field_top_y,.045);
assert.equal(support.original_sole_y,-.945);
assert.equal(support.original_vertical_gap_to_field,-.99);
assert.equal(support.proposed_visualization_only_y_offset,.99);
assert.equal(support.corrected_sole_y_if_offset_applied,.045);
assert.equal(support.shoes.length,2);
for(const shoe of support.shoes){
 assert.equal(shoe.sole_corner_count,4);
 assert.equal(shoe.within_rug_field_footprint,true);
}

assert.ok(Number.isFinite(data.comparison.signed_character_bottom_minus_rug_top));
assert.ok(data.model.faces.length>=200);
for(const face of data.model.faces){
 assert.match(face.part,/^[a-z][a-z0-9_]*$/);
 assert.match(face.color,/^#[0-9a-f]{6}$/i);
 assert.ok(face.vertices.length===4&&face.vertices.every(v=>v.length===3&&v.every(Number.isFinite)));
}
assert.ok(gallery.approved_ids.includes("quest-girl-v7"),"Approved static design missing");
assert.ok(!gallery.approved_ids.includes(data.study),"Occupancy proof must not enter gallery");
console.log("Sceneology source-bound character occupancy candidate verified; 44-part static source, authored transform and stage, no physical support/gallery approval.");
