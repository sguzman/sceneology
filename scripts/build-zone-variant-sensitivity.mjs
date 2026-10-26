import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {analyzeProxyGeometry} from "../site/room-geometry-audit.mjs";
import {zoneFootprintScreen} from "../site/room-zone-footprint-audit.mjs";
const root=path.resolve(import.meta.dirname,"..");
const load=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const all=load("site/room-proxy-review-data.json");
const models=new Map(load("site/family-orbit-data.json").models.map(x=>[x.key,x]));
const pinned=new Map(load("catalog/accepted-family-sources.json").items.map(x=>[x.key,x]));
const original=load("site/room-zone-footprint-audit.json");
assert.equal(all.rooms.length,3);
assert.equal(original.rooms.length,4);
const flatten=zones=>zones.flatMap(z=>z.candidate_overlaps);
const tally=events=>({possible_pairs:events.length,
 cumulative_2d_overlapping_area:Number(events.reduce((n,e)=>n+e.rectangular_overlap_area,0).toFixed(5))});
function screen(room,changes=new Map()){
 const instances=room.placed.map(item=>{
  const key=changes.get(item.id)||item.default_model_key;
  const choice=item.choices.find(c=>c.key===key);
  const source=pinned.get(key);
  assert.ok(choice&&source&&source.sha===choice.source_sha&&source.source_path===choice.source_path);
  assert.equal(source.new_renderer_visual_approval,false);
  return {id:item.id,model_key:key,model_sha:choice.source_sha,translate:item.translate,yaw_deg:item.yaw_deg};
 });
 return flatten(zoneFootprintScreen(room.region_guide,analyzeProxyGeometry(instances,models).instances));
}
const result={schema_version:1,kind:"original-source-reserved-zone-variant-sensitivity",
 source_position_mutation:false,original_room_bindings_certified:false,
 no_new_gallery_approval:true,
 scope:"Original source-authored X/Z stage and circulation rectangles screened against unapproved model candidate world AABBs, one variant changed at a time",
 source_scene_room_revision_preserved:true,rooms:[]};
for(const room of all.rooms){
 const base=screen(room),baseline=tally(base),differences=[];
 for(const item of room.placed)for(const choice of item.choices.filter(x=>x.key!==item.default_model_key)){
  const candidate=screen(room,new Map([[item.id,choice.key]])),metrics=tally(candidate);
  if(metrics.possible_pairs!==baseline.possible_pairs||metrics.cumulative_2d_overlapping_area!==baseline.cumulative_2d_overlapping_area){
   differences.push({instance_id:item.id,base_model_key:item.default_model_key,
    candidate_model_key:choice.key,source_path:choice.source_path,source_sha:choice.source_sha,
    result:metrics,baseline,overlap_delta_area:Number((metrics.cumulative_2d_overlapping_area-baseline.cumulative_2d_overlapping_area).toFixed(5)),
    exact_original_variant_identified:false,geometry_clearance_certified:false});
  }
 }
 differences.sort((a,b)=>a.instance_id.localeCompare(b.instance_id)||a.candidate_model_key.localeCompare(b.candidate_model_key));
 result.rooms.push({room_id:room.id,original_source_sha:room.source_sha,baseline,
  baseline_overlap_candidates:base,one_variant_sensitive_alternatives:differences,
  all_variants_faithful_to_original_source_binding:false});
}
assert.equal(result.rooms.reduce((n,r)=>n+r.baseline.possible_pairs,0),1);
fs.writeFileSync(path.join(root,"site/room-zone-variant-sensitivity.json"),JSON.stringify(result,null,2)+"\n");
console.log("Sceneology reserved-zone alternative sensitivity: "+result.rooms.reduce((n,r)=>n+r.one_variant_sensitive_alternatives.length,0)+" measured single-source-variant changes, no inferred acceptance or changed room coordinates.");
