import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {samplePose,sampleChannel} from "../site/quest-girl-motion-sampler.mjs";
const root=path.resolve(import.meta.dirname,"..");
const spec=JSON.parse(fs.readFileSync(path.join(root,"characters/quest-girl-motion-v0.2.json"),"utf8"));
const character=JSON.parse(fs.readFileSync(path.join(root,"characters/quest-girl-v7.json"),"utf8"));
const selected=JSON.parse(fs.readFileSync(path.join(root,"catalog/showcase.json"),"utf8"));
assert.equal(spec.schema_version,1);
assert.equal(spec.character_id,character.id);
assert.equal(spec.character_source_blob,character.original_source_blob);
assert.match(spec.source_git_blob,/^[a-f0-9]{40}$/);
assert.equal(spec.source_acceptance,"passed-functional-baseline");
assert.equal(spec.artistic_approval,false);
assert.equal(spec.motion_style_final,false);
assert.equal(spec.clips.length,4);
assert.deepEqual(spec.clips.map(c=>c.id),["idle-soft","look-around","small-wave","step-in-place"]);
assert.deepEqual(spec.clips.map(c=>c.duration_seconds),[4.8,8,3.2,2.8]);
const all=new Set(character.parts.map(x=>x.id));
for(const clip of spec.clips){
 assert.equal(clip.loop,true);
 assert.ok(clip.channels.length);
 for(const ch of clip.channels){
  assert.ok(all.has(ch.part),"Unknown source rig part: "+ch.part);
  assert.ok(["x","y","z"].includes(ch.axis));
  assert.ok(["position","rotation"].includes(ch.property));
  assert.ok(typeof ch.target==="string"&&ch.target.includes(ch.part));
  assert.ok(Number.isFinite(sampleChannel(ch,0)));
  if(ch.waveform==="keyframes_smoothstep"){
   assert.equal(ch.keyframes[0][0],0);
   assert.equal(ch.keyframes.at(-1)[0],clip.duration_seconds);
   for(let i=1;i<ch.keyframes.length;i++)assert.ok(ch.keyframes[i][0]>ch.keyframes[i-1][0]);
  }
 }
 assert.deepEqual(samplePose(clip,0).channels,samplePose(clip,clip.duration_seconds).channels,"Loop not closed at boundary "+clip.id);
}
const byId=id=>spec.clips.find(c=>c.id===id);
assert.deepEqual(Object.keys(samplePose(byId("look-around"),2).channels),["head.pivot.rotation.y"]);
assert.equal(samplePose(byId("look-around"),2).channels["head.pivot.rotation.y"],-10);
assert.equal(samplePose(byId("look-around"),5).channels["head.pivot.rotation.y"],10);
assert.equal(samplePose(byId("look-around"),3.5).channels["head.pivot.rotation.y"],-5);
assert.ok(!Object.keys(samplePose(byId("small-wave"),.5).channels).some(k=>k.includes("head")||k.includes("root")),"Wave must not invent root/head movement");
assert.ok(!Object.keys(samplePose(byId("step-in-place"),.5).channels).some(k=>k.startsWith("root.")||k.startsWith("head.")),"Step must not add bounce or head motion");
const step=samplePose(byId("step-in-place"),.5).channels;
assert.ok(Math.abs(step["leg_left.pivot.rotation.x"]+step["leg_right.pivot.rotation.x"])<1e-9);
assert.ok(!selected.approved_ids.includes(spec.id));
console.log("Quest Girl v7 motion baseline: four source-valued clips and rig bindings verified; functional not artistic approval.");
