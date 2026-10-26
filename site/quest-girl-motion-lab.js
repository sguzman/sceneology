import {samplePose} from "../site/quest-girl-motion-sampler.mjs";

const stage=document.getElementById("motion-stage");
const message=document.getElementById("motion-status");
const choice=document.getElementById("motion-clip");
const toggle=document.getElementById("motion-toggle");
const seek=document.getElementById("motion-seek");
const clock=document.getElementById("motion-time");

const add=(a,b)=>a.map((v,i)=>v+b[i]),sub=(a,b)=>a.map((v,i)=>v-b[i]);
const dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0);
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2]];
const unit=v=>v.map(x=>x/Math.hypot(...v));
const mm=(a,b)=>a.map(row=>b[0].map((_,j)=>row.reduce((s,v,k)=>s+v*b[k][j],0)));
const mv=(m,v)=>m.map(row=>dot(row,v));
function rotation(degrees){
 const [x,y,z]=degrees.map(v=>v*Math.PI/180);
 const cx=Math.cos(x),sx=Math.sin(x),cy=Math.cos(y),sy=Math.sin(y),cz=Math.cos(z),sz=Math.sin(z);
 return mm([[cz,-sz,0],[sz,cz,0],[0,0,1]],
   mm([[cy,0,sy],[0,1,0],[-sy,0,cy]],[[1,0,0],[0,cx,-sx],[0,sx,cx]]));
}
const eye=unit([.60,.45,-.73]),right=unit([.78,0,.63]),up=unit(cross(right,eye)),light=unit([.45,.88,-.32]);
const shade=(hex,factor)=>{
 if(!/^#[0-9a-fA-F]{6}$/.test(hex))throw Error("Unrecognized palette value");
 const n=parseInt(hex.slice(1),16);
 return "#"+[n>>16,n>>8&255,n&255].map(x=>Math.min(255,Math.max(0,Math.round(x*factor+6))).toString(16).padStart(2,"0")).join("");
};
let model,motions,clip,playing=true,elapsed=0,lastTimestamp=null,projection=null;
function geometryForPose(channels){
 const parts=new Map(model.parts.map(p=>[p.id,p]));
 const cache=new Map();
 function world(id,parents=new Set()){
  if(cache.has(id))return cache.get(id);
  if(parents.has(id))throw Error("Cyclic character parent hierarchy");
  const p=parts.get(id);if(!p)throw Error("Unknown body part "+id);
  const degrees=[...(p.transform?.rotate_deg||[0,0,0])];
  for(const [axis,i] of [["x",0],["y",1],["z",2]]){
   degrees[i]+=channels[id+".pivot.rotation."+axis]||0;
  }
  const localRotation=rotation(degrees);
  let position=[...(p.transform?.translate||[0,0,0])];
  if(id==="root")position[1]+=channels["root.frame.position.y"]||0;
  let result={pos:position,rotation:localRotation};
  if(p.parent){
   const parent=parts.get(p.parent),parentWorld=world(p.parent,new Set([...parents,id]));
   const attachment=p.attachment||{};
   let translation=position;
   if(attachment.parent_anchor){
    const a=parent.anchors?.[attachment.parent_anchor],b=p.anchors?.[attachment.child_anchor];
    if(!a||!b)throw Error("Unresolved character anchor "+id);
    translation=add(translation,sub(add(a,attachment.offset||[0,0,0]),mv(localRotation,b)));
   }
   result={pos:add(parentWorld.pos,mv(parentWorld.rotation,translation)),
           rotation:mm(parentWorld.rotation,localRotation)};
  }
  cache.set(id,result);return result;
 }
 const faces=[];
 for(const part of model.parts){
  const g=part.geometry;if(!g?.kind)continue;
  let bw,bd,tw,td,h;
  if(g.kind==="cuboid"||g.kind==="wedge"){[bw,h,bd]=g.size;tw=bw;td=bd;}
  else if(g.kind==="tapered_box"){[bw,bd]=g.bottom;[tw,td]=g.top;h=g.height;}
  else throw Error("Unsupported publicly sourced geometry "+g.kind);
  if(![bw,bd,tw,td,h].every(x=>Number.isFinite(x)&&x>0))throw Error("Invalid geometry "+part.id);
  const w=world(part.id);
  const vertices=[[-bw/2,-h/2,-bd/2],[bw/2,-h/2,-bd/2],[bw/2,-h/2,bd/2],[-bw/2,-h/2,bd/2],
   [-tw/2,h/2,-td/2],[tw/2,h/2,-td/2],[tw/2,h/2,td/2],[-tw/2,h/2,td/2]]
   .map(v=>add(w.pos,mv(w.rotation,v)));
  const material=model.materials[part.material];if(!material)throw Error("Unresolved material "+part.material);
  for(const indices of [[0,1,2,3],[0,4,5,1],[1,5,6,2],[2,6,7,3],[3,7,4,0],[4,7,6,5]]){
   const vs=indices.map(i=>vertices[i]);
   const n=unit(cross(sub(vs[1],vs[0]),sub(vs[2],vs[0])));
   if(dot(n,eye)<.05)continue;
   const f=.59+.41*Math.max(0,dot(n,light));
   faces.push({vs,depth:dot(vs.reduce((a,b)=>add(a,b),[0,0,0]).map(v=>v/4),eye),
    fill:shade(material,f),stroke:shade(material,f*.76)});
  }
 }
 return faces;
}
function draw(){
 if(!clip||!model)return;
 const pose=samplePose(clip,elapsed),faces=geometryForPose(pose.channels);
 if(faces.length<70)throw Error("Missing character geometry in animated frame");
 if(!projection){
  const pts=faces.flatMap(f=>f.vs.map(v=>[dot(v,right),-dot(v,up)]));
  const xs=pts.map(v=>v[0]),ys=pts.map(v=>v[1]);
  const minX=Math.min(...xs),maxX=Math.max(...xs),minY=Math.min(...ys),maxY=Math.max(...ys);
  // Fit using a static origin and added padding so the camera does not follow the animation.
  const scale=Math.min(485/(maxX-minX),600/(maxY-minY));
  projection={scale,ox:360-(minX+maxX)*scale/2,oy:408-(minY+maxY)*scale/2};
 }
 faces.sort((a,b)=>a.depth-b.depth);
 const {scale,ox,oy}=projection;
 const markup=['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 820" role="img" aria-label="Animated technical Quest Girl v7 rigid character preview">',
 '<rect width="720" height="820" fill="#dce1e7"/>',
 '<ellipse cx="360" cy="722" rx="205" ry="29" fill="#59616b" opacity=".10"/>'];
 for(const f of faces){
  const points=f.vs.map(v=>(ox+dot(v,right)*scale).toFixed(1)+","+(oy-dot(v,up)*scale).toFixed(1)).join(" ");
  markup.push('<polygon points="'+points+'" fill="'+f.fill+'" stroke="'+f.stroke+'" stroke-width=".65" stroke-linejoin="round"/>');
 }
 markup.push("</svg>");
 stage.innerHTML=markup.join("");
 stage.dataset.clip=clip.id;stage.dataset.rendered="true";stage.dataset.frameTime=pose.seconds.toFixed(3);stage.dataset.channelSnapshot=JSON.stringify(pose.channels);
 seek.value=String(Math.round(1000*pose.seconds/clip.duration_seconds));
 clock.textContent=pose.seconds.toFixed(2)+" / "+clip.duration_seconds.toFixed(1)+" s";
}
function tick(timestamp){
 if(lastTimestamp===null)lastTimestamp=timestamp;
 if(playing&&clip)elapsed+=(timestamp-lastTimestamp)/1000;
 lastTimestamp=timestamp;
 try{draw();}catch(e){playing=false;message.textContent="Motion rendering failed: "+e.message;toggle.disabled=true;return;}
 requestAnimationFrame(tick);
}
try{
 const [mr,cr]=await Promise.all([
  fetch("../characters/quest-girl-v7.json",{cache:"no-cache"}),
  fetch("../characters/quest-girl-motion-v0.2.json",{cache:"no-cache"})
 ]);
 if(!mr.ok||!cr.ok)throw Error("Character or motion source unavailable");
 model=await mr.json();motions=await cr.json();
 if(model.id!=="quest-girl-v7"||model.parts.length!==44||motions.source_acceptance!=="passed-functional-baseline"||motions.artistic_approval!==false||motions.clips.length!==4)throw Error("Unexpected source revision or approval status");
 const search=new URLSearchParams(location.search);
 const requested=search.get("clip");
 if(motions.clips.some(c=>c.id===requested))choice.value=requested;
 clip=motions.clips.find(c=>c.id===choice.value);
 if(!clip)throw Error("Unknown initial motion clip");
 const phase=search.get("phase");
 if(phase!==null){
  const fraction=Number(phase);
  if(Number.isFinite(fraction)&&fraction>=0&&fraction<1)elapsed=fraction*clip.duration_seconds;
 }
 choice.addEventListener("change",()=>{
  clip=motions.clips.find(c=>c.id===choice.value);
  if(!clip)throw Error("Unknown selected motion");
  elapsed=0;projection=null;draw();
 });
 toggle.addEventListener("click",()=>{playing=!playing;toggle.textContent=playing?"Pause":"Play";lastTimestamp=null;});
 seek.addEventListener("input",()=>{elapsed=Number(seek.value)/1000*clip.duration_seconds;playing=false;toggle.textContent="Play";lastTimestamp=null;draw();});
 message.textContent="Original motion values · source-derived rigid playback · functional proof only, not aesthetic approval";
 draw();
 requestAnimationFrame(tick);
}catch(error){message.textContent="Unable to load character motion: "+error.message;toggle.disabled=true;console.error("Sceneology animation:",error);}
