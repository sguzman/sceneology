// Small self-contained timeline sampler for published, source-backed SVG experiments.
// Supports only the properties used by the archived 2D motion scene.
(() => {
  const initial = {x:0,y:0,rotation:0,scaleY:1,opacity:1};
  const clock = () => performance.now()/1000;
  const clamp = v => Math.min(1,Math.max(0,v));
  const curves = {
    "linear": u=>u,
    "power1.in": u=>u*u,
    "power1.out": u=>1-(1-u)*(1-u),
    "power2.out": u=>1-(1-u)**3,
    "power2.inOut": u=>u<0.5?4*u**3:1-4*(1-u)**3,
    "sine.inOut": u=>(1-Math.cos(Math.PI*u))/2
  };
  const nodes = input => typeof input==="string"
    ? [...document.querySelectorAll(input)]
    : Array.isArray(input) ? input.flatMap(nodes)
    : input && typeof input.length==="number" && !input.nodeType
      ? [...input] : input?[input]:[];

  class Motion {
    constructor(options={}) {
      this.settings=options;
      this.tracks=new Map();
      this.running=false;this.repeatCount=0;this.seconds=0;this.startedAt=0;
      const marker=document.querySelector("[data-duration]");
      const duration=marker?Number(marker.dataset.duration):0;
      this.fixedDuration=Number.isFinite(duration)&&duration>0?duration:0;
    }
    to(targets,vars,at=0) {
      const start=Number(at),duration=Number(vars.duration);
      if(!Number.isFinite(start)||start<0||!Number.isFinite(duration)||duration<=0)throw Error("Invalid timeline timing");
      const ease=vars.ease||this.settings.defaults?.ease||"linear";
      if(!curves[ease])throw Error("Unsupported easing curve: "+ease);
      for(const element of nodes(targets)){
        if(!(element instanceof Element))continue;
        let properties=this.tracks.get(element);
        if(!properties){properties=new Map();this.tracks.set(element,properties);}
        for(const [name,value] of Object.entries(vars)){
          if(["duration","ease","delay"].includes(name))continue;
          if(!Object.hasOwn(initial,name)||!Number.isFinite(value))throw Error("Unsupported animated property: "+name);
          let segments=properties.get(name);
          if(!segments){segments=[];properties.set(name,segments);}
          segments.push({start,duration,ease,target:value,order:segments.length});
        }
      }
      return this;
    }
    repeat(times){this.repeatCount=times;return this;}
    sampleSegments(segments,seconds,base) {
      const ordered=[...segments].sort((a,b)=>a.start-b.start||a.order-b.order);
      let current=base,prior=[];
      for(const seg of ordered){
        if(seconds<seg.start)break;
        const from=this.sampleEarlier(prior,seg.start,base);
        const alpha=clamp((seconds-seg.start)/seg.duration);
        current=from+(seg.target-from)*curves[seg.ease](alpha);
        prior.push({...seg,from});
      }
      return current;
    }
    sampleEarlier(earlier,seconds,base){
      let result=base;
      for(const s of earlier){
        if(seconds<s.start)continue;
        const a=clamp((seconds-s.start)/s.duration);
        result=s.from+(s.target-s.from)*curves[s.ease](a);
      }
      return result;
    }
    seek(seconds){
      if(!Number.isFinite(seconds)||seconds<0)throw Error("Invalid seek time");
      const duration=this.duration();
      const t=duration?Math.min(seconds,duration):seconds;
      this.seconds=t;
      for(const [element,properties] of this.tracks){
        const state={...initial};
        for(const [name,segments] of properties){
          let base=initial[name];
          if(name==="opacity"){
            if(!element.dataset.sceneologyInitialOpacity){
              const v=Number(getComputedStyle(element).opacity);
              element.dataset.sceneologyInitialOpacity=String(Number.isFinite(v)?v:1);
            }
            base=Number(element.dataset.sceneologyInitialOpacity);
          }
          state[name]=this.sampleSegments(segments,t,base);
        }
        element.style.transform=`translate(${state.x}px,${state.y}px) rotate(${state.rotation}deg) scaleY(${state.scaleY})`;
        if(properties.has("opacity"))element.style.opacity=String(state.opacity);
      }
      return this;
    }
    duration(){
      let end=this.fixedDuration;
      for(const props of this.tracks.values())for(const segments of props.values())for(const segment of segments)end=Math.max(end,segment.start+segment.duration);
      return end;
    }
    play(startTime=this.seconds){
      this.pause();
      this.seek(startTime);
      if(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches)return this;
      this.running=true;this.startedAt=clock()-this.seconds;
      const tick=()=>{
        if(!this.running)return;
        let t=clock()-this.startedAt,d=this.duration();
        if(d && t>d){
          if(this.repeatCount===-1){this.startedAt=clock()-(t%d);t=t%d;}
          else {this.seek(d);this.running=false;return;}
        }
        this.seek(t);
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);return this;
    }
    pause(){this.running=false;return this;}
  }
  window.sceneTimeline={
    set(targets,values){
      for(const element of nodes(targets)){
        if(!(element instanceof Element))continue;
        if(Object.hasOwn(values,"transformOrigin"))element.style.transformOrigin=values.transformOrigin;
      }
    },
    timeline:options=>new Motion(options)
  };
})();
