import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {analyzeProxyGeometry} from "../site/room-geometry-audit.mjs";
const root=path.resolve(import.meta.dirname,"..");
const load=name=>JSON.parse(fs.readFileSync(path.join(root,name),"utf8"));
const proxy=load("site/room-proxy-review-data.json");
const family=load("catalog/accepted-family-sources.json");
const orbit=load("site/family-orbit-data.json");
const models=new Map(orbit.models.map(m=>[m.key,m]));
const sources=new Map(family.items.map(m=>[m.key,m]));
assert.equal(proxy.rooms.length,3);
assert.equal(orbit.models.length,30);
const output={schema_version:1,scope:"single-variant research substitutions improving conservative AABB overlap warnings",
 automatic_source_binding:false,original_historical_variants_inferred:false,
 collision_clearance_certified:false,artistic_approval:false,
 default_policy:"research alphabetic specimen only; all other variants are suggestions for technical comparison, not historical identities",
 rooms:[]};
for(const room of proxy.rooms){
 function placements(overrides=new Map()){
  return room.placed.map(item=>{
   const choice=item.choices.find(c=>c.key===(overrides.get(item.id)||item.default_model_key));
   assert.ok(choice);
   const source=sources.get(choice.key);
   assert.ok(source&&source.sha===choice.source_sha&&source.source_path===choice.source_path);
   assert.equal(source.new_renderer_visual_approval,false);
   return {id:item.id,model_key:choice.key,model_sha:choice.source_sha,translate:item.translate,yaw_deg:item.yaw_deg};
  });
 }
 const baseline=analyzeProxyGeometry(placements(),models);
 const reductions=[];
 for(const item of room.placed){
  for(const alternative of item.choices.filter(c=>c.key!==item.default_model_key)){
   const selected=new Map([[item.id,alternative.key]]);
   const tested=analyzeProxyGeometry(placements(selected),models);
   if(tested.total_candidate_pairs<baseline.total_candidate_pairs){
    reductions.push({instance:item.id,from_key:item.default_model_key,to_key:alternative.key,
     to_source_sha:alternative.source_sha,to_source_path:alternative.source_path,
     default_possible_pairs:baseline.total_candidate_pairs,
     alternative_possible_pairs:tested.total_candidate_pairs,
     alternative_part_bound_pairs:tested.component_bbox_candidate_pairs,
     certified_binding:false,collision_confirmed:false});
   }
  }
 }
 reductions.sort((a,b)=>a.alternative_possible_pairs-b.alternative_possible_pairs||a.instance.localeCompare(b.instance)||a.to_key.localeCompare(b.to_key));
 output.rooms.push({id:room.id,source_sha:room.source_sha,
  baseline_possible_pairs:baseline.total_candidate_pairs,
  baseline_component_pairs:baseline.component_bbox_candidate_pairs,
  one_change_reductions:reductions});
}
assert.equal(output.rooms.length,3);
const filename=path.join(root,"site/room-variant-reduction.json");
fs.writeFileSync(filename,JSON.stringify(output,null,2)+"\n");
console.log("Sceneology proxy room alternatives: "+output.rooms.reduce((n,r)=>n+r.one_change_reductions.length,0)+" grounded single-variant comparison candidates; zero certified historical model identifications.");
