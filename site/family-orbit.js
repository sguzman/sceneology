const stage=document.getElementById("orbit-stage");
const model=document.getElementById("orbit-model");
const yawSlider=document.getElementById("orbit-yaw");
const elevationSlider=document.getElementById("orbit-elevation");
const zoomSlider=document.getElementById("orbit-zoom");
const status=document.getElementById("orbit-status");
const angle=document.getElementById("orbit-angles");
const formatName=s=>s.split("-").map(x=>x[0].toUpperCase()+x.slice(1)).join(" ");
const add=(a,b)=>a.map((v,i)=>v+b[i]);
const sub=(a,b)=>a.map((v,i)=>v-b[i]);
const dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0);
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const unit=v=>{const n=Math.hypot(...v);if(!Number.isFinite(n)||n<=0)throw Error("Invalid camera vector");return v.map(x=>x/n);};
function color(hex,factor){
 if(!/^#[0-9a-f]{6}$/i.test(hex))throw Error("Invalid source material");
 const n=parseInt(hex.slice(1),16);
 return "#"+[n>>16,n>>8&255,n&255].map(v=>Math.max(0,Math.min(255,Math.round(v*factor+7))).toString(16).padStart(2,"0")).join("");
}
let records,selected=null;
function draw(){
 if(!selected)return;
 const yaw=Number(yawSlider.value),elev=Number(elevationSlider.value),zoom=Number(zoomSlider.value)/100;
 if(![yaw,elev,zoom].every(Number.isFinite))throw Error("Invalid camera control");
 const a=yaw*Math.PI/180,e=elev*Math.PI/180;
 const eye=unit([Math.sin(a)*Math.cos(e),Math.sin(e),Math.cos(a)*Math.cos(e)]);
 const right=unit([-eye[2],0,eye[0]]),up=unit(cross(right,eye));
 const light=unit([.48,.92,-.34]);
 const rendered=[];
 for(const face of selected.faces){
  const v=face.vertices;
  if(v.length!==4||!v.every(pt=>pt.length===3&&pt.every(Number.isFinite)))throw Error("Corrupted authored vertices");
  const normal=unit(cross(sub(v[1],v[0]),sub(v[2],v[0])));
  if(dot(normal,eye)<=.04)continue;
  const shade=.58+.42*Math.max(0,dot(normal,light));
  const pts=v.map(p=>[dot(p,right),-dot(p,up)]);
  rendered.push({points:pts,depth:dot(v.reduce((sum,p)=>add(sum,p),[0,0,0]).map(x=>x/4),eye),
    color:color(face.color,shade),stroke:color(face.color,shade*.78),part:face.part});
 }
 if(rendered.length===0)throw Error("No visible model faces");
 const projected=rendered.flatMap(f=>f.points);
 const xs=projected.map(p=>p[0]),ys=projected.map(p=>p[1]);
 const xmin=Math.min(...xs),xmax=Math.max(...xs),ymin=Math.min(...ys),ymax=Math.max(...ys);
 const scale=Math.min(770/Math.max(xmax-xmin,.0001),450/Math.max(ymax-ymin,.0001))*zoom;
 const ox=480-(xmin+xmax)*scale/2,oy=320-(ymin+ymax)*scale/2;
 rendered.sort((a,b)=>a.depth-b.depth);
 const svg=['<svg xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Unapproved technical orbit projection of '+selected.key+'" viewBox="0 0 960 640">',
 '<rect width="960" height="640" fill="#e8eff1"/>'];
 for(const face of rendered){
  const points=face.points.map(p=>(ox+p[0]*scale).toFixed(1)+","+(oy+p[1]*scale).toFixed(1)).join(" ");
  if(points.includes("NaN")||points.includes("Infinity"))throw Error("Nonfinite orbit projection");
  svg.push('<polygon data-part="'+face.part+'" points="'+points+'" fill="'+face.color+'" stroke="'+face.stroke+'" stroke-width=".7" stroke-linejoin="round"/>');
 }
 svg.push("</svg>");
 stage.innerHTML=svg.join("");
 stage.dataset.model=selected.key;
 stage.dataset.rendered="true";
 stage.dataset.yaw=String(yaw);
 stage.dataset.elevation=String(elev);
 stage.dataset.faces=String(rendered.length);
 angle.textContent="Yaw "+yaw+"° · elevation "+elev+"° · zoom "+Math.round(zoom*100)+"%";
}
function choose(){
 selected=records.find(x=>x.key===model.value);
 if(!selected)throw Error("Unknown selected source model");
 draw();
}
function onInput(){try{draw();}catch(error){status.textContent="Orbit preview error: "+error.message;}}
try{
 const response=await fetch("./family-orbit-data.json",{cache:"no-cache"});
 if(!response.ok)throw Error("Cannot load source-bound orbit geometry");
 const body=await response.json();
 if(body.schema_version!==1||body.models?.length!==30||body.review_only!==true||
    body.renderer_equivalent_to_source!==false||body.automatic_gallery_approval!==false)
  throw Error("Orbit approval/source boundaries changed");
 records=body.models;
 if(new Set(records.map(r=>r.key)).size!==30)throw Error("Duplicate model keys");
 const url=new URLSearchParams(location.search);
 const initial=url.get("model");
 for(const record of records){
  const option=document.createElement("option");
  option.value=record.key;option.textContent=formatName(record.key)+" ("+record.family+")";
  model.append(option);
 }
 if(records.some(r=>r.key===initial))model.value=initial;
 const requestedYaw=Number(url.get("yaw"));
 if(url.has("yaw")&&Number.isFinite(requestedYaw)&&requestedYaw>=-180&&requestedYaw<=180)yawSlider.value=String(requestedYaw);
 const requestedElev=Number(url.get("elevation"));
 if(url.has("elevation")&&Number.isFinite(requestedElev)&&requestedElev>=5&&requestedElev<=85)elevationSlider.value=String(requestedElev);
 model.addEventListener("change",choose);
 for(const slider of [yawSlider,elevationSlider,zoomSlider])slider.addEventListener("input",onInput);
 stage.addEventListener("pointerdown",event=>{stage.setPointerCapture(event.pointerId);stage.dataset.lastX=String(event.clientX);stage.dataset.lastY=String(event.clientY);});
 stage.addEventListener("pointermove",event=>{
  if(!stage.hasPointerCapture(event.pointerId))return;
  const dx=event.clientX-Number(stage.dataset.lastX),dy=event.clientY-Number(stage.dataset.lastY);
  yawSlider.value=String(Math.max(-180,Math.min(180,Number(yawSlider.value)+Math.round(dx*.75))));
  elevationSlider.value=String(Math.max(5,Math.min(85,Number(elevationSlider.value)-Math.round(dy*.45))));
  stage.dataset.lastX=String(event.clientX);stage.dataset.lastY=String(event.clientY);
  onInput();
 });
 stage.addEventListener("pointerup",event=>{if(stage.hasPointerCapture(event.pointerId))stage.releasePointerCapture(event.pointerId);});
 choose();
 status.textContent="30 source-pinned constructive models · independent orbit rendering · zero gallery approvals";
}catch(error){status.textContent="Unable to show source model: "+error.message;console.error("Sceneology orbit:",error);}
