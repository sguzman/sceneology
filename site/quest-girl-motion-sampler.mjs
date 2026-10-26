export function sampleChannel(channel,time){
 if(!Number.isFinite(time)||time<0)throw Error("Invalid nonnegative sample time");
 if(channel.waveform==="keyframes_smoothstep"){
  const pairs=channel.keyframes;
  if(time<=pairs[0][0])return pairs[0][1];
  for(let i=1;i<pairs.length;i++){
   const [a,v0]=pairs[i-1],[b,v1]=pairs[i];
   if(time<=b){
    const u=(time-a)/(b-a),ease=u*u*(3-2*u);
    return v0+(v1-v0)*ease;
   }
  }
  return pairs.at(-1)[1];
 }
 const phase=2*Math.PI*channel.frequency_hz*time;
 const sine=Math.sin(phase);
 if(channel.waveform==="sine")return channel.amplitude*sine;
 if(channel.waveform==="sine_opposed")return -channel.amplitude*sine;
 if(channel.waveform==="biased_sine")return channel.base_delta_deg+channel.amplitude*sine;
 throw Error("Unknown waveform "+channel.waveform);
}
export function samplePose(clip,seconds){
 if(!clip||!Array.isArray(clip.channels)||!Number.isFinite(clip.duration_seconds)||clip.duration_seconds<=0)
  throw Error("Invalid motion clip");
 if(!Number.isFinite(seconds))throw Error("Invalid motion time");
 const time=clip.loop?((seconds%clip.duration_seconds)+clip.duration_seconds)%clip.duration_seconds:
  Math.max(0,Math.min(seconds,clip.duration_seconds));
 const channels={};
 for(const ch of clip.channels){
  if(Object.hasOwn(channels,ch.target))throw Error("Duplicate motion channel "+ch.target);
  channels[ch.target]=sampleChannel(ch,time);
 }
 return {seconds:time,channels};
}
