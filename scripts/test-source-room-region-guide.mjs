import assert from "node:assert/strict";
import {sourceZonePolygons,renderZoneGuide} from "../site/source-room-region-guide.mjs";
const source={
 architectural_shell_reconstructed:false,zone_volumes_reconstructed:false,
 placement_or_clearance_certified:false,footprint_only_if_explicit:true,
 source_room_footprint:[6,5],
 zones:[{id:"character-stage",center:[0,-.75],size:[2.2,1.7],source_exact:true}]
};
const data=sourceZonePolygons(source);
assert.equal(data.length,2);
assert.equal(data[0].kind,"explicit-footprint");
assert.deepEqual(data[0].vertices[0],[-3,0,-2.5]);
assert.ok(data[1].vertices[2].every((v,i)=>Math.abs(v-[1.1,0,.1][i])<1e-10));
const svg=renderZoneGuide(data,([x,y,z])=>[x*100+400,z*100+250]);
assert.ok(svg.includes('data-zone-guide="source-footprint"'));
assert.ok(svg.includes('data-zone-guide="character-stage"'));
assert.ok(!svg.includes("NaN")&&!svg.includes("Infinity"));
assert.throws(()=>sourceZonePolygons({...source,source_room_footprint:null}),/Inferred room outline/);
assert.throws(()=>sourceZonePolygons({...source,zones:[{...source.zones[0],id:"<svg onload=alert(1)>"}]}),/Corrupt/);
assert.throws(()=>sourceZonePolygons({...source,zones:[],source_room_footprint:[6,5]}),/Unverified/);
assert.throws(()=>renderZoneGuide(data,()=>[Infinity,0]),/Nonfinite/);
console.log("Sceneology source zone SVG: exact X/Z rectangles only, known footprint gate, safe identifiers, finite projections and no generated walls.");
