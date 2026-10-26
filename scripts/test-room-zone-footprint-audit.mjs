import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {zoneFootprintScreen} from "../site/room-zone-footprint-audit.mjs";
const root=path.resolve(import.meta.dirname,"..");
const report=JSON.parse(fs.readFileSync(path.join(root,"site/room-zone-footprint-audit.json"),"utf8"));
const gallery=JSON.parse(fs.readFileSync(path.join(root,"catalog/showcase.json"),"utf8"));
assert.equal(report.schema_version,1);
assert.equal(report.zone_count,5);
assert.equal(report.rooms.length,4);
assert.equal(report.represented_world_proxy_count,24);
assert.equal(report.source_region_overlap_not_equivalent_to_collision,true);
assert.equal(report.does_not_establish_original_room_clearance,true);
assert.equal(report.does_not_certify_walking_or_standing_space,true);
assert.equal(report.approved_visual_artworks_added,0);
assert.equal(gallery.approved_ids.length,24);
let total=0;
for(const room of report.rooms){
 assert.equal(room.model_selection_not_certified,true);
 assert.equal(room.semantic_zone_obstruction_not_proven,true);
 assert.equal(room.floor_geometry_unknown,true);
 for(const z of room.zones){
  assert.ok(z.source_exact);
  assert.equal(z.all_overlap_results_are_inconclusive,true);
  assert.ok(["character-stage","bedside-stage","circulation"].includes(z.id));
  for(const event of z.candidate_overlaps){
   assert.equal(event.source_binding_certified,false);
   assert.equal(event.is_definite_obstruction,false);
   assert.ok(event.zone_fraction>0&&Number.isFinite(event.zone_fraction));
   assert.ok(event.overlap_x>0&&event.overlap_z>0);
   total++;
  }
  for(const exclusion of z.explicit_exclusions)assert.ok(["rug","window"].includes(exclusion.id));
 }
}
const region={architectural_shell_reconstructed:false,placement_or_clearance_certified:false,
 zones:[{id:"character-stage",center:[0,0],size:[2,2],source_exact:true}]};
const item=(id,x,z)=>({id,bbox:{min:[x,0,z],max:[x+1,1,z+1]}});
const test=zoneFootprintScreen(region,[item("chair",-0.5,-0.5),item("desk",1,-.5),item("rug",-1,-1)]);
assert.equal(test.length,1);
assert.deepEqual(test[0].candidate_overlaps.map(x=>x.id),["chair"]);
assert.equal(test[0].explicit_exclusions[0].id,"rug");
assert.equal(test[0].candidate_overlaps[0].zone_fraction,.25);
console.log("Sceneology 5 source-reserved-zone screen passed, "+total+" broad-phase candidate overlaps only; no invented collision, original asset binding or room-shell claims.");
