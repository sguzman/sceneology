import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
const root=path.resolve(import.meta.dirname,"..");
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const family=read("catalog/accepted-family-sources.json");
const orbit=read("site/family-orbit-data.json");
const scenes=read("catalog/room-alias-candidates.json");
const gallery=read("catalog/showcase.json");
assert.equal(gallery.approved_ids.length,24);
const stage=new Map(family.items.map(x=>[x.key,x]));
const model=new Map(orbit.models.map(x=>[x.key,x]));
const sha=b=>crypto.createHash("sha1").update(Buffer.from("blob "+b.length+"\0")).update(b).digest("hex");
function pinned(key){
 const item=stage.get(key),data=model.get(key);
 assert.ok(item&&data&&data.source_sha===item.sha&&item.new_renderer_visual_approval===false);
 const bytes=fs.readFileSync(path.join(root,item.public_path));
 assert.equal(sha(bytes),item.sha);
 return {item,data,source:bytes.toString("utf8")};
}
function bbox(data,part){
 const vs=data.faces.filter(f=>f.part===part).flatMap(f=>f.vertices);
 assert.ok(vs.length>=8,part+" missing in "+data.key);
 return [0,1,2].map(i=>Number((Math.max(...vs.map(v=>v[i]))-Math.min(...vs.map(v=>v[i]))).toFixed(6)));
}
const closed=pinned("closed-desk-book");
const cover=bbox(closed.data,"cover_top");
assert.deepEqual(cover,[.98,.035,1.16]);
const coverFragment=closed.source.split("\n  cover_top:\n")[1]?.split("\n  spine:\n")[0];
assert.equal(coverFragment?.match(/^\s+material:\s*(\w+)/m)?.[1],"pink");
const pinkSource=closed.source.split("\n  pink:\n")[1]?.split("\n  pink_dark:\n")[0];
assert.ok(pinkSource?.includes("#d7869f"));
const desks=["compact-hutch-desk","simple-study-desk","wide-writing-desk"].map(key=>{
 const {item,data}=pinned(key),top=bbox(data,"top"),minProjectedDepth=Math.min(cover[0],cover[2]);
 return {model_key:key,source_sha:item.sha,source_path:item.source_path,top_width:top[0],top_depth:top[2],
  closed_book_cover_min_depth_at_any_yaw:minProjectedDepth,
  centered_cover_minimum_side_overhang:Number(((minProjectedDepth-top[2])/2).toFixed(6)),
  cover_can_fit_without_overhang:minProjectedDepth<=top[2],
  original_binding_certified:false};
});
assert.ok(desks.every(x=>!x.cover_can_fit_without_overhang));
const lamps=["cozy-table-lamp","task-lamp"].map(key=>{
 const {item,data}=pinned(key),base=bbox(data,"base");
 return {model_key:key,source_sha:item.sha,source_path:item.source_path,
  base_width:base[0],base_depth:base[2],
  desk_candidates_with_possible_single_lamp_base_fit:desks.filter(x=>Math.min(base[0],base[2])<=x.top_depth).map(x=>x.model_key),
  local_light_behaviour_unverified:true,original_binding_certified:false};
});
const roomDeps=["cozy-bedroom-study-v1.3","study-corner-v1.1"].map(id=>{
 const record=scenes.scenes.find(x=>x.id===id);
 assert.ok(record);
 const bytes=fs.readFileSync(path.join(root,record.path));
 assert.equal(sha(bytes),record.blob_sha);
 const body=bytes.toString("utf8").split("\ninstances:\n")[1]?.split("\nclearance_contract:\n")[0];
 assert.ok(body);
 const entries=[...body.matchAll(/^  - id:\s*([a-z][a-z0-9-]*)\s*$/gm)].map((m,i,all)=>{
  const section=body.slice(m.index,i+1<all.length?all[i+1].index:body.length);
  return {id:m[1],alias:section.match(/^\s*asset_ref:\s*(\S+)/m)?.[1],
   parent:section.match(/^\s*parent_relation:\s*(\S+)/m)?.[1],
   color:section.match(/^\s*color:\s*(\w+)/m)?.[1],
   closed:section.includes("full_closed_volume: true")};
 });
 const book=entries.find(x=>x.id==="desk-book"),lamp=entries.find(x=>x.id==="lamp"||x.id==="table-lamp");
 assert.ok(book&&lamp&&book.parent==="on_desk"&&lamp.parent==="on_desk");
 assert.ok(book.closed&&book.color==="muted_blue");
 return {room_id:id,scene_sha:record.blob_sha,book_alias:book.alias,lamp_alias:lamp.alias,
  accepted_closed_book_color:"muted_blue",source_relative_attachment_transforms_absent:true};
});
const report={schema_version:1,kind:"source-verified-desk-attachment-compatibility",
 originality_and_visual_fidelity_certified:false,all_alias_bindings_unapproved:true,showcase_unchanged:true,
 staged_book:{source_sha:closed.item.sha,source_path:closed.item.source_path,
  cover_width:cover[0],cover_depth:cover[2],cover_material:"pink",cover_material_hex:"#d7869f",
  original_renderer_palette_override_unknown:true},
 desks,lamps,source_rooms:roomDeps,
 note:"Full unscaled closed-book top cover cannot fit wholly onto any of the three source desk tops at any in-plane yaw. Historical renderer scale and color overrides and exact bindings are unknown."};
fs.writeFileSync(path.join(root,"site/desk-attachment-compatibility.json"),JSON.stringify(report,null,2)+"\n");
console.log("Sceneology desk attachment compatibility: 3 desks too shallow for unscaled full closed cover, 2 lamp bases audited; source book pink versus original accepted muted blue.");
