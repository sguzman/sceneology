import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {migrateSyntheticSceneV0} from "./migrate-scene-v0.mjs";
import {checkScene,checkEntity,checkExperiment,checkMapping,load} from "./check-ontology.mjs";

const examples="ontology/examples/";
const equalRoundTrip=(value)=>assert.deepEqual(JSON.parse(JSON.stringify(value)),value);
const sceneFiles=["static-2d.scene.json","animated-2d.scene.json","static-3d.scene.json","interactive-2d.scene.json"];
for(const name of sceneFiles){const v=load(examples+name);checkScene(v);equalRoundTrip(v);}
for(const [name,fn] of [["reusable-entity.json",checkEntity],["failed-experiment.json",checkExperiment]]){
 const obj=load(examples+name);fn(obj);equalRoundTrip(obj);
}
const mapping=load(examples+"static-2d.mapping.json");
checkMapping(mapping,load(examples+"static-2d.scene.json"));equalRoundTrip(mapping);
const legacy=load(examples+"legacy-static-2d-v0.json");
const migrated=migrateSyntheticSceneV0(legacy);
checkScene(migrated);equalRoundTrip(migrated);
assert.equal(migrated.schema_version,1);
assert.equal(migrated.id,legacy.id);
assert.deepEqual(migrated.presentation.draw_order,legacy.shapes.map(x=>x.id));
for(let i=0;i<legacy.shapes.length;i++){
 const before=legacy.shapes[i],after=migrated.elements[i];
 assert.equal(after.id,before.id);
 assert.deepEqual(after.transform.position,[before.x,before.y]);
 assert.deepEqual(after.size,[before.width,before.height]);
 assert.equal(after.color,before.fill);
}
const edits=[
 x=>{x.schema_version=2;},
 x=>{x.shapes[1].id=x.shapes[0].id;},
 x=>{x.shapes[0].width=0;},
 x=>{x.shapes[0].type="unknown";},
 x=>{x.shapes[0].x=-1;},
 x=>{x.shapes[0].fill="not-a-color";},
 x=>{x.canvas.width=0;}
];
for(const mutate of edits){
 const x=structuredClone(legacy);mutate(x);
 assert.throws(()=>migrateSyntheticSceneV0(x));
}
const wrong=structuredClone(migrated);wrong.schema_version=2;
assert.throws(()=>checkScene(wrong));
console.log("Sceneology version contract: 7 v1 fixtures round-trip, synthetic v0 upgrades, 8 negative compatibility cases pass.");
