const stage=document.getElementById("reading-stage");
const status=document.getElementById("reading-status");
const yaw=document.getElementById("reading-yaw");
const elevation=document.getElementById("reading-elevation");
const caption=document.getElementById("reading-label");
const add=(a,b)=>a.map((v,i)=>v+b[i]),sub=(a,b)=>a.map((v,i)=>v-b[i]);
const dot=(a,b)=>a.reduce((v,x,i)=>v+x*b[i],0);
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const unit=v=>{const n=Math.hypot(...v);if(!Number.isFinite(n)||n===0)throw Error("Invalid direction");return v.map(x=>x/n);};
function shade(hex,factor){
 if(!/^#[0-9a-f]{6}$/i.test(hex))throw Error("Bad source color");
 const n=parseInt(hex.slice(1),16);
 return "#"+[n>>16,n>>8&255,n&255].map(x=>Math.min(255,Math.max(0,Math.round(x*factor+7))).toString(16).padStart(2,"0")).join("");
}
let room=null,library=null;
function draw(){
 if(!room||!library)return;
 const yawDeg=Number(yaw.value),elevationDeg=Number(elevation.value);
 if(![yawDeg,elevationDeg].every(Number.isFinite))throw Error("Invalid camera angles");
 const a=yawDeg*Math.PI/180,e=elevationDeg*Math.PI/180;
 const camera=unit([Math.sin(a)*Math.cos(e),Math.sin(e),Math.cos(a)*Math.cos(e)]);
 const right=unit([-camera[2],0,camera[0]]),up=unit(cross(right,camera));
 const light=unit([.48,.92,-.34]);
 const visible=[];
 for(const instance of room.instances){
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
 const points=visible.flatMap(x=>x.points),xs=points.map(p=>p[0]),ys=points.map(p=>p[1]);
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
 shapes.push("</svg>");
 stage.innerHTML=shapes.join("");
 stage.dataset.rendered="true";stage.dataset.faceCount=String(visible.length);
 stage.dataset.yaw=String(yawDeg);stage.dataset.elevation=String(elevationDeg);
 caption.textContent="Six authored positions · "+room.omitted_parented_instances.length+" deliberately omitted attachments · camera "+yawDeg+"° / "+elevationDeg+"°";
}
try{
 const [mr,fr]=await Promise.all([
  fetch("./reading-corner-study-data.json",{cache:"no-cache"}),
  fetch("./family-orbit-data.json",{cache:"no-cache"})
 ]);
 if(!mr.ok||!fr.ok)throw Error("Technical geometry not available");
 room=await mr.json();const modelData=await fr.json();
 if(room.instances?.length!==6||room.omitted_parented_instances?.length!==2||
    room.rendering_is_original_accepted!==false||room.gallery_approved!==false||
    room.complete_room!==false||modelData.models?.length!==30)
  throw Error("Room completeness or approval boundary changed");
 library=new Map(modelData.models.map(x=>[x.key,x]));
 const params=new URLSearchParams(location.search);
 const preferred=Number(params.get("yaw"));
 if(params.has("yaw")&&Number.isFinite(preferred)&&preferred>=-180&&preferred<=180)yaw.value=String(preferred);
 for(const input of [yaw,elevation])input.addEventListener("input",draw);
 draw();
 status.textContent="Partial source-derived geometry ready · no claim of canonical room fidelity";
}catch(error){status.textContent="Unable to reconstruct research layout: "+error.message;console.error("Reading Corner study:",error);}
