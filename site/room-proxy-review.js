const stage=document.getElementById("proxy-stage");
const roomSelect=document.getElementById("proxy-room");
const variantList=document.getElementById("proxy-variants");
const yawInput=document.getElementById("proxy-yaw");
const elevationInput=document.getElementById("proxy-elevation");
const counter=document.getElementById("proxy-count");
const status=document.getElementById("proxy-status");
const label=s=>s.split("-").map(word=>word.slice(0,1).toUpperCase()+word.slice(1)).join(" ");
const add=(a,b)=>a.map((x,i)=>x+b[i]);
const sub=(a,b)=>a.map((x,i)=>x-b[i]);
const dot=(a,b)=>a.reduce((sum,x,i)=>sum+x*b[i],0);
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const unit=v=>{const n=Math.hypot(...v);if(!Number.isFinite(n)||n<=0)throw Error("Invalid camera vector");return v.map(x=>x/n);};
const shade=(hex,factor)=>{
 if(!/^#[0-9a-f]{6}$/i.test(hex))throw Error("Invalid source material");
 const value=parseInt(hex.slice(1),16);
 return "#"+[value>>16,value>>8&255,value&255].map(x=>Math.min(255,Math.max(0,Math.round(x*factor+7))).toString(16).padStart(2,"0")).join("");
};
let rooms=[],library=null,current=null;
const chosen=new Map();
function render(){
 if(!current||!library)return;
 const yaw=Number(yawInput.value),elev=Number(elevationInput.value);
 if(!Number.isFinite(yaw)||!Number.isFinite(elev))throw Error("Invalid camera controls");
 const a=yaw*Math.PI/180,e=elev*Math.PI/180;
 const eye=unit([Math.sin(a)*Math.cos(e),Math.sin(e),Math.cos(a)*Math.cos(e)]);
 const right=unit([-eye[2],0,eye[0]]),up=unit(cross(right,eye)),light=unit([.48,.92,-.34]);
 const faces=[];
 for(const inst of current.placed){
  const selection=chosen.get(inst.id)||inst.default_model_key;
  const permitted=inst.choices.find(c=>c.key===selection);
  const model=library.get(selection);
  if(!permitted||!model||model.source_sha!==permitted.source_sha)throw Error("Unverified model choice "+inst.id);
  const angle=inst.yaw_deg*Math.PI/180,c=Math.cos(angle),s=Math.sin(angle);
  const place=v=>[c*v[0]+s*v[2]+inst.translate[0],v[1]+inst.translate[1],-s*v[0]+c*v[2]+inst.translate[2]];
  for(const face of model.faces){
   const vs=face.vertices.map(place);
   if(!vs.every(v=>v.length===3&&v.every(Number.isFinite)))throw Error("Invalid authored model geometry");
   const normal=unit(cross(sub(vs[1],vs[0]),sub(vs[2],vs[0])));
   if(dot(normal,eye)<=.04)continue;
   const lightFactor=.58+.42*Math.max(0,dot(normal,light));
   faces.push({instance:inst.id,points:vs.map(v=>[dot(v,right),-dot(v,up)]),
    depth:dot(vs.reduce((sum,v)=>add(sum,v),[0,0,0]).map(x=>x/4),eye),
    color:shade(face.color,lightFactor),stroke:shade(face.color,lightFactor*.78)});
  }
 }
 if(!faces.length)throw Error("No visible proxy surfaces");
 const all=faces.flatMap(f=>f.points),xs=all.map(p=>p[0]),ys=all.map(p=>p[1]);
 const loX=Math.min(...xs),hiX=Math.max(...xs),loY=Math.min(...ys),hiY=Math.max(...ys);
 const scale=Math.min(830/Math.max(.0001,hiX-loX),510/Math.max(.0001,hiY-loY));
 const ox=480-(loX+hiX)*scale/2,oy=320-(loY+hiY)*scale/2;
 faces.sort((a,b)=>a.depth-b.depth);
 const svg=['<svg xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Unapproved source-derived room proxy with exact authored world positions" viewBox="0 0 960 640">','<rect width="960" height="640" fill="#e8eff1"/>'];
 for(const f of faces){
  const points=f.points.map(p=>(ox+p[0]*scale).toFixed(1)+","+(oy+p[1]*scale).toFixed(1)).join(" ");
  if(/NaN|Infinity/.test(points))throw Error("Nonfinite room projection");
  svg.push('<polygon data-instance="'+f.instance+'" points="'+points+'" fill="'+f.color+'" stroke="'+f.stroke+'" stroke-width=".7"/>');
 }
 svg.push("</svg>");
 stage.innerHTML=svg.join("");
 stage.dataset.room=current.id;
 stage.dataset.rendered="true";
 stage.dataset.faces=String(faces.length);
 stage.dataset.yaw=String(yaw);
 stage.dataset.variantChoices=String([...chosen].length);
 counter.textContent=current.placed.length+" placed furniture proxies · "+current.omitted_parented.length+" parent-attached objects deliberately omitted · yaw "+yaw+"°";
}
function onRender(){try{render();}catch(e){status.textContent="Technical projection unavailable: "+e.message;}}
function chooseRoom(){
 const wanted=rooms.find(r=>r.id===roomSelect.value);
 if(!wanted)throw Error("Unknown historical room");
 current=wanted;chosen.clear();
 const controls=[];
 for(const item of current.placed){
  const group=document.createElement("div");group.className="proxy-choice";
  const descriptor=document.createElement("label");
  const picker=document.createElement("select");picker.dataset.instance=item.id;
  picker.id="variant-"+item.id;descriptor.htmlFor=picker.id;descriptor.textContent=label(item.id);
  for(const choice of item.choices){
   const option=document.createElement("option");option.value=choice.key;option.textContent=label(choice.key);
   picker.append(option);
  }
  picker.value=item.default_model_key;
  const requestedVariant=new URLSearchParams(location.search).get("variant-"+item.id);
  if(item.choices.some(choice=>choice.key===requestedVariant)){
   picker.value=requestedVariant;
   chosen.set(item.id,requestedVariant);
  }
  picker.addEventListener("change",()=>{
   if(!item.choices.some(x=>x.key===picker.value))throw Error("Unsupported proxy variant");
   chosen.set(item.id,picker.value);onRender();
  });
  group.append(descriptor,picker);controls.push(group);
 }
 variantList.replaceChildren(...controls);
 onRender();
 status.textContent="Source coordinate fidelity checked. Model identities are proxies; zero original room bindings certified.";
}
try{
 const [roomsResponse,modelResponse]=await Promise.all([
  fetch("./room-proxy-review-data.json",{cache:"no-cache"}),
  fetch("./family-orbit-data.json",{cache:"no-cache"})
 ]);
 if(!roomsResponse.ok||!modelResponse.ok)throw Error("Room source data is not available");
 const data=await roomsResponse.json(),modelData=await modelResponse.json();
 if(data.schema_version!==1||data.rooms?.length!==3||data.review_only!==true||
    data.showcase_approved!==false||data.source_model_bindings_certified!==false||
    data.historical_scene_geometry_original!==false||modelData.models?.length!==30||
    modelData.automatic_gallery_approval!==false)throw Error("Room acceptance and provenance boundary changed");
 rooms=data.rooms;
 library=new Map(modelData.models.map(m=>[m.key,m]));
 for(const room of rooms){
  const option=document.createElement("option");option.value=room.id;option.textContent=label(room.id);
  roomSelect.append(option);
 }
 const query=new URLSearchParams(location.search);
 const selectedRoom=query.get("room");
 if(rooms.some(r=>r.id===selectedRoom))roomSelect.value=selectedRoom;
 const requestedYaw=Number(query.get("yaw"));
 if(query.has("yaw")&&Number.isFinite(requestedYaw)&&requestedYaw>=-180&&requestedYaw<=180)yawInput.value=String(requestedYaw);
 roomSelect.addEventListener("change",chooseRoom);
 yawInput.addEventListener("input",onRender);
 elevationInput.addEventListener("input",onRender);
 chooseRoom();
}catch(error){status.textContent="Unable to show research room: "+error.message;console.error("Sceneology room proxy:",error);}
