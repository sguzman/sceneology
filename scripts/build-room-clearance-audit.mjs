import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {analyzeProxyGeometry} from "../site/room-geometry-audit.mjs";
const root=path.resolve(import.meta.dirname,"..");
const load=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const proxy=load("site/room-proxy-review-data.json");
const reading=load("site/reading-corner-study-data.json");
const orbit=load("site/family-orbit-data.json");
const family=load("catalog/accepted-family-sources.json");
const showcase=load("catalog/showcase.json");
assert.equal(proxy.rooms.length,3);
assert.equal(reading.instances.length,6);
assert.equal(orbit.models.length,30);
assert.equal(showcase.approved_ids.length,24);
const modelMap=new Map(orbit.models.map(item=>[item.key,item]));
const staged=new Map(family.items.map(item=>[item.key,item]));
const prepared=[];
for(const room of proxy.rooms){
 const placed=room.placed.map(item=>{
  const selected=item.choices.find(c=>c.key===item.default_model_key);
  assert.ok(selected,"Missing deterministic research model "+item.id);
  const source=staged.get(selected.key);
  assert.ok(source&&source.sha===selected.source_sha&&source.source_path===selected.source_path);
  assert.equal(source.new_renderer_visual_approval,false);
  return {id:item.id,model_key:item.default_model_key,model_sha:selected.source_sha,
   translate:item.translate,yaw_deg:item.yaw_deg};
 });
 const analysis=analyzeProxyGeometry(placed,modelMap);
 assert.equal(analysis.instances.length,room.placed.length);
 prepared.push({room_id:room.id,source_scene:room.source_scene,source_sha:room.source_sha,
  variant_mode:"alphabetical-default-only",source_variants_approved:false,
  omitted_parented:room.omitted_parented.map(x=>x.id),geometry:analysis});
}
for(const item of reading.instances){
 const model=staged.get(item.model_key);
 assert.ok(model&&model.sha===item.model_sha);
}
prepared.push({room_id:"reading-corner-v1.1",source_scene:reading.source_scene,source_sha:reading.source_scene_sha,
 variant_mode:"unapproved-deterministic-character-occupancy-representatives",source_variants_approved:false,
 omitted_parented:reading.omitted_parented_instances.map(x=>x.id),
 geometry:analyzeProxyGeometry(reading.instances,modelMap)});
const data={schema_version:1,status:"technical-geometry-diagnostics-only",
 geometry_accepted:false,original_asset_bindings_certified:false,collision_clearance_accepted:false,
 room_shells_reconstructed:false,omitted_parented_count:13,
 explicitly_positioned_count:24,rooms:prepared};
assert.equal(data.rooms.length,4);
assert.equal(data.rooms.reduce((s,x)=>s+x.geometry.instances.length,0),24);
const dest=path.join(root,"site/room-clearance-audit.json");
fs.writeFileSync(dest,JSON.stringify(data,null,2)+"\n");
console.log("Sceneology room research geometric bounds: 24 placed model proxies across 4 historical layouts; conservative overlap candidates and origin-plane extents; zero certified collision or room acceptance.");
