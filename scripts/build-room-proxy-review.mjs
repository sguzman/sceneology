import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const root=path.resolve(import.meta.dirname,"..");
const read=rel=>JSON.parse(fs.readFileSync(path.join(root,rel),"utf8"));
const manifest=read("catalog/room-alias-candidates.json");
const families=read("catalog/accepted-family-sources.json");
const orbit=read("site/family-orbit-data.json");
const sha=bytes=>crypto.createHash("sha1").update(Buffer.from("blob "+bytes.length+"\0")).update(bytes).digest("hex");
assert.equal(manifest.scenes.length,4);
assert.equal(orbit.models.length,30);
assert.equal(orbit.automatic_gallery_approval,false);
const modelBySource=new Map(families.items.map(item=>[item.source_path+"#"+item.sha,item]));
const orbitByKey=new Map(orbit.models.map(item=>[item.key,item]));
const aliasByName=new Map(manifest.aliases.map(item=>[item.alias,item]));
const result={schema_version:1,kind:"unapproved-room-variant-proxy-research",review_only:true,
 historical_scene_geometry_original:false,source_model_bindings_certified:false,
 room_renderer_parity:false,showcase_approved:false,
 choice_policy:"Alphabetical first staged candidate for initial research display only; user may inspect exact-source alternatives. Neither default nor alternatives are certified accepted room bindings.",
 rooms:[]};
const counts={"cozy-bedroom-study-v1.3":[7,5],"study-corner-v1.1":[6,3],"sleep-room-v1":[5,3]};
for(const scene of manifest.scenes.filter(x=>Object.hasOwn(counts,x.id))){
 const bytes=fs.readFileSync(path.join(root,scene.path));
 assert.equal(sha(bytes),scene.blob_sha,"Historical room source mutated: "+scene.id);
 const text=bytes.toString("utf8");
 assert.match(text,/^status:\s*accepted\s*$/m);
 const body=text.split("\ninstances:\n")[1]?.split("\nclearance_contract:\n")[0];
 assert.ok(body,"Missing historical instances "+scene.id);
 const matches=[...body.matchAll(/^  - id:\s*([a-z][a-z0-9-]*)\s*$/gm)];
 assert.equal(matches.length,scene.instance_references);
 const placed=[],parented=[];
 for(let i=0;i<matches.length;i++){
  const id=matches[i][1];
  const section=body.slice(matches[i].index,i+1<matches.length?matches[i+1].index:body.length);
  const alias=section.match(/^\s*asset_ref:\s*(\S+)/m)?.[1];
  assert.ok(alias&&aliasByName.has(alias),"Unrecognized source alias "+id);
  const relation=section.match(/^\s*parent_relation:\s*(\S+)/m)?.[1];
  const transform=section.match(/transform:\s*\{\s*translate:\s*\[([^\]]+)\]\s*,\s*rotate_y_deg:\s*(-?(?:\d+\.?\d*|\.\d+))\s*\}/);
  if(!transform){
   assert.ok(relation,"Missing source position and parent relation for "+id);
   const parentInstance=relation.startsWith("on_")?relation.slice(3):null;
   assert.ok(parentInstance&&/^[a-z][a-z0-9-]*$/.test(parentInstance),"Unrecognized authored parent relation "+relation);
   parented.push({id,alias,parent_relation:relation,parent_instance:parentInstance,
    relation_resolved_to_source_instance:true,placement_unknown:true});
   continue;
  }
  assert.equal(relation,undefined,"Explicit source placement unexpectedly also parent-relative "+id);
  const translate=transform[1].split(",").map(Number),yaw=Number(transform[2]);
  assert.equal(translate.length,3);
  assert.ok(translate.every(Number.isFinite)&&Number.isFinite(yaw));
  const aliasData=aliasByName.get(alias);
  assert.equal(aliasData.selected_binding,null,"Unsafe automatic room binding "+alias);
  const choices=aliasData.candidates.map(c=>{
   const prepared=modelBySource.get(c.path+"#"+c.blob_sha);
   if(!prepared)return null;
   const model=orbitByKey.get(prepared.key);
   assert.ok(model&&model.source_sha===c.blob_sha,"Staged orbit/source identity mismatch "+id);
   assert.equal(prepared.new_renderer_visual_approval,false);
   return {key:prepared.key,source_sha:c.blob_sha,source_path:c.path};
  }).filter(Boolean).sort((a,b)=>a.key.localeCompare(b.key));
  assert.ok(choices.length>0,"No accepted-family staged representative available for authored position "+id);
  assert.equal(new Set(choices.map(c=>c.key)).size,choices.length);
  placed.push({id,alias,translate,yaw_deg:yaw,default_model_key:choices[0].key,
    choices,selected_binding_certified:false});
 }
 assert.deepEqual([placed.length,parented.length],counts[scene.id],"Position census changed "+scene.id);
 for(const attachment of parented){
  assert.ok(placed.some(item=>item.id===attachment.parent_instance),
   "Attachment parent lacks source-provided world position "+attachment.id);
 }
 result.rooms.push({id:scene.id,source_scene:scene.path,source_sha:scene.blob_sha,
  source_composition_historically_accepted:true,renderer_aesthetic_accepted:false,
  placed,omitted_parented:parented,total_original_instances:scene.instance_references,
  substituted_unrecovered_blanket:false});
}
assert.equal(result.rooms.length,3);
assert.equal(result.rooms.reduce((n,r)=>n+r.placed.length,0),18);
assert.equal(result.rooms.reduce((n,r)=>n+r.omitted_parented.length,0),11);
assert.ok(!result.rooms.some(r=>r.placed.some(p=>p.alias.includes("blanket"))),"Unapproved blanket cannot enter geometry");
const output=path.join(root,"site/room-proxy-review-data.json");
fs.writeFileSync(output,JSON.stringify(result,null,2)+"\n");
console.log("Sceneology source-only proxy studies: 3 rooms, 18 original 3D positions, 11 deliberately unplaced attachments; zero certified room bindings or artwork approvals.");
