import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const root=path.resolve(import.meta.dirname,"..");
const load=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const manifest=load("docs/PROVENANCE-MANIFEST.json");
const library=load("catalog/library.json");
assert.equal(manifest.schema_version,1);
assert.equal(manifest.project,"sceneology");
assert.equal(manifest.review_scope,"currently-admitted-technical-library-only");
assert.ok(Array.isArray(manifest.items));
assert.equal(manifest.items.length,library.records.length,"Every admitted catalog record needs release provenance");
const byId=new Map(manifest.items.map(x=>[x.id,x]));
assert.equal(byId.size,manifest.items.length,"Duplicate manifest ID");
const shaFor=p=>{
  const bytes=fs.readFileSync(path.join(root,p));
  return crypto.createHash("sha1").update(Buffer.from("blob "+bytes.length+"\0")).update(bytes).digest("hex");
};
const validPath=p=>typeof p==="string" &&
  /^(?:scenes|source-scenes|models|characters|experiments|assets|runtime|tools)\/[a-zA-Z0-9._/-]+$/.test(p) &&
  !p.split("/").some(x=>!x||x==="."||x==="..");
let localDependencies=0;
for(const record of library.records){
  const evidence=byId.get(record.id);
  assert.ok(evidence,"Unreviewed library record "+record.id);
  assert.equal(evidence.path,record.path,"Source path drift: "+record.id);
  assert.equal(evidence.kind,record.kind);
  assert.equal(evidence.technical_status,record.status);
  assert.equal(evidence.rights,record.rights);
  assert.equal(evidence.source_origin,record.provenance.origin);
  assert.equal(evidence.source_blob,record.provenance.source_blob||null);
  assert.ok(validPath(record.path));
  assert.match(evidence.git_blob_sha,/^[a-f0-9]{40}$/);
  assert.equal(shaFor(record.path),evidence.git_blob_sha,"Admitted source changed without re-review: "+record.id);
  assert.deepEqual(evidence.external_resources,[],"External resource requires separate licensed review");
  const required=new Map();
  for(const dep of evidence.required_local_files){
    assert.ok(validPath(dep.path)&&!required.has(dep.path),"Invalid/duplicate transitive dependency");
    assert.equal(shaFor(dep.path),dep.git_blob_sha,"Dependency changed without review: "+dep.path);
    required.set(dep.path,dep);localDependencies++;
  }
  const html=fs.readFileSync(path.join(root,record.path),"utf8");
  assert.ok(!/\b(?:fetch\s*\(|WebSocket\b|XMLHttpRequest\b|import\s*\(|require\s*\()/i.test(html),"Network/dynamic reference not cleared: "+record.id);
  const refs=[...html.matchAll(/\b(?:src|href)\s*=\s*(["'])(.*?)\1/g)].map(m=>m[2]);
  const used=new Set();
  for(const ref of refs){
    assert.ok(!/^(?:https?:|data:|javascript:|\/\/)/i.test(ref),"External/embedded resource without clearance: "+record.id);
    if(ref.startsWith("#"))continue;
    const local=path.posix.normalize(path.posix.join(path.posix.dirname(record.path),ref));
    assert.ok(required.has(local),"Undeclared linked asset "+local+" in "+record.id);
    used.add(local);
  }
  for(const dep of required.keys())assert.ok(used.has(dep),"Declared but unused resource "+dep);
}
console.log("Sceneology provenance manifest verified: "+manifest.items.length+" artifact hashes, "+localDependencies+" pinned local dependencies, zero unreviewed external resources.");
