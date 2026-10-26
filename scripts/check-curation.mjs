import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root=path.resolve(import.meta.dirname,"..");
const get=relative=>JSON.parse(fs.readFileSync(path.join(root,relative),"utf8"));
const candidates=get("docs/curation-candidates.json");
const library=get("catalog/library.json");
const showcase=get("catalog/showcase.json");
assert.equal(candidates.schema_version,1);
assert.equal(candidates.purpose,"owner-review-only");
assert.equal(candidates.automatic_exhibition,false);
assert.ok(Array.isArray(candidates.ids)&&candidates.ids.length>0);
assert.equal(new Set(candidates.ids).size,candidates.ids.length);
const records=new Map(library.records.map(x=>[x.id,x]));
assert.equal(records.size,library.records.length);
const approved=new Set(showcase.approved_ids);
assert.equal(approved.size,showcase.approved_ids.length);
for(const id of approved){
 const r=records.get(id);
 assert.ok(r,"Approved gallery ID not in library: "+id);
 assert.ok(r.status!=="failed","Rejected work approved: "+id);
 assert.ok(r.thumbnail&&r.viewer,"Approved gallery item lacks real thumbnail/viewer: "+id);
 assert.ok(fs.statSync(path.join(root,r.thumbnail),{throwIfNoEntry:false})?.isFile(),"Approved gallery thumbnail missing: "+id);
 assert.ok(fs.statSync(path.join(root,r.viewer),{throwIfNoEntry:false})?.isFile(),"Approved gallery viewer missing: "+id);
}
for(const id of candidates.ids){
 const r=records.get(id);
 assert.ok(r,"Unregistered curatorial candidate: "+id);
 assert.ok(!["failed","blocked"].includes(r.status),"Unqualified failed/blocked candidate: "+id);
 assert.match(r.viewer,/^(scenes|experiments)\/[a-z0-9._/-]+\.html$/);
 assert.ok(!r.viewer.split("/").includes(".."));
 assert.ok(fs.statSync(path.join(root,r.viewer),{throwIfNoEntry:false})?.isFile(),"Missing real candidate viewer");
}
const pending=candidates.ids.filter(id=>!approved.has(id));
console.log("Sceneology curation gates passed: "+candidates.ids.length+" source-backed candidates, "+pending.length+" awaiting owner review, "+approved.size+" explicitly approved exhibits.");
