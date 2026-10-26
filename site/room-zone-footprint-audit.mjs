import assert from "node:assert/strict";
// Conservative X/Z rectangle overlap against the complete world AABB of the
// currently selected proxy. This is NOT collision checking or original-scene QA.
const round=v=>Number(v.toFixed(5));
export function zoneFootprintScreen(region,instances){
 assert.ok(region&&region.architectural_shell_reconstructed===false&&region.placement_or_clearance_certified===false);
 assert.ok(Array.isArray(instances));
 const zones=region.zones.filter(z=>["character-stage","bedside-stage","circulation"].includes(z.id));
 return zones.map(zone=>{
  const [cx,cz]=zone.center,[w,d]=zone.size;
  assert.ok([cx,cz,w,d].every(Number.isFinite)&&w>0&&d>0);
  const minX=cx-w/2,maxX=cx+w/2,minZ=cz-d/2,maxZ=cz+d/2,area=w*d;
  const intersections=[];
  const ignored=[];
  for(const item of instances){
   const min=item.bbox?.min,max=item.bbox?.max;
   assert.ok(item.id&&min?.length===3&&max?.length===3&&[...min,...max].every(Number.isFinite));
   if(item.id==="rug"){ignored.push({id:item.id,reason:"intentional stage-support rug, not an occupied furniture mass"});continue;}
   if(item.id==="window"){ignored.push({id:item.id,reason:"wall-mounted window, not an occupied floor-level furniture mass"});continue;}
   const x=Math.min(max[0],maxX)-Math.max(min[0],minX);
   const z=Math.min(max[2],maxZ)-Math.max(min[2],minZ);
   if(x<=1e-6||z<=1e-6)continue;
   const areaApprox=round(x*z);
   intersections.push({id:item.id,zone_id:zone.id,
    overlap_x:round(x),overlap_z:round(z),rectangular_overlap_area:areaApprox,
    zone_fraction:round((x*z)/area),
    is_definite_obstruction:false,
    source_binding_certified:false});
  }
  return {id:zone.id,center:zone.center,size:zone.size,source_exact:zone.source_exact,
   concern:"2D world-AABB overlap only, not observed clutter or failed circulation",
   candidate_overlaps:intersections,explicit_exclusions:ignored,
   all_overlap_results_are_inconclusive:true};
 });
}
