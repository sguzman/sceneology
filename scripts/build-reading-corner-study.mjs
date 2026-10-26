import assert from "node:assert/strict";
import fs from "node:fs";
import crypto from "node:crypto";
import path from "node:path";
const root=path.resolve(import.meta.dirname,"..");
const original="scenes/composition-sources/reading-corner-v1.1.scene.yml";
const originalSha="89d925c4a78393331bd5c8921398fea880c21034";
const sourceBytes=fs.readFileSync(path.join(root,original));
const hash=crypto.createHash("sha1").update(Buffer.from("blob "+sourceBytes.length+"\0")).update(sourceBytes).digest("hex");
assert.equal(hash,originalSha,"Accepted reading-corner source changed");
const yml=sourceBytes.toString("utf8");
assert.match(yml,/^status: accepted$/m);
const orbit=JSON.parse(fs.readFileSync(path.join(root,"site/family-orbit-data.json"),"utf8"));
assert.equal(orbit.models.length,30);
assert.equal(orbit.automatic_gallery_approval,false);
const models=new Map(orbit.models.map(x=>[x.key,x]));
const references={
 "chair":"wide-cute-chair","floor-lamp":"tall-floor-lamp",
 "bookshelf":"tall-bookcase","window":"tall-two-pane-window",
 "plant":"tall-snake-plant","rug":"wide-area-rug"
};
const source=yml.split("\ninstances:\n")[1]?.split("\nclearance_contract:\n")[0];
assert.ok(source,"No original room instances");
const starts=[...source.matchAll(/^  - id: ([a-z][a-z0-9-]*)\s*$/gm)];
assert.equal(starts.length,8,"Reading corner instance list changed");
const items=[],unpositioned=[];
for(let i=0;i<starts.length;i++){
 const id=starts[i][1],text=source.slice(starts[i].index,i+1<starts.length?starts[i+1].index:source.length);
 const alias=text.match(/^\s*asset_ref:\s*(\S+)/m)?.[1];
 assert.ok(alias,"Missing authored asset ref "+id);
 const transform=text.match(/transform:\s*\{translate:\s*\[([^\]]+)\],\s*rotate_y_deg:\s*(-?\d+(?:\.\d+)?)\s*\}/);
 if(!transform){
  const relation=text.match(/^\s*parent_relation:\s*(\S+)/m)?.[1];
  assert.ok(relation&&!Object.hasOwn(references,id),"Ambiguous position "+id);
  unpositioned.push({id,alias,parent_relation:relation,geometry_omitted:true});
  continue;
 }
 const translate=transform[1].split(",").map(Number);
 const yaw=Number(transform[2]);
 assert.ok(translate.length===3&&translate.every(Number.isFinite)&&Number.isFinite(yaw));
 const name=references[id],model=models.get(name);
 assert.ok(name&&model&&model.faces.length>0,"Representative source not pinned "+id);
 items.push({id,alias,model_key:name,model_sha:model.source_sha,translate,yaw_deg:yaw});
}
assert.equal(items.length,6);
assert.deepEqual(unpositioned.map(x=>x.id),["lumbar-pillow","shelf-books"]);
const manifest={
 schema_version:1,
 project:"sceneology",study:"reading-corner-explicit-placement-reconstruction",
 source_scene:original,source_scene_sha:originalSha,
 historical_composition_accepted:true,rendering_is_original_accepted:false,
 model_variants_are_original_room_bindings:false,
 representative_asset_choices_from_separate_unapproved_occupancy_study:true,
 artistic_approval:false, gallery_approved:false,
 complete_room:false, floor_walls_lighting_reconstructed:false,
 instances:items,omitted_parented_instances:unpositioned
};
const out=path.join(root,"site/reading-corner-study-data.json");
fs.writeFileSync(out,JSON.stringify(manifest,null,2)+"\n");
console.log("Sceneology reading-corner partial geometry: six explicit world transforms and public representative models, two unpositioned attachments omitted; no room or gallery approval.");
