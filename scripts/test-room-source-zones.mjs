import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {extractSourceRoomZones} from "./parse-room-source-zones.mjs";
const root=path.resolve(import.meta.dirname,"..");
const scenes={
 "cozy-bedroom-study-v1.3":{zones:5,footprint:[6,5],char:"character-stage"},
 "study-corner-v1.1":{zones:4,footprint:null,char:"character-stage"},
 "sleep-room-v1":{zones:4,footprint:null,char:"bedside-stage"},
 "reading-corner-v1.1":{zones:4,footprint:null,char:"character-stage"}
};
for(const [name,expected] of Object.entries(scenes)){
 const s=fs.readFileSync(path.join(root,"scenes/composition-sources/"+name+".scene.yml"),"utf8");
 const data=extractSourceRoomZones(s);
 assert.equal(data.zones.length,expected.zones);
 assert.deepEqual(data.source_room_footprint,expected.footprint);
 assert.equal(data.architectural_shell_reconstructed,false);
 assert.equal(data.zone_volumes_reconstructed,false);
 assert.equal(data.placement_or_clearance_certified,false);
 assert.ok(data.zones.some(z=>z.id===expected.char));
 for(const z of data.zones)assert.ok(z.source_exact&&z.size.every(v=>v>0));
}
assert.throws(()=>extractSourceRoomZones("status: accepted\nzones:\n  - id: test\n    center: [0, 0]\n    size: [2, -1]\ninstances:\n"),/Invalid authored/);
assert.throws(()=>extractSourceRoomZones("status: candidate\nzones:\n  - id: test\n    center: [0, 0]\n    size: [2, 3]\ninstances:\n"),/accepted/);
console.log("Sceneology original source zones: 17 exact zone rectangles in 4 rooms, only cozy bedroom declares [6,5] architectural footprint; zero fabricated room shells.");
