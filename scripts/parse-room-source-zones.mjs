import assert from "node:assert/strict";

// Source-only geometry semantics from an unchanged, SHA-verified historical room file.
// Zones are 2D X/Z planning hints, not floors, collision meshes, or original wall geometry.
const finitePair=(source,label)=>{
 const parts=source.split(",").map(s=>Number(s.trim()));
 assert.equal(parts.length,2,label+" must have two values");
 assert.ok(parts.every(Number.isFinite),label+" contains invalid number");
 return parts;
};
export function extractSourceRoomZones(source){
 assert.equal(typeof source,"string");
 assert.match(source,/^status:\s*accepted\s*$/m);
 const body=source.split("\nzones:\n")[1]?.split("\ninstances:\n")[0];
 assert.ok(body,"Missing authored zones");
 const items=[...body.matchAll(/^  - id:\s*([a-z][a-z0-9-]*)\s*$/gm)];
 assert.ok(items.length>0,"No zone rectangles");
 const zones=items.map((m,i)=>{
  const part=body.slice(m.index,i+1<items.length?items[i+1].index:body.length);
  const centerLine=part.match(/^\s+center:\s*\[([^\]]+)\]/m)?.[1];
  const sizeLine=part.match(/^\s+size:\s*\[([^\]]+)\]/m)?.[1];
  assert.ok(centerLine&&sizeLine,"Missing authored zone dimensions "+m[1]);
  const center=finitePair(centerLine,m[1]+" center"),size=finitePair(sizeLine,m[1]+" size");
  assert.ok(size.every(v=>v>0),"Invalid authored zone size "+m[1]);
  return {id:m[1],center,size,source_exact:true};
 });
 assert.equal(new Set(zones.map(z=>z.id)).size,zones.length,"Duplicate room zone");
 const roomBody=source.includes("\nroom:\n")?source.split("\nroom:\n")[1]?.split("\nzones:\n")[0]:null;
 const footprintLine=roomBody?.match(/^\s+footprint:\s*\[([^\]]+)\]/m)?.[1];
 const footprint=footprintLine?finitePair(footprintLine,"room footprint"):null;
 if(footprint)assert.ok(footprint.every(v=>v>0),"Invalid room footprint");
 return {zones,source_room_footprint:footprint,footprint_only_if_explicit:Boolean(footprint),
  architectural_shell_reconstructed:false,zone_volumes_reconstructed:false,
  placement_or_clearance_certified:false};
}
