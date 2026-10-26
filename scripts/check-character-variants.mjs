import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";

const root=path.resolve(import.meta.dirname,"..");
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const ledger=read("catalog/character-variant-triage.json");
const library=read("catalog/library.json");
const showcase=read("catalog/showcase.json");
assert.equal(ledger.schema_version,1);
assert.equal(ledger.automatic_exhibition,false);
assert.ok(Array.isArray(ledger.records)&&ledger.records.length>0);
const ids=new Set();
const statuses=new Set([
 "partial-positive-only","accepted-specific-feature-only",
 "accepted-static-character","rejected-full-character","blocked-artifact-integrity"
]);
for(const record of ledger.records){
 assert.match(record.id,/^[a-z][a-z0-9-]*$/);
 assert.ok(!ids.has(record.id),"Duplicate character version");
 ids.add(record.id);
 assert.ok(statuses.has(record.status),"Unknown acceptance state");
 assert.match(record.source,/^[a-z0-9./-]+\.((sc3d|scene)\.yml|json|yml)$/);
 assert.match(record.evidence,/^[a-z0-9./-]+\.(md|json)$/);
 assert.ok(!record.source.includes("..")&&!record.evidence.includes(".."));
 if(record.publication==="selected"){
  assert.equal(record.status,"accepted-static-character","Only fully accepted character may be selected");
  assert.ok(showcase.approved_ids.includes(record.id),"Selected approved character missing in gallery");
  const exhibited=library.records.find(x=>x.id===record.id);
  assert.ok(exhibited?.kind==="character"&&exhibited.viewer&&exhibited.thumbnail,"Selected character lacks valid release assets");
 }else{
  assert.ok(["research-only","exclude-from-gallery"].includes(record.publication));
  assert.ok(!showcase.approved_ids.includes(record.id),"Rejected/partial character appeared in exhibition: "+record.id);
 }
}
console.log("Sceneology character curation gate: "+ledger.records.length+" historical variants, only accepted static Quest Girl v7 is eligible for exhibition.");
