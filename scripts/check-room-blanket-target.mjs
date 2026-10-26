import assert from "node:assert/strict";
import fs from "node:fs";
import crypto from "node:crypto";
import path from "node:path";

const root=path.resolve(import.meta.dirname,"..");
const target=JSON.parse(fs.readFileSync(path.join(root,"catalog/room-blanket-target.json"),"utf8"));
const aliases=JSON.parse(fs.readFileSync(path.join(root,"catalog/room-alias-candidates.json"),"utf8"));
const families=JSON.parse(fs.readFileSync(path.join(root,"catalog/accepted-family-sources.json"),"utf8"));
const gallery=JSON.parse(fs.readFileSync(path.join(root,"catalog/showcase.json"),"utf8"));
assert.equal(target.schema_version,1);
assert.equal(target.domain,"accepted-bed-cover-v1.3-reconstruction-target");
assert.equal(target.requested_asset_alias,"accepted:block-chibi-room::blanket/bed-cover-v1.3");
assert.equal(target.original_source_recovered,false);
assert.equal(target.reconstructed_geometry_approved,false);
assert.equal(target.exhibition_approval,false);
const requested=aliases.aliases.find(x=>x.alias===target.requested_asset_alias);
assert.ok(requested&&requested.candidate_count===0&&requested.selected_binding===null&&!requested.release_admitted,
 "Exact v1.3 source may only be marked missing while no source is recovered");
const older=aliases.aliases.find(x=>x.alias===target.existing_unaccepted_predecessor.alias);
assert.ok(older&&older.candidates.length===1,"Predecessor path unexpectedly changed");
assert.equal(older.candidates[0].path,target.existing_unaccepted_predecessor.path);
assert.equal(older.candidates[0].blob_sha,target.existing_unaccepted_predecessor.blob_sha);
assert.equal(older.selected_binding,null);
assert.ok(!families.items.some(x=>x.sha===target.existing_unaccepted_predecessor.blob_sha),
 "Old v1 was silently accepted as new visual source");
assert.ok(Array.isArray(target.accepted_constraints)&&target.accepted_constraints.length===3);
assert.deepEqual(target.accepted_constraints,[
 "preserve_lighter_top_fold",
 "forbid_confusing_extra_dark_foot_piece",
 "preserve_bed_cover_read_and_support_without_clipping"
]);
assert.ok(!gallery.approved_ids.includes(target.requested_asset_alias));
for(const scene of target.evidence_scenes){
 const bytes=fs.readFileSync(path.join(root,scene.path));
 const sha=crypto.createHash("sha1").update(Buffer.from("blob "+bytes.length+"\0")).update(bytes).digest("hex");
 assert.equal(sha,scene.blob_sha,"Acceptance source changed");
 const yaml=bytes.toString("utf8");
 assert.ok(yaml.includes(target.requested_asset_alias),"Acceptance source lacks exact alias");
}
console.log("Sceneology bed-cover reconstruction gate: accepted target known, exact v1.3 geometry absent, v1 is not substituted or showcased.");
