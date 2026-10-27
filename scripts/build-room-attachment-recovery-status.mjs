import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
const root=path.resolve(import.meta.dirname,"..");
const load=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const rooms=load("site/room-proxy-review-data.json").rooms;
const reading=load("site/reading-corner-study-data.json");
const sourceCensus=load("catalog/room-alias-candidates.json");
const showcase=load("catalog/showcase.json");
const bed=load("site/room-attachment-fit-audit.json");
const pillow=load("site/bed-pillow-placement-research.json");
const lumbar=load("site/reading-lumbar-placement-data.json");
const bookshelf=load("site/room-shelf-content-audit.json");
const desk=load("site/desk-attachment-compatibility.json");
const bookReview=load("catalog/desk-book-review-provenance.json");
const lampReview=load("catalog/lamp-review-provenance.json");
assert.equal(showcase.approved_ids.length,24);
assert.equal(rooms.length,3);
assert.equal(reading.instances.length,6);
assert.equal(reading.omitted_parented_instances.length,2);
assert.equal(sourceCensus.scenes.length,4);
assert.equal(bed.accepted_room_bedding_dependencies.length,2);
assert.equal(pillow.original_bed_candidates.length,3);
assert.equal(lumbar.proposal_accepted,false);
assert.equal(bookshelf.rooms.length,4);
assert.equal(desk.desks.length,3);
assert.equal(bookReview.facts.exact_blue_room_mesh_source_recovered,false);
assert.equal(lampReview.original_historical_room_lamp_bindings_certified,false);
const initial=[
 ...rooms.map(r=>({id:r.id,source_scene:r.source_scene,sha:r.source_sha,positioned:r.placed,attached:r.omitted_parented})),
 {id:"reading-corner-v1.1",source_scene:reading.source_scene,sha:reading.source_scene_sha,
  positioned:reading.instances,attached:reading.omitted_parented_instances}
];
const hash=b=>crypto.createHash("sha1").update(Buffer.from("blob "+b.length+"\0")).update(b).digest("hex");
const classOf=x=>{
 if(x.parent_instance==="bed"&&/pillow/.test(x.id))return "bed-pillow";
 if(x.parent_instance==="bed"&&/blanket/.test(x.id))return "bed-blanket";
 if(x.parent_instance==="desk"&&/lamp/.test(x.id))return "desk-lamp";
 if(x.parent_instance==="desk"&&/book/.test(x.id))return "desk-book";
 if(x.parent_instance==="bookshelf"&&x.id==="shelf-books")return "shelf-books";
 if(x.parent_instance==="chair"&&x.id==="lumbar-pillow")return "lumbar-pillow";
 throw Error("Unclassified exact-source parent attachment "+x.id+"/"+x.parent_instance);
};
const evidence={
 "bed-pillow":{files:["site/room-attachment-fit-audit.json","site/bed-pillow-placement-research.json"],
  blockers:["original_bed_variant_unbound","embedded_bedding_duplication_risk","historical_parent_transform_unknown"]},
 "bed-blanket":{files:["site/room-attachment-fit-audit.json","catalog/room-blanket-target.json"],
  blockers:["accepted_blanket_v1_3_unrecovered","embedded_bedding_duplication_risk","historical_parent_transform_unknown"]},
 "desk-lamp":{files:["site/desk-attachment-compatibility.json","catalog/lamp-review-provenance.json"],
  blockers:["original_table_lamp_variant_unbound","lamp_local_light_parenting_unverified","historical_parent_transform_unknown"]},
 "desk-book":{files:["site/desk-attachment-compatibility.json","catalog/desk-book-review-provenance.json"],
  blockers:["full_source_cover_cannot_fit_staged_desks","blue_room_realization_source_unrecovered","historical_parent_transform_unknown"]},
 "shelf-books":{files:["site/room-shelf-content-audit.json"],
  blockers:["staged_bookshelf_already_contains_embedded_books","original_shelf_book_attachment_interpretation_unknown"]},
 "lumbar-pillow":{files:["site/reading-lumbar-placement-data.json","site/room-attachment-fit-audit.json"],
  blockers:["all_three_chair_support_surfaces_narrower_than_unscaled_pillow","historical_parent_transform_unknown"]}
};
let positioned=0;
const details=[],counts={};
for(const room of initial){
 const original=sourceCensus.scenes.find(x=>x.id===room.id);
 assert.ok(original&&original.blob_sha===room.sha&&original.path===room.source_scene);
 const bytes=fs.readFileSync(path.join(root,room.source_scene));
 assert.equal(hash(bytes),room.sha,"Archived original room source has changed");
 assert.equal(room.positioned.length+room.attached.length,original.instance_references);
 positioned+=room.positioned.length;
 for(const item of room.attached){
  assert.ok(room.positioned.some(p=>p.id===item.parent_instance));
  assert.equal(item.parent_relation,"on_"+item.parent_instance);
  const role=classOf(item);
  const files=evidence[role].files;
  const blockers=role==="bed-blanket"?
   (item.alias.endsWith("blanket/bed-cover-v1.3")?
    ["explicit_accepted_blanket_v1_3_source_unrecovered","embedded_bedding_duplication_risk","historical_parent_transform_unknown"]:
    ["generic_bed_cover_alias_not_bound_to_exact_accepted_source","embedded_bedding_duplication_risk","historical_parent_transform_unknown"]):
   evidence[role].blockers;
  for(const f of files)assert.ok(fs.statSync(path.join(root,f)).isFile(),"Missing bounded source evidence "+f);
  const proposal=role==="bed-pillow"||role==="lumbar-pillow";
  counts[role]=(counts[role]||0)+1;
  details.push({room_id:room.id,room_source:room.source_scene,source_sha:room.sha,
   original_instance:item.id,original_asset_alias:item.alias,
   exact_parent_instance:item.parent_instance,source_relation:item.parent_relation,
   relation_source_derived:true,original_world_transform_known:false,
   exact_accepted_asset_binding_certified:false,
   technical_parent_placement_proposal_exists:proposal,
   technical_proposal_artistically_approved:false,
   blockers,evidence_files:files,role});
 }
}
assert.equal(positioned,24);
assert.equal(details.length,13);
assert.deepEqual(counts,{"bed-pillow":2,"bed-blanket":2,"desk-lamp":2,"desk-book":2,"shelf-books":4,"lumbar-pillow":1});
const proposed=details.filter(x=>x.technical_parent_placement_proposal_exists).length;
assert.equal(proposed,3);
const report={schema_version:1,status:"exact-source-four-room-attachment-recovery-census",
 historical_room_count:4,authored_world_positions:positioned,missing_explicit_parent_world_positions:details.length,
 technical_proposal_count:proposed,
 distinct_technical_proposal_methods:2,
 original_accepted_parent_placements_certified:0,
 certified_historical_room_asset_bindings:0,
 new_artworks_approved:0,
 original_art_gallery_unchanged:true,
 categories:counts,
 source_uncertainties_must_not_be_turned_into_auto_bindings:true,
 attachments:details};
fs.writeFileSync(path.join(root,"site/room-attachment-recovery-status.json"),JSON.stringify(report,null,2)+"\n");
console.log("Sceneology 4-room provenance ledger: 24 explicit positions; 13 missing exact parent transforms in 6 classes; 3 unapproved technical proposals, zero reconstructed original parent bindings.");
