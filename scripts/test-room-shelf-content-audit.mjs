import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
const root=path.resolve(import.meta.dirname,"..");
const audit=JSON.parse(fs.readFileSync(path.join(root,"site/room-shelf-content-audit.json"),"utf8"));
const gallery=JSON.parse(fs.readFileSync(path.join(root,"catalog/showcase.json"),"utf8"));
const family=JSON.parse(fs.readFileSync(path.join(root,"catalog/accepted-family-sources.json"),"utf8"));
assert.equal(audit.schema_version,1);
assert.equal(audit.owner_accepted_external_book_bindings,false);
assert.equal(audit.external_instances_resolved,false);
assert.equal(audit.no_extra_books_created,true);
assert.equal(audit.showcase_changed,false);
assert.equal(audit.rooms.length,4);
assert.equal(gallery.approved_ids.length,24);
let total=0;
for(const room of audit.rooms){
 assert.equal(room.external_relation,"on_bookshelf");
 assert.equal(room.external_position_known,false);
 assert.equal(room.potential_source_duplication_in_proxy,true);
 assert.equal(room.does_not_establish_original_asset_identity,true);
 assert.equal(room.variants.length,3);
 const counts=room.variants.map(v=>v.embedded_book_part_count).sort();
 assert.deepEqual(counts,[3,3,4]);
 for(const v of room.variants){
  assert.equal(v.external_books_would_need_reconciliation,true);
  assert.equal(v.is_certified_original_room_variant,false);
  assert.ok(v.shelf_support_part_names.length>=2);
  assert.equal(new Set(v.embedded_book_part_names).size,v.embedded_book_part_count);
  const source=family.items.find(x=>x.key===v.model_key);
  assert.ok(source&&source.sha===v.source_sha&&source.source_path===v.source_path);
  assert.equal(source.new_renderer_visual_approval,false);
  total+=v.embedded_book_part_count;
 }
}
assert.equal(total,40,"Four representative bookshelf families must retain known embedded content");
console.log("Sceneology four-room embedded book audit passed: 40 book-part placements across 12 potential family variants, four external relations remain unbound and zero gallery approvals.");
