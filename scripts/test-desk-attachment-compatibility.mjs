import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
const root=path.resolve(import.meta.dirname,"..");
const get=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const data=get("site/desk-attachment-compatibility.json");
const curated=get("catalog/showcase.json");
const family=get("catalog/accepted-family-sources.json");
assert.equal(data.schema_version,1);
assert.equal(data.originality_and_visual_fidelity_certified,false);
assert.equal(data.all_alias_bindings_unapproved,true);
assert.equal(data.showcase_unchanged,true);
assert.equal(curated.approved_ids.length,24);
assert.deepEqual([data.staged_book.cover_width,data.staged_book.cover_depth],[.98,1.16]);
assert.equal(data.staged_book.cover_material,"pink");
assert.equal(data.staged_book.cover_material_hex,"#d7869f");
assert.equal(data.staged_book.original_renderer_palette_override_unknown,true);
assert.deepEqual(data.desks.map(x=>[x.model_key,x.top_width,x.top_depth,x.centered_cover_minimum_side_overhang]),
 [["compact-hutch-desk",.98,.56,.21],["simple-study-desk",1.3,.62,.18],
 ["wide-writing-desk",1.65,.72,.13]]);
assert.deepEqual(data.lamps.map(x=>[x.model_key,x.base_width,x.base_depth,x.desk_candidates_with_possible_single_lamp_base_fit]),
 [["cozy-table-lamp",.58,.58,["simple-study-desk","wide-writing-desk"]],
 ["task-lamp",.74,.58,["simple-study-desk","wide-writing-desk"]]]);
for(const candidate of [...data.desks,...data.lamps]){
 const source=family.items.find(x=>x.key===candidate.model_key);
 assert.ok(source&&source.sha===candidate.source_sha&&source.source_path===candidate.source_path);
 assert.equal(candidate.original_binding_certified,false);
}
for(const desk of data.desks){
 assert.equal(desk.cover_can_fit_without_overhang,false);
 assert.equal(desk.closed_book_cover_min_depth_at_any_yaw,.98);
}
assert.deepEqual(data.source_rooms.map(x=>x.room_id),["cozy-bedroom-study-v1.3","study-corner-v1.1"]);
assert.ok(data.source_rooms.every(x=>x.accepted_closed_book_color==="muted_blue"&&x.source_relative_attachment_transforms_absent));
console.log("Sceneology source desk support QA: no full book cover fit across three staged desks, original color mismatch verified and no automatic source binding.");
