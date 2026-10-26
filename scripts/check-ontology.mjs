import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import {errorsFor} from "./schema-subset.mjs";

const root=path.resolve(import.meta.dirname,"..");
export const load=rel=>JSON.parse(fs.readFileSync(path.join(root,rel),"utf8"));
export const schemas={
 scene:load("ontology/schemas/scene-v1.schema.json"),
 entity:load("ontology/schemas/entity-v1.schema.json"),
 experiment:load("ontology/schemas/experiment-v1.schema.json"),
 mapping:load("ontology/schemas/representation-map-v1.schema.json")
};
const requireValid=(value,schema)=>assert.deepEqual(errorsFor(value,schema,schema),[]);
const ensure=(ok,why)=>{if(!ok)throw Error(why);};
const vec=(value,n)=>Array.isArray(value)&&value.length===n&&value.every(Number.isFinite);

export function checkScene(s){
 requireValid(s,schemas.scene);
 const n=s.dimension==="2d"?2:3;
 ensure((s.frame.depth===undefined)===(n===2),"frame dimension mismatch");
 const items=new Map(),drawn=new Set();
 for(const e of s.elements){
  ensure(!items.has(e.id),"duplicate element");
  items.set(e.id,e);
  ensure(vec(e.transform.position,n)&&vec(e.transform.scale,n),"transform dimension mismatch");
  ensure(e.transform.scale.every(v=>v>0),"nonpositive scale");
  if(e.size)ensure(vec(e.size,n)&&e.size.every(v=>v>0),"invalid extent");
  const valid=n===2?["rectangle","ellipse","polygon","sprite","none"]:["box","sphere","mesh-reference","none"];
  ensure(valid.includes(e.shape),"shape/dimension mismatch");
  if(e.shape!=="none"&&!["camera","light","controller"].includes(e.role))drawn.add(e.id);
 }
 for(const e of s.elements)if(e.parent_id){
  let parent=e.parent_id,seen=new Set([e.id]);
  while(parent){ensure(items.has(parent)&&!seen.has(parent),"invalid parent chain");seen.add(parent);parent=items.get(parent).parent_id;}
 }
 const order=s.presentation.draw_order;
 ensure(order.length===drawn.size&&order.every(id=>drawn.has(id)),"draw order must list all visible shapes exactly once");
 if(s.presentation.camera_id)ensure(items.get(s.presentation.camera_id)?.role==="camera","camera reference invalid");
 for(const r of s.relations){
  ensure(items.has(r.subject_id)&&items.has(r.object_id)&&r.subject_id!==r.object_id,"invalid relation");
 }
 for(const c of s.constraints){
  ensure(items.has(c.subject_id),"constraint target absent");
  if(c.object_id)ensure(items.has(c.object_id)&&c.subject_id!==c.object_id,"invalid constraint pair");
  if(c.kind==="relative-order")ensure(!!c.object_id,"relative order requires object");
 }
 if(s.timeline){
  const properties=new Set();
  for(const t of s.timeline.tracks){
   ensure(items.has(t.target_id),"timeline target absent");
   const key=t.target_id+":"+t.property;
   ensure(!properties.has(key),"duplicate property track");properties.add(key);
   if(t.property==="visible")ensure(t.interpolation==="step","boolean interpolation must step");
   let last=-1;
   for(const frame of t.keyframes){
    ensure(frame.time_seconds>last&&frame.time_seconds<=s.timeline.duration_seconds,"invalid keyframe time");
    last=frame.time_seconds;
    const v=frame.value;
    if(["position","scale"].includes(t.property)){
     ensure(vec(v,n),"keyframe dimensions");
     if(t.property==="scale")ensure(v.every(a=>a>0),"keyframe scale");
    }else if(t.property==="visible")ensure(typeof v==="boolean","boolean keyframe type");
    else{
     ensure(typeof v==="number"&&Number.isFinite(v),"numeric keyframe type");
     if(t.property==="opacity")ensure(v>=0&&v<=1,"opacity keyframe range");
    }
   }
  }
 }
 for(const action of s.inputs||[]){
  ensure(items.has(action.target_id),"action target absent");
  if(action.action==="set-opacity")ensure(typeof action.value==="number","opacity action value missing");
  if(["play-timeline","pause-timeline"].includes(action.action))ensure(!!s.timeline,"timeline action without timeline");
 }
 const effects=new Set();
 for(const e of s.effects||[]){
  ensure(items.has(e.target_id)&&!effects.has(e.id),"effect target/id invalid");
  effects.add(e.id);
 }
 for(const c of s.audio_cues||[])ensure(items.has(c.target_id),"audio target absent");
 return true;
}
export function checkEntity(e){requireValid(e,schemas.entity);return true;}
export function checkExperiment(e){requireValid(e,schemas.experiment);return true;}

