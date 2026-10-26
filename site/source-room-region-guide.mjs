// Research-only X/Z zone guide. Neither a recovered floor nor authored wall geometry.
const safeId=id=>/^[a-z][a-z0-9-]*$/.test(id);
export function sourceZonePolygons(region){
 if(!region||!Array.isArray(region.zones)||!region.zones.length||
  region.architectural_shell_reconstructed!==false||region.zone_volumes_reconstructed!==false||
  region.placement_or_clearance_certified!==false)throw Error("Unverified room guide");
 const polygons=region.zones.map(zone=>{
  if(!safeId(zone.id)||zone.source_exact!==true||
   zone.center?.length!==2||zone.size?.length!==2||
   ![...zone.center,...zone.size].every(Number.isFinite)||
   !zone.size.every(n=>n>0))throw Error("Corrupt authored zone dimensions");
  const [x,z]=zone.center,[w,d]=zone.size;
  return {id:zone.id,kind:"zone-only",
   vertices:[[x-w/2,0,z-d/2],[x+w/2,0,z-d/2],[x+w/2,0,z+d/2],[x-w/2,0,z+d/2]],
   source_only:true};
 });
 if(region.source_room_footprint!==null){
  if(!Array.isArray(region.source_room_footprint)||region.source_room_footprint.length!==2||
    !region.source_room_footprint.every(v=>Number.isFinite(v)&&v>0)||
    region.footprint_only_if_explicit!==true)throw Error("Room outline not sourced");
  const [w,d]=region.source_room_footprint;
  polygons.unshift({id:"source-footprint",kind:"explicit-footprint",
   vertices:[[-w/2,0,-d/2],[w/2,0,-d/2],[w/2,0,d/2],[-w/2,0,d/2]],source_only:true});
 }else if(region.footprint_only_if_explicit!==false){
  throw Error("Inferred room outline prohibited");
 }
 return polygons;
}
export function renderZoneGuide(polygons,project){
 if(!Array.isArray(polygons)||typeof project!=="function")throw Error("Invalid zone projector");
 return polygons.map(p=>{
  if(!safeId(p.id)||p.vertices?.length!==4||p.source_only!==true)throw Error("Unverified SVG zone");
  const corners=p.vertices.map(v=>project(v));
  if(corners.some(v=>!Array.isArray(v)||v.length!==2||!v.every(Number.isFinite)))throw Error("Nonfinite zone projection");
  const points=corners.map(x=>x.map(n=>n.toFixed(1)).join(",")).join(" ");
  const isFootprint=p.kind==="explicit-footprint";
  const fill=isFootprint?"none":"#61a8a1";
  const opacity=isFootprint?0:0.035;
  const stroke=isFootprint?"#426174":"#2d7d71";
  const label=p.id.replace(/-/g," ");
  const centroid=corners.reduce((p,v)=>[p[0]+v[0]/4,p[1]+v[1]/4],[0,0]);
  return '<polygon data-zone-guide="'+p.id+'" points="'+points+'" fill="'+fill+
   '" fill-opacity="'+opacity+'" stroke="'+stroke+'" stroke-width="'+(isFootprint?2.1:1.5)+
   '" stroke-dasharray="'+(isFootprint?"9 6":"6 5")+'"/>'+
   '<text data-zone-label="'+p.id+'" x="'+centroid[0].toFixed(1)+'" y="'+centroid[1].toFixed(1)+
   '" fill="#275e59" font-size="14" text-anchor="middle" font-family="sans-serif">'+label+"</text>";
 }).join("");
}
