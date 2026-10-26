import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
const root=path.resolve(import.meta.dirname,"..");
const base=process.env.SCENEOLOGY_SITE_URL;
assert.ok(base?.startsWith("https://"),"Deployed HTTPS URL required");
const url=new URL("site/room-clearance-audit.json",base.endsWith("/")?base:base+"/");
url.searchParams.set("revision",process.env.GITHUB_SHA||"latest");
const local=fs.readFileSync(path.join(root,"site/room-clearance-audit.json"));
let last;
for(let attempt=0;attempt<5;attempt++){
 try{
  const response=await fetch(url,{cache:"no-store",signal:AbortSignal.timeout(18000)});
  assert.equal(response.status,200,"Missing published geometry audit");
  assert.ok(Buffer.from(await response.arrayBuffer()).equals(local),"Published model-derived AABB screen differs from CI source");
  last=null;break;
 }catch(e){last=e;if(attempt<4)await new Promise(r=>setTimeout(r,2600));}
}
if(last)throw last;
const audit=JSON.parse(local);
assert.equal(audit.status,"technical-geometry-diagnostics-only");
assert.equal(audit.collision_clearance_accepted,false);
assert.equal(audit.original_asset_bindings_certified,false);
assert.equal(audit.rooms.length,4);
assert.equal(audit.explicitly_positioned_count,24);
assert.equal(audit.omitted_parented_count,13);
const totalCandidates=audit.rooms.reduce((n,r)=>n+r.geometry.total_candidate_pairs,0);
const byRoom=audit.rooms.map(room=>({id:room.room_id,bounds:room.geometry.instances.length,
 potentialOverlapPairs:room.geometry.total_candidate_pairs,
 proxyPartAabbCandidates:room.geometry.component_bbox_candidate_pairs}));
const zoning=new URL("site/room-zone-footprint-audit.json",base.endsWith("/")?base:base+"/");
zoning.searchParams.set("revision",process.env.GITHUB_SHA||"latest");
const bytes=fs.readFileSync(path.join(root,"site/room-zone-footprint-audit.json"));
let issue;
for(let attempt=0;attempt<5;attempt++){
 try{
  const response=await fetch(zoning,{cache:"no-store",signal:AbortSignal.timeout(18000)});
  assert.equal(response.status,200,"Missing published authored-zone planning screen");
  assert.ok(Buffer.from(await response.arrayBuffer()).equals(bytes),"Published zone evidence does not match CI source");
  issue=null;break;
 }catch(e){issue=e;if(attempt<4)await new Promise(r=>setTimeout(r,2600));}
}
if(issue)throw issue;
const screen=JSON.parse(bytes);
assert.equal(screen.zone_count,5);
assert.equal(screen.represented_world_proxy_count,24);
assert.equal(screen.does_not_establish_original_room_clearance,true);
assert.equal(screen.does_not_certify_walking_or_standing_space,true);
console.log("Sceneology five reserved room-stage and circulation zones published unchanged, with zero verified blocked corridors.");
const scenario=new URL("site/room-zone-variant-sensitivity.json",base.endsWith("/")?base:base+"/");
scenario.searchParams.set("revision",process.env.GITHUB_SHA||"latest");
const source=fs.readFileSync(path.join(root,"site/room-zone-variant-sensitivity.json"));
let scenarioError;
for(let retry=0;retry<5;retry++){
 try{
  const response=await fetch(scenario,{cache:"no-store",signal:AbortSignal.timeout(18000)});
  assert.equal(response.status,200,"Missing published original-zone variant sensitivity");
  assert.ok(Buffer.from(await response.arrayBuffer()).equals(source),"Live single-variant source evidence mismatch");
  scenarioError=null;break;
 }catch(e){scenarioError=e;if(retry<4)await new Promise(r=>setTimeout(r,2600));}
}
if(scenarioError)throw scenarioError;
const variants=JSON.parse(source);
assert.equal(variants.rooms.length,3);
assert.equal(variants.original_room_bindings_certified,false);
assert.equal(variants.source_position_mutation,false);
assert.equal(variants.rooms.reduce((n,r)=>n+r.one_variant_sensitive_alternatives.length,0),7);
console.log("Sceneology authored corridor/standing-stage source-variant report published byte-identically, zero invented historic bindings.");
console.log("Sceneology bounds review deployed exactly: "+JSON.stringify({totalCandidates,byRoom,roomBindingsCertified:0,collisionCertified:false}));
