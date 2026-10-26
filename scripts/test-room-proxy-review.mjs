import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
const root=path.resolve(import.meta.dirname,"..");
const load=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const data=load("site/room-proxy-review-data.json");
const family=load("catalog/accepted-family-sources.json");
const original=load("catalog/room-alias-candidates.json");
const orbit=load("site/family-orbit-data.json");
const gallery=load("catalog/showcase.json");
assert.equal(data.schema_version,1);
assert.equal(data.review_only,true);
for(const key of ["historical_scene_geometry_original","source_model_bindings_certified","room_renderer_parity","showcase_approved"])assert.equal(data[key],false,key);
assert.equal(data.rooms.length,3);
assert.equal(new Set(data.rooms.map(r=>r.id)).size,3);
const models=new Map(orbit.models.map(m=>[m.key,m]));
let placed=0,unplaced=0;
for(const room of data.rooms){
 const evidence=original.scenes.find(s=>s.id===room.id);
 assert.ok(evidence);
 const bytes=fs.readFileSync(path.join(root,room.source_scene));
 const hash=crypto.createHash("sha1").update(Buffer.from("blob "+bytes.length+"\0")).update(bytes).digest("hex");
 assert.equal(hash,room.source_sha);assert.equal(hash,evidence.blob_sha);
 assert.equal(room.source_composition_historically_accepted,true);
 assert.equal(room.renderer_aesthetic_accepted,false);
 assert.equal(room.substituted_unrecovered_blanket,false);
 assert.equal(room.placed.length+room.omitted_parented.length,room.total_original_instances);
 assert.ok(!gallery.approved_ids.includes(room.id));
 for(const item of room.placed){
  assert.ok(item.translate.length===3&&item.translate.every(Number.isFinite)&&Number.isFinite(item.yaw_deg));
  assert.equal(item.selected_binding_certified,false);
  const alias=original.aliases.find(a=>a.alias===item.alias);
  assert.ok(alias&&alias.selected_binding===null);
  assert.ok(item.choices.length>0);
  assert.equal(item.default_model_key,[...item.choices].sort((a,b)=>a.key.localeCompare(b.key))[0].key);
  for(const choice of item.choices){
   const source=family.items.find(f=>f.key===choice.key);
   assert.ok(source&&source.source_path===choice.source_path&&source.sha===choice.source_sha);
   assert.equal(source.new_renderer_visual_approval,false);
   assert.ok(alias.candidates.some(c=>c.path===choice.source_path&&c.blob_sha===choice.source_sha));
   assert.equal(models.get(choice.key)?.source_sha,choice.source_sha);
  }
  assert.ok(!item.alias.includes("blanket"),"No historical blanket may be silently substituted");
 }
 for(const item of room.omitted_parented){
  assert.equal(item.placement_unknown,true);
  assert.ok(item.parent_relation);
  assert.ok(!("translate" in item));
 }
 placed+=room.placed.length;unplaced+=room.omitted_parented.length;
}
assert.equal(placed,18);
assert.equal(unplaced,11);
assert.equal(placed+unplaced,29);
console.log("Sceneology source-grounded multi-room proxy QA: 18 explicit placements, 11 withheld parent attachments, variant choices provenance-checked; no historical renderer or gallery claim.");
