import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
const root=path.resolve(import.meta.dirname,"..");
const get=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const history=get("catalog/room-alias-candidates.json");
const staged=get("catalog/accepted-family-sources.json");
const orbit=get("site/family-orbit-data.json");
const gallery=get("catalog/showcase.json");
assert.equal(history.scenes.length,4);
assert.equal(gallery.approved_ids.length,24);
const pinned=new Map(staged.items.map(s=>[s.source_path+"#"+s.sha,s]));
const models=new Map(orbit.models.map(m=>[m.key,m]));
const result={
 schema_version:1,scope:"embedded shelf book geometry versus unresolved external shelf-books relation",
 owner_accepted_external_book_bindings:false,external_instances_resolved:false,
 no_extra_books_created:true,showcase_changed:false,rooms:[]
};
for(const scene of history.scenes){
 const raw=fs.readFileSync(path.join(root,scene.path));
 const sha=crypto.createHash("sha1").update(Buffer.from("blob "+raw.length+"\0")).update(raw).digest("hex");
 assert.equal(sha,scene.blob_sha);
 const content=raw.toString("utf8");
 const body=content.split("\ninstances:\n")[1]?.split("\nclearance_contract:\n")[0];
 assert.ok(body);
 const matches=[...body.matchAll(/^  - id: ([a-z][a-z0-9-]*)\s*$/gm)];
 const items=matches.map((hit,i)=>{
  const section=body.slice(hit.index,i+1<matches.length?matches[i+1].index:body.length);
  return {id:hit[1],alias:section.match(/^\s*asset_ref:\s*(\S+)/m)?.[1],
   relation:section.match(/^\s*parent_relation:\s*(\S+)/m)?.[1]};
 });
 const bookshelf=items.find(item=>item.id==="bookshelf"),books=items.find(item=>item.id==="shelf-books");
 assert.ok(bookshelf?.alias&&books?.alias&&books.relation==="on_bookshelf");
 const alias=history.aliases.find(row=>row.alias===bookshelf.alias);
 assert.ok(alias&&alias.selected_binding===null);
 const variants=alias.candidates.flatMap(candidate=>{
  const original=pinned.get(candidate.path+"#"+candidate.blob_sha);
  if(!original)return [];
  assert.equal(original.family,"bookshelves");
  assert.equal(original.new_renderer_visual_approval,false);
  const model=models.get(original.key);
  assert.ok(model&&model.source_sha===original.sha);
  const parts=[...new Set(model.faces.map(face=>face.part))];
  const embedded=parts.filter(id=>/^book_[0-9]+$/.test(id)).sort();
  const shelves=parts.filter(id=>/^shelf_(?:bottom|mid|upper|top)$/.test(id)).sort();
  assert.ok(embedded.length>=3,"No embedded shelf books in "+original.key);
  assert.ok(shelves.length>=2,"Model lacks shelf support parts "+original.key);
  return [{model_key:original.key,source_path:original.source_path,source_sha:original.sha,
   embedded_book_part_names:embedded,embedded_book_part_count:embedded.length,
   shelf_support_part_names:shelves,
   external_books_would_need_reconciliation:true,
   is_certified_original_room_variant:false}];
 }).sort((a,b)=>a.model_key.localeCompare(b.model_key));
 assert.equal(variants.length,3,"Original family staging now ambiguous in an unexpected way");
 result.rooms.push({id:scene.id,source_sha:scene.blob_sha,source_scene:scene.path,
  bookshelf_alias:bookshelf.alias,external_books_alias:books.alias,
  external_relation:"on_bookshelf",external_position_known:false,
  potential_source_duplication_in_proxy:true,
  does_not_establish_original_asset_identity:true,variants});
}
assert.equal(result.rooms.length,4);
fs.writeFileSync(path.join(root,"site/room-shelf-content-audit.json"),JSON.stringify(result,null,2)+"\n");
console.log("Sceneology shelf duplication audit: four unresolved external shelf-books relations; all three staged source bookshelf variants already include 3–4 modeled books. No further objects invented.");
