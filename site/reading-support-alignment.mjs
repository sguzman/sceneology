// Narrow occupancy-support research: only authored Quest Girl shoe soles and
// the exact-source rug 'field' are inspected. Not a physical collision solver.
const EPS=1e-6;
const min=(points,i)=>Math.min(...points.map(v=>v[i]));
const max=(points,i)=>Math.max(...points.map(v=>v[i]));
function world(v,instance){
 const theta=instance.yaw_deg*Math.PI/180,c=Math.cos(theta),s=Math.sin(theta);
 return [c*v[0]+s*v[2]+instance.translate[0],v[1]+instance.translate[1],
  -s*v[0]+c*v[2]+instance.translate[2]];
}
const distinctXZ=points=>{
 const result=[];
 for(const p of points)if(!result.some(v=>Math.abs(p[0]-v[0])<EPS&&Math.abs(p[2]-v[2])<EPS))result.push(p);
 return result;
};
function sortedCorners(points){
 const center=[points.reduce((s,p)=>s+p[0],0)/points.length,points.reduce((s,p)=>s+p[2],0)/points.length];
 return [...points].sort((a,b)=>Math.atan2(a[2]-center[1],a[0]-center[0])-Math.atan2(b[2]-center[1],b[0]-center[0]));
}
function insideConvexXZ(point,corners){
 let sign=0;
 for(let i=0;i<corners.length;i++){
  const a=corners[i],b=corners[(i+1)%corners.length];
  const cross=(b[0]-a[0])*(point[2]-a[2])-(b[2]-a[2])*(point[0]-a[0]);
  if(Math.abs(cross)<=EPS)continue;
  if(sign&&Math.sign(cross)!==sign)return false;
  sign=Math.sign(cross);
 }
 return Boolean(sign);
}
export function measureSourceShoeSupport(character,rug,characterPlacement,rugPlacement){
 if(character.key!=="quest-girl-v7"||rug.key!=="wide-area-rug")throw Error("Support evidence requires the pinned Quest Girl and rug models");
 if(!character.faces?.length||!rug.faces?.length)throw Error("Source geometry missing");
 const fieldVertices=rug.faces.filter(f=>f.part==="field").flatMap(f=>f.vertices.map(v=>world(v,rugPlacement)));
 if(!fieldVertices.length)throw Error("Rug field geometry not found");
 const height=max(fieldVertices,1);
 const topCorners=distinctXZ(fieldVertices.filter(v=>Math.abs(v[1]-height)<EPS));
 if(topCorners.length!==4)throw Error("Support cover must have exactly four top corners");
 const perimeter=sortedCorners(topCorners);
 const feet=[],soles=[];
 for(const name of ["shoe_left","shoe_right"]){
  const points=character.faces.filter(f=>f.part===name).flatMap(f=>f.vertices.map(v=>world(v,characterPlacement)));
  if(points.length<8)throw Error("Missing source shoe "+name);
  const soleY=min(points,1);
  const corners=distinctXZ(points.filter(v=>Math.abs(v[1]-soleY)<EPS));
  if(corners.length!==4)throw Error("Expected four source sole corners for "+name);
  const within=corners.every(c=>insideConvexXZ(c,perimeter));
  feet.push({part:name,sole_y:Number(soleY.toFixed(6)),sole_corner_count:corners.length,
   within_rug_field_footprint:within,
   sole_corners_xz:corners.map(p=>[Number(p[0].toFixed(6)),Number(p[2].toFixed(6))])});
  soles.push(soleY);
 }
 if(Math.abs(soles[0]-soles[1])>EPS)throw Error("Source shoes do not share the same support height");
 const rise=height-Math.min(...soles);
 if(!Number.isFinite(rise)||rise<0)throw Error("Not a sunk-character alignment study");
 return {schema_version:1,
  method:"source shoe soles versus central rug field top, at authored world transforms",
  original_occupancy_position_preserved:true,
  stage_floor_geometry_verified:false,
  exact_mesh_contact_certified:false,
  historical_renderer_equivalence:false,
  support_surface:"wide-area-rug/field",
  source_field_top_y:Number(height.toFixed(6)),
  shoes:feet,
  all_shoe_corners_within_rug_field:feet.every(f=>f.within_rug_field_footprint),
  original_sole_y:Number(Math.min(...soles).toFixed(6)),
  original_vertical_gap_to_field:Number((Math.min(...soles)-height).toFixed(6)),
  proposed_visualization_only_y_offset:Number(rise.toFixed(6)),
  corrected_sole_y_if_offset_applied:Number((Math.min(...soles)+rise).toFixed(6)),
  proposal_is_original_source_transform:false,
  artistic_approval:false};
}
