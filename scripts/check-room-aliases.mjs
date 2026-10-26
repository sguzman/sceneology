import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const root=path.resolve(import.meta.dirname,"..");
const manifest=JSON.parse(fs.readFileSync(path.join(root,"catalog/room-alias-candidates.json"),"utf8"));
assert.equal(manifest.schema_version,1);
assert.equal(manifest.domain,"accepted-room-composition-source-recovery");
assert.ok(/^([a-f0-9]{40})$/.test(manifest.source_revision_tree));
assert.equal(manifest.scenes.length,4);
const counts=new Map();
for(const scene of manifest.scenes){
 assert.match(scene.path,/^scenes\/composition-sources\/[a-z0-9.-]+\.scene\.yml$/);
 const bytes=fs.readFileSync(path.join(root,scene.path));
 const sha=crypto.createHash("sha1").update(Buffer.from("blob "+bytes.length+"\0")).update(bytes).digest("hex");
 assert.equal(sha,scene.blob_sha,"Room source changed without dependency re-triage: "+scene.path);
 const refs=[...bytes.toString("utf8").matchAll(/^\s*asset_ref:\s*([^\s#]+)/gm)].map(m=>m[1]);
 assert.equal(refs.length,scene.instance_references);
 for(const a of refs)counts.set(a,(counts.get(a)||0)+1);
}
assert.equal(counts.size,manifest.alias_count);
assert.equal([...counts.values()].reduce((s,x)=>s+x,0),manifest.occurrence_count);
assert.equal(manifest.alias_count,24);
assert.equal(manifest.occurrence_count,37);
const statuses={"single-candidate-not-certified":0,"ambiguous-many-candidates":0,"unresolved-no-version-match":0};
const seen=new Set();
for(const row of manifest.aliases){
 assert.ok(counts.has(row.alias)&&!seen.has(row.alias),"Unseen/duplicate alias: "+row.alias);
 seen.add(row.alias);
 assert.equal(row.occurrences,counts.get(row.alias));
 assert.equal(row.selected_binding,null,"Unreviewed alias was auto-bound: "+row.alias);
 assert.equal(row.release_admitted,false,"Unreviewed asset was auto-admitted");
 assert.ok(row.status in statuses,"Unexpected alias classification");
 assert.equal(row.candidate_count,row.candidates.length);
 assert.equal(row.status,row.candidates.length===0?"unresolved-no-version-match":row.candidates.length===1?"single-candidate-not-certified":"ambiguous-many-candidates");
 const listed=new Set();
 for(const candidate of row.candidates){
  assert.match(candidate.path,/^assets\/constructive-3d\/[a-z0-9-]+\/[a-z0-9.-]+\.sc3d\.yml$/);
  assert.match(candidate.blob_sha,/^[a-f0-9]{40}$/);
  assert.ok(!listed.has(candidate.path),"Duplicate candidate");
  listed.add(candidate.path);
  const version=row.alias.match(/v\d+(?:\.\d+)*/)?.[0];
  if(version)assert.ok(candidate.path.endsWith("-"+version+".sc3d.yml"),"Version mismatch "+candidate.path);
 }
 statuses[row.status]++;
}
assert.deepEqual(statuses,{"single-candidate-not-certified":7,"ambiguous-many-candidates":16,"unresolved-no-version-match":1});
const prepared=JSON.parse(fs.readFileSync(path.join(root,"catalog/accepted-family-sources.json"),"utf8"));
const stagedBlobs=new Set(prepared.items.map(item=>item.sha));
assert.equal(stagedBlobs.size,prepared.items.length,"Duplicate staged source blobs");
const covered=manifest.aliases.filter(alias=>alias.candidates.some(candidate=>stagedBlobs.has(candidate.blob_sha)));
const uncovered=manifest.aliases.filter(alias=>!alias.candidates.some(candidate=>stagedBlobs.has(candidate.blob_sha)));
// Separately stage a source-only, NOT owner-accepted earlier blanket for forensic comparison.
// This never upgrades its visual verdict or binds it into an accepted composition.
const archives=JSON.parse(fs.readFileSync(path.join(root,"catalog/room-technical-source-staging.json"),"utf8"));
assert.equal(archives.schema_version,1);
assert.equal(archives.source_tree_sha,manifest.source_revision_tree);
assert.equal(archives.items.length,1);
const technical=archives.items[0];
assert.equal(technical.alias,"accepted:block-chibi-room::blanket/bed-cover");
assert.match(technical.public_path,/^models\/source-archives\/[a-z0-9.-]+\.sc3d\.yml$/);
assert.equal(technical.source_evaluation,"awaiting-family-review");
assert.equal(technical.gallery_approved,false);
assert.equal(technical.room_binding_approved,false);
assert.equal(technical.source_accepted_as_current_room_asset,false);
const archivedBytes=fs.readFileSync(path.join(root,technical.public_path));
const archivedSha=crypto.createHash("sha1").update(Buffer.from("blob "+archivedBytes.length+"\0")).update(archivedBytes).digest("hex");
assert.equal(archivedSha,technical.sha,"Technical blanket copy changed");
const alias=manifest.aliases.find(a=>a.alias===technical.alias);
assert.ok(alias?.candidates.some(c=>c.blob_sha===technical.sha&&c.path===technical.source_path));
assert.ok(!stagedBlobs.has(technical.sha),"Unapproved blanket must not enter accepted family previews");
const allSourceBlobs=new Set([...stagedBlobs,technical.sha]);
const allCovered=manifest.aliases.filter(a=>a.candidates.some(c=>allSourceBlobs.has(c.blob_sha)));
const stillMissing=manifest.aliases.filter(a=>!a.candidates.some(c=>allSourceBlobs.has(c.blob_sha)));
assert.equal(covered.length,22,"Accepted-family staging scope unexpectedly changed");
assert.equal(allCovered.length,23,"Exactly one additional technical blanket candidate expected");
assert.deepEqual(stillMissing.map(a=>a.alias),[archives.unresolved_exact_alias]);

assert.ok(uncovered.every(alias=>alias.alias.startsWith("accepted:block-chibi-room::blanket/")),"Unexpected accepted-family source gap");
for(const item of covered){
 const matches=item.candidates.filter(candidate=>stagedBlobs.has(candidate.blob_sha));
 assert.ok(matches.length>0);
 for(const match of matches)assert.ok(prepared.items.some(p=>p.sha===match.blob_sha&&p.source_path===match.path),"Staged alias source identity mismatch");
}
console.log("Sceneology room all-source staging: "+allCovered.length+"/"+manifest.alias_count+" aliases have staged original bytes (22 accepted-family, 1 research-only blanket); missing exact v1.3 remains unresolved.");
console.log("Sceneology room staged-source coverage: "+covered.length+"/"+manifest.alias_count+" aliases have at least one accepted-family exact source staged; "+uncovered.length+" lack an accepted-family source. All 24 remain unbound.");
console.log("Sceneology room dependency census passed: 4 accepted source-only compositions; 37 placements, 24 distinct aliases; 7 one-source candidates, 16 ambiguous, 1 missing exact version. No automatic binding/visual approval.");