export function checkMapping(map,scene){
 requireValid(map,schemas.mapping);
 ensure(map.scene_id===scene.id&&map.scene_dimension===scene.dimension,"mapping scene identity/dimension");
 const ids=new Set(scene.elements.map(e=>e.id)),targets=new Set();
 const bound=new Set();
 for(const b of map.bindings){
  ensure(ids.has(b.element_id),"mapping source missing");
  ensure(!targets.has(b.target_id),"mapping target reused");targets.add(b.target_id);
  ensure(!bound.has(b.element_id),"mapping element rebound");bound.add(b.element_id);
 }
 if(map.scene_dimension==="2d")ensure(map.coordinate_conversion!=="world-to-clip","invalid 2D coordinate conversion");
 if(map.scene_dimension==="3d")ensure(map.coordinate_conversion!=="top-left-px-to-svg","invalid 3D coordinate conversion");
 if(map.status==="verified")ensure(map.unsupported_features.length===0,"incomplete mapping cannot be verified");
 return true;
}

const sceneFiles=["static-2d.scene.json","animated-2d.scene.json","static-3d.scene.json","interactive-2d.scene.json"];
for(const name of sceneFiles)checkScene(load("ontology/examples/"+name));
checkEntity(load("ontology/examples/reusable-entity.json"));
checkExperiment(load("ontology/examples/failed-experiment.json"));
checkMapping(load("ontology/examples/static-2d.mapping.json"),load("ontology/examples/static-2d.scene.json"));
// Negative controls guard the checks themselves: malformed data must fail.
const original=load("ontology/examples/animated-2d.scene.json");
const mutators=[
 x=>{x.elements[1].id=x.elements[0].id;},
 x=>{x.relations[0].object_id="missing";},
 x=>{x.elements[0].parent_id="leaf";},
 x=>{x.elements[0].transform.position=[0,0,0];},
 x=>{x.presentation.draw_order=["stem"];},
 x=>{x.timeline.tracks[0].keyframes[1].time_seconds=0;},
 x=>{x.timeline.tracks[0].keyframes[1].time_seconds=3;},
 x=>{x.elements[0].shape="box";},
 x=>{x.timeline.tracks[1].keyframes[0].value=5;},
 x=>{x.unknown_property=true;}
];
for(const mutate of mutators){
 const sample=structuredClone(original);mutate(sample);
 assert.throws(()=>checkScene(sample));
}
const invalidExperiment=load("ontology/examples/failed-experiment.json");
invalidExperiment.observations=[];
assert.throws(()=>checkExperiment(invalidExperiment));
const invalidEntity=load("ontology/examples/reusable-entity.json");
invalidEntity.dimensions=["4d"];
assert.throws(()=>checkEntity(invalidEntity));
const mapBad=load("ontology/examples/static-2d.mapping.json");mapBad.bindings[0].element_id="missing";
assert.throws(()=>checkMapping(mapBad,load("ontology/examples/static-2d.scene.json")));
console.log("Sceneology ontology verified: 7 positive fixtures and 13 negative controls.");
