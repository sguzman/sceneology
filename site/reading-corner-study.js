import {analyzeProxyGeometry} from "./room-geometry-audit.mjs";
import {sourceZonePolygons,renderZoneGuide} from "./source-room-region-guide.mjs";
const stage=document.getElementById("reading-stage");
const clearance=document.getElementById("reading-clearance");
const showCharacter=document.getElementById("reading-show-character");
const showPillow=document.getElementById("reading-show-pillow");
const pillowNotice=document.getElementById("reading-pillow-notice");
const alignCharacter=document.getElementById("reading-align-character");
const characterNotice=document.getElementById("reading-character-notice");
const status=document.getElementById("reading-status");
const yaw=document.getElementById("reading-yaw");
const elevation=document.getElementById("reading-elevation");
const zonesInput=document.getElementById("reading-zones");
const caption=document.getElementById("reading-label");
const attachments=document.getElementById("reading-attachments");
const add=(a,b)=>a.map((v,i)=>v+b[i]),sub=(a,b)=>a.map((v,i)=>v-b[i]);
const dot=(a,b)=>a.reduce((v,x,i)=>v+x*b[i],0);
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const unit=v=>{const n=Math.hypot(...v);if(!Number.isFinite(n)||n===0)throw Error("Invalid direction");return v.map(x=>x/n);};
function shade(hex,factor){
 if(!/^#[0-9a-f]{6}$/i.test(hex))throw Error("Bad source color");
 const n=parseInt(hex.slice(1),16);
 return "#"+[n>>16,n>>8&255,n&255].map(x=>Math.min(255,Math.max(0,Math.round(x*factor+7))).toString(16).padStart(2,"0")).join("");
}
let room=null,library=null,occupancy=null,lumbar=null;
function draw(){
 if(!room||!library)return;
 const yawDeg=Number(yaw.value),elevationDeg=Number(elevation.value);
 if(![yawDeg,elevationDeg].every(Number.isFinite))throw Error("Invalid camera angles");
 const a=yawDeg*Math.PI/180,e=elevationDeg*Math.PI/180;
 const camera=unit([Math.sin(a)*Math.cos(e),Math.sin(e),Math.cos(a)*Math.cos(e)]);
 const right=unit([-camera[2],0,camera[0]]),up=unit(cross(right,camera));
 const light=unit([.48,.92,-.34]);
 const visible=[];
 const characterShown=Boolean(showCharacter.checked&&occupancy);
 const support=occupancy?.comparison.source_shoe_support_research;
 const aligned=Boolean(characterShown&&alignCharacter.checked&&support);
 const characterTranslation=characterShown?[
  occupancy.authored_character.translate[0],
  occupancy.authored_character.translate[1]+(aligned?support.proposed_visualization_only_y_offset:0),
  occupancy.authored_character.translate[2]
 ]:null;
 const pillowShown=Boolean(showPillow.checked&&lumbar);
 const drawn=[
  ...room.instances,
  ...(pillowShown?[lumbar.instance]:[]),
  ...(characterShown?[{
   id:"quest-girl",model_key:occupancy.model.key,model_sha:occupancy.model.source_sha,
   translate:characterTranslation,yaw_deg:occupancy.authored_character.yaw_deg
  }]:[])
 ];
 for(const instance of drawn){
  const model=library.get(instance.model_key);
  if(!model||model.source_sha!==instance.model_sha)throw Error("Unmatched source family binding");
  const theta=instance.yaw_deg*Math.PI/180,c=Math.cos(theta),s=Math.sin(theta);
  const apply=point=>[
   point[0]*c+point[2]*s+instance.translate[0],
   point[1]+instance.translate[1],
   -point[0]*s+point[2]*c+instance.translate[2]
  ];
  for(const face of model.faces){
   const vs=face.vertices.map(apply);
   if(!vs.every(pt=>pt.every(Number.isFinite)))throw Error("Nonfinite source geometry "+instance.id);
   const normal=unit(cross(sub(vs[1],vs[0]),sub(vs[2],vs[0])));
   if(dot(normal,camera)<=.04)continue;
   const lighting=.58+.42*Math.max(0,dot(normal,light));
   visible.push({instance:instance.id,
    points:vs.map(v=>[dot(v,right),-dot(v,up)]),
    depth:dot(vs.reduce((sum,p)=>add(sum,p),[0,0,0]).map(x=>x/4),camera),
    fill:shade(face.color,lighting),outline:shade(face.color,lighting*.78)});
  }
 }
 if(!visible.length)throw Error("No visible reconstructed surfaces");
 const sourceZones=zonesInput.checked?sourceZonePolygons(room.region_guide):[];
 const zonePositions=sourceZones.flatMap(zone=>zone.vertices.map(v=>[dot(v,right),-dot(v,up)]));
 const points=[...visible.flatMap(x=>x.points),...zonePositions],xs=points.map(p=>p[0]),ys=points.map(p=>p[1]);
 const xMin=Math.min(...xs),xMax=Math.max(...xs),yMin=Math.min(...ys),yMax=Math.max(...ys);
 const scale=Math.min(835/Math.max(.001,xMax-xMin),505/Math.max(.001,yMax-yMin));
 const ox=480-(xMin+xMax)*scale/2,oy=320-(yMin+yMax)*scale/2;
 visible.sort((a,b)=>a.depth-b.depth);
 const shapes=['<svg xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Partial source-derived Reading Corner layout: six explicitly placed constructive models only" viewBox="0 0 960 640">',
 '<rect width="960" height="640" fill="#ecf2f4"/>'];
 for(const f of visible){
  const vertices=f.points.map(p=>(ox+p[0]*scale).toFixed(1)+","+(oy+p[1]*scale).toFixed(1)).join(" ");
  if(vertices.includes("NaN"))throw Error("Bad projection");
  shapes.push('<polygon data-instance="'+f.instance+'" points="'+vertices+'" fill="'+f.fill+'" stroke="'+f.outline+'" stroke-width=".7" stroke-linejoin="round"/>');
 }
 if(sourceZones.length)shapes.push(renderZoneGuide(sourceZones,v=>[ox+dot(v,right)*scale,oy-dot(v,up)*scale]));
 shapes.push("</svg>");
 stage.innerHTML=shapes.join("");
 stage.dataset.rendered="true";stage.dataset.faceCount=String(visible.length);
 stage.dataset.yaw=String(yawDeg);stage.dataset.elevation=String(elevationDeg);
 stage.dataset.viewportTop=String(Math.round(stage.getBoundingClientRect().top));
 stage.dataset.occupancy=characterShown?"research-candidate":"hidden";
 stage.dataset.zoneCount=String(sourceZones.filter(z=>z.kind==="zone-only").length);
 stage.dataset.footprint=sourceZones.some(z=>z.kind==="explicit-footprint")?"original-source-only":"not-shown";
 stage.dataset.pillow=pillowShown?"seat-back-proposal":"hidden";
 stage.dataset.pillowOverhang=pillowShown?String(lumbar.candidate_support.horizontal_pillow_overhang_each_side):"none";
 stage.dataset.support=aligned?"alignment-proposal":characterShown?"authored-unaligned":"hidden";
 stage.dataset.characterY=characterShown?String(characterTranslation[1]):"none";
 caption.textContent="Six authored positions · "+room.omitted_parented_instances.length+" deliberately omitted attachments · camera "+yawDeg+"° / "+elevationDeg+"°";
 if(sourceZones.length)caption.textContent+=" · Source guides: "+room.region_guide.zones.map(z=>z.id.replaceAll("-"," ")).join(", ")+
  " · no source room footprint";
 const audit=analyzeProxyGeometry(drawn,library);
 clearance.dataset.candidates=String(audit.total_candidate_pairs);
 clearance.dataset.status="technical-only";
 const heading=document.createElement("strong");
 heading.textContent="Conservative geometry screen: "+audit.total_candidate_pairs+" possible bounding-box overlap pairs";
 const explanation=document.createElement("p");
 explanation.textContent="Research model proxy bounds only; neither confirmed collisions nor verified walkable-floor contact. The two parent-attached objects and original room shell are absent.";
 const list=document.createElement("ul");
 for(const pair of audit.broad_phase_candidates){
  const li=document.createElement("li");li.textContent=pair.first+" / "+pair.second+": "+pair.part_bound_candidate_pairs+" source-part bounding-box candidates";
  list.append(li);
 }
 if(!audit.total_candidate_pairs){
  const li=document.createElement("li");li.textContent="No overlapping proxy AABBs. Original room collision clearance remains uncertified.";list.append(li);
 }
 clearance.replaceChildren(heading,explanation,list);
 if(pillowShown){
  pillowNotice.textContent="Source pillow aligned to candidate chair cushion Y "+lumbar.candidate_support.source_chair_seat_top_y+
   " and backrest front Z "+lumbar.candidate_support.source_chair_back_front_z+
   ". Wider by 0.20 source units per side than the cushion; overhang and visual fidelity require review. "+
   "This is not an original-world-placement or contact certificate.";
 }else pillowNotice.textContent="Lumbar pillow placement proposal hidden by default; historical placement remains unknown.";
 if(characterShown){
  characterNotice.textContent="Character source translation "+
    occupancy.authored_character.translate.join(", ")+", yaw "+
    occupancy.authored_character.yaw_deg+"°. Sole-to-rug CENTRAL FIELD gap "+
    support.original_vertical_gap_to_field+" source units. "+
    (aligned?"Optional viewer-only Y correction +"+support.proposed_visualization_only_y_offset+
      " (original geometry and scene coordinates unchanged).":"No support correction applied.")+
    " Both shoe sole footprints lie within the rug field: "+support.all_shoe_corners_within_rug_field+
    ". This is NOT verified contact, collision clearance, original-renderer behavior or artistic approval.";
 }else{
  characterNotice.textContent="Character-occupancy candidate hidden by default; its historical visual verdict is still pending.";
 }
}
try{
 const [mr,fr,cr,pr]=await Promise.all([
  fetch("./reading-corner-study-data.json",{cache:"no-cache"}),
  fetch("./family-orbit-data.json",{cache:"no-cache"}),
  fetch("./reading-corner-occupancy-data.json",{cache:"no-cache"}),
  fetch("./reading-lumbar-placement-data.json",{cache:"no-cache"})
 ]);
 if(!mr.ok||!fr.ok||!cr.ok||!pr.ok)throw Error("Technical geometry not available");
 room=await mr.json();const modelData=await fr.json();occupancy=await cr.json();lumbar=await pr.json();
 if(room.instances?.length!==6||room.omitted_parented_instances?.length!==2||
    room.rendering_is_original_accepted!==false||room.gallery_approved!==false||
    room.complete_room!==false||modelData.models?.length!==30||
    occupancy.historical_occupancy_proof_status!=="human-review-candidate"||
    occupancy.occupancy_approved!==false||occupancy.stage_contact_certified!==false||
    occupancy.showcase_approved!==false||occupancy.model.key!=="quest-girl-v7"||
    occupancy.comparison.source_shoe_support_research?.original_occupancy_position_preserved!==true||
    occupancy.comparison.source_shoe_support_research?.proposal_is_original_source_transform!==false||
    occupancy.comparison.source_shoe_support_research?.exact_mesh_contact_certified!==false||
    lumbar.schema_version!==1||lumbar.proposal_accepted!==false||
    lumbar.approved_original_room_placement_recovered!==false||
    lumbar.artistically_approved!==false||lumbar.gallery_approved!==false||
    lumbar.candidate_support?.width_mismatch_requires_owner_review!==true||
    lumbar.instance.id!=="lumbar-pillow"||lumbar.model.key!=="reading-lumbar-upright-proposal")
  throw Error("Room completeness or approval boundary changed");
 library=new Map([...modelData.models,occupancy.model,lumbar.model].map(x=>[x.key,x]));
 attachments.replaceChildren(...room.omitted_parented_instances.map(item=>{
  const li=document.createElement("li");
  li.dataset.omittedInstance=item.id;
  li.textContent=item.id+" depends on "+item.parent_instance+" ("+item.parent_relation+"); exact placement unknown";
  return li;
 }));
 const params=new URLSearchParams(location.search);
 const preferred=Number(params.get("yaw"));
 if(params.has("yaw")&&Number.isFinite(preferred)&&preferred>=-180&&preferred<=180)yaw.value=String(preferred);
 zonesInput.checked=params.get("zones")==="1";
 zonesInput.addEventListener("change",draw);
 showPillow.checked=params.get("pillow")==="1";
 showPillow.addEventListener("change",draw);
 showCharacter.checked=params.get("occupancy")==="1";
 alignCharacter.checked=params.get("support")==="1";
 alignCharacter.disabled=!showCharacter.checked;
 showCharacter.addEventListener("change",()=>{
  alignCharacter.disabled=!showCharacter.checked;
  draw();
 });
 alignCharacter.addEventListener("change",draw);
 for(const input of [yaw,elevation])input.addEventListener("input",draw);
 draw();
 status.textContent="Partial source-derived geometry ready · no claim of canonical room fidelity";
}catch(error){status.textContent="Unable to reconstruct research layout: "+error.message;console.error("Reading Corner study:",error);}
