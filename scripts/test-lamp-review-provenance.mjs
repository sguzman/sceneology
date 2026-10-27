import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
const root=path.resolve(import.meta.dirname,"..");
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const ledger=read("catalog/lamp-review-provenance.json");
const family=read("catalog/accepted-family-sources.json");
const alias=read("catalog/room-alias-candidates.json");
const gallery=read("catalog/showcase.json");
assert.equal(ledger.schema_version,1);
assert.equal(ledger.source_repo,"sguzman/scenarium");
assert.equal(ledger.original_historical_room_lamp_bindings_certified,false);
assert.equal(ledger.local_light_transform_parity_certified,false);
assert.equal(ledger.exact_accepted_power_control_implemented_in_research_viewer,false);
assert.equal(ledger.revised_curation,false);
assert.equal(gallery.approved_ids.length,24);
assert.deepEqual(ledger.reviews.map(v=>v.family_verdict),["failed","partial-not-baseline","accepted-family-baseline"]);
const gitHash=b=>crypto.createHash("sha1").update(Buffer.from("blob "+b.length+"\0")).update(b).digest("hex");
const copies=ledger.reviews.map(item=>{
 const bytes=fs.readFileSync(path.join(root,item.preserved_local_copy));
 assert.equal(gitHash(bytes),item.blob_sha,"Original public lamp evaluation mutated");
 return bytes.toString("utf8");
});
assert.match(copies[0],/family is not accepted as v1/);
assert.match(copies[1],/not the accepted baseline yet/);
assert.match(copies[2],/v1\.2 is accepted as the first usable block-chibi lamp family/);
assert.match(copies[2],/powering the lamps off removes the visible powered-emitter read/);
for(const id of ["cozy-table-lamp","task-lamp"]){
 const item=family.items.find(x=>x.key===id);
 assert.ok(item&&item.source_path.includes("v1.2")&&item.new_renderer_visual_approval===false);
 const record=alias.aliases.find(x=>x.alias==="accepted:block-chibi-room::lamp/table");
 assert.ok(record&&record.selected_binding===null&&record.candidate_count===6);
 assert.ok(record.candidates.some(c=>c.path===item.source_path&&c.blob_sha===item.sha));
}
assert.equal(ledger.repair_requirements.source_review_is_not_live_reimplementation_proof,true);
assert.equal(ledger.repair_requirements.downward_emission_local_axis,"-Y");
console.log("Sceneology lamp revision provenance: rejected v1, partial v1.1, accepted v1.2; source-verified family gate, six original unbound room lamp candidates and no false light parity.");
