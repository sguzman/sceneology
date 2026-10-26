import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
const root=path.resolve(import.meta.dirname,"..");
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const source=read("catalog/accepted-family-sources.json"),orbit=read("site/family-orbit-data.json"),showcase=read("catalog/showcase.json");
assert.equal(orbit.schema_version,1);
assert.equal(orbit.review_only,true);
assert.equal(orbit.renderer_equivalent_to_source,false);
assert.equal(orbit.automatic_gallery_approval,false);
assert.equal(orbit.models.length,30);
const originals=new Map(source.items.map(x=>[x.key,x]));
const allowed=new Set(showcase.approved_ids);
let faces=0;
for(const record of orbit.models){
 const s=originals.get(record.key);
 assert.ok(s,"Unrecognized orbit model "+record.key);
 assert.equal(record.family,s.family);assert.equal(record.source_sha,s.sha);
 const bytes=fs.readFileSync(path.join(root,s.public_path));
 const hash=crypto.createHash("sha1").update(Buffer.from("blob "+bytes.length+"\0")).update(bytes).digest("hex");
 assert.equal(hash,s.sha,"Orbit has unreviewed source "+record.key);
 assert.ok(record.faces.length>=6);
 for(const face of record.faces){
  assert.match(face.color,/^#[a-f0-9]{6}$/i);
  assert.match(face.part,/^[a-z][a-z0-9_]*$/);
  assert.ok(face.vertices.length===4&&face.vertices.every(p=>p.length===3&&p.every(Number.isFinite)));
 }
 assert.ok(!allowed.has(record.key)&&s.new_renderer_visual_approval===false);
 faces+=record.faces.length;
}
assert.equal(originals.size,30);
assert.ok(faces>300);
console.log("Sceneology technical orbit review: 30 SHA-pinned 3D source specimens, "+faces+" source faces, zero accidental gallery approvals.");
