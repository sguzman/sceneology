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
console.log("Sceneology room dependency census passed: 4 accepted source-only compositions; 37 placements, 24 distinct aliases; 7 one-source candidates, 16 ambiguous, 1 missing exact version. No automatic binding/visual approval.");
