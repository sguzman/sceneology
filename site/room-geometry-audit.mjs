// Sceneology research diagnostics. These are conservative axis-aligned bounds,
// NOT mesh intersection, original-asset validation or an artistic clearance verdict.
// Source orbital geometry is projected with each historical room's explicit rigid transform.
const EPS=1e-5;
const bounds=vertices=>{
 const lo=[Infinity,Infinity,Infinity],hi=[-Infinity,-Infinity,-Infinity];
 for(const point of vertices){
  if(!Array.isArray(point)||point.length!==3||!point.every(Number.isFinite))throw Error("Nonfinite source geometry");
  for(let axis=0;axis<3;axis++){lo[axis]=Math.min(lo[axis],point[axis]);hi[axis]=Math.max(hi[axis],point[axis]);}
 }
 if(!vertices.length||lo.some(v=>!Number.isFinite(v)))throw Error("Empty source geometry");
 return {min:lo,max:hi};
};
const overlap=(a,b)=>a.min.map((v,i)=>Math.min(a.max[i],b.max[i])-Math.max(v,b.min[i]));
const round=n=>Math.round(n*100000)/100000;
export function analyzeProxyGeometry(instances,models){
 if(!Array.isArray(instances)||!(models instanceof Map))throw Error("Geometry audit needs concrete instances and source-model map");
 const records=[];
 for(const item of instances){
  if(!Array.isArray(item.translate)||item.translate.length!==3||!item.translate.every(Number.isFinite)||!Number.isFinite(item.yaw_deg))
   throw Error("Invalid room source placement "+item.id);
  if(records.some(entry=>entry.id===item.id))throw Error("Duplicate room instance "+item.id);
  const model=models.get(item.model_key);
  if(!model||model.source_sha!==item.model_sha||!Array.isArray(model.faces))throw Error("Source geometry version mismatch "+item.id);
  const angle=item.yaw_deg*Math.PI/180,c=Math.cos(angle),s=Math.sin(angle);
  const transformed=v=>[c*v[0]+s*v[2]+item.translate[0],v[1]+item.translate[1],-s*v[0]+c*v[2]+item.translate[2]];
  const points=[],parts=new Map();
  for(const face of model.faces){
   if(!Array.isArray(face.vertices)||face.vertices.length!==4||!/^[a-z][a-z0-9_]*$/.test(face.part))
    throw Error("Invalid source part "+item.id);
   for(const vertex of face.vertices){
    const position=transformed(vertex);
    if(!position.every(Number.isFinite))throw Error("Bad projected source geometry "+item.id);
    points.push(position);
    if(!parts.has(face.part))parts.set(face.part,[]);
    parts.get(face.part).push(position);
   }
  }
  if(!points.length)throw Error("Empty instance mesh "+item.id);
  const shell=bounds(points);
  records.push({id:item.id,model_key:item.model_key,source_sha:item.model_sha,
   bbox:{min:shell.min.map(round),max:shell.max.map(round)},
   origin_plane_min_y:round(shell.min[1]),
   origin_plane_max_y:round(shell.max[1]),
   parts:[...parts.entries()].map(([id,vertices])=>({id,bounds:bounds(vertices)}))});
 }
 const possible=[];
 for(let i=0;i<records.length;i++)for(let j=i+1;j<records.length;j++){
  const a=records[i],b=records[j];
  const span=overlap(a.bbox,b.bbox);
  if(!span.every(x=>x>EPS))continue;
  const matching=[];
  for(const pa of a.parts)for(const pb of b.parts){
   const inside=overlap(pa.bounds,pb.bounds);
   if(inside.every(x=>x>EPS))matching.push({a:pa.id,b:pb.id,overlap:inside.map(round)});
  }
  possible.push({first:a.id,second:b.id,aabb_overlap:span.map(round),
   part_bound_candidate_pairs:matching.length,
   sample_pairs:matching.slice(0,8),
   broad_phase_only:true,collision_confirmed:false});
 }
 return {schema_version:1,geometry_role:"research-proxy-not-accepted-artwork",
  bounds_kind:"transformed per-instance and per-source-part axis-aligned bounds",
  floor_reference:"source local placement origin y=0, not verified walkable contact",
  collision_confirmed:false,source_model_bindings_certified:false,
  instances:records.map(({parts,...r})=>({...r,source_part_count:parts.length})),
  broad_phase_candidates:possible,
  total_candidate_pairs:possible.length,
  component_bbox_candidate_pairs:possible.reduce((sum,p)=>sum+p.part_bound_candidate_pairs,0)};
}
