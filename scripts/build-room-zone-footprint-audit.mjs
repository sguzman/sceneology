import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {zoneFootprintScreen} from "../site/room-zone-footprint-audit.mjs";
const root=path.resolve(import.meta.dirname,"..");
const load=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const clearances=load("site/room-clearance-audit.json");
const research=load("site/room-proxy-review-data.json");
const reading=load("site/reading-corner-study-data.json");
const showcase=load("catalog/showcase.json");
assert.equal(clearances.rooms.length,4);
assert.equal(research.rooms.length,3);
assert.equal(showcase.approved_ids.length,24);
const byId=new Map([...research.rooms.map(r=>[r.id,r]),["reading-corner-v1.1",reading]]);
const records=[];
for(const scene of clearances.rooms){
 const source=byId.get(scene.room_id);
 assert.ok(source&&source.region_guide&&source.region_guide.architectural_shell_reconstructed===false);
 const registered=scene.geometry.instances;
 const zones=zoneFootprintScreen(source.region_guide,registered);
 assert.ok(zones.length>=1&&zones.length<=2);
 records.push({id:scene.room_id,original_room_scene:scene.source_scene,source_sha:scene.source_sha,
  model_selection_not_certified:true,semantic_zone_obstruction_not_proven:true,
  floor_geometry_unknown:true,explicitly_placed_proxy_count:registered.length,zones});
}
assert.equal(records.length,4);
const totalZones=records.reduce((n,x)=>n+x.zones.length,0);
assert.equal(totalZones,5);
const data={
 schema_version:1,status:"research-only-2d-reserved-zone-proxy-AABB-screen",
 source_region_overlap_not_equivalent_to_collision:true,
 does_not_establish_original_room_clearance:true,
 does_not_reconstruct_missing_parented_items:true,
 does_not_certify_walking_or_standing_space:true,
 approved_visual_artworks_added:0,
 zone_count:totalZones,represented_world_proxy_count:24,
 rooms:records
};
fs.writeFileSync(path.join(root,"site/room-zone-footprint-audit.json"),JSON.stringify(data,null,2)+"\n");
console.log("Sceneology conservative authored stage/circulation screen: "+totalZones+" X/Z reserved zones in 4 accepted room descriptions; "+records.reduce((n,r)=>n+r.zones.reduce((m,z)=>m+z.candidate_overlaps.length,0),0)+" broad-phase furniture X/Z candidates, no certified blocked space.");
