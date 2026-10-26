import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

// Source-only room diagrams. These are NOT rendered environments or showcase images.
const root=path.resolve(import.meta.dirname,"..");
const records=JSON.parse(fs.readFileSync(path.join(root,"catalog/room-alias-candidates.json"),"utf8"));
const output=path.join(root,"site/room-previews");
fs.mkdirSync(output,{recursive:true});
assert.equal(records.scenes.length,4);
const aliases=new Map(records.aliases.map(item=>[item.alias,item]));
const shaOf=bytes=>crypto.createHash("sha1").update(Buffer.from("blob "+bytes.length+"\0")).update(bytes).digest("hex");
const section=(source,key)=>{
 const match=new RegExp("^"+key+":\\s*$","m").exec(source);
 assert.ok(match,"Missing section "+key);
 const tail=source.slice(match.index+match[0].length);
 const next=tail.search(/^[a-z][a-z0-9_-]*:/m);
 return next<0?tail:tail.slice(0,next);
};
const entities=body=>{
 const found=[...body.matchAll(/^  - id:\s*([a-z][a-z0-9-]*)\s*$/gm)];
 return found.map((hit,i)=>({id:hit[1],body:body.slice(hit.index,i+1<found.length?found[i+1].index:body.length)}));
};
const field=(body,key)=>body.match(new RegExp("^\\s+"+key+":\\s*([^\\n]+)","m"))?.[1]?.trim()||null;
const numbers=(body,key)=>{
 const value=field(body,key);
 if(!value||!value.startsWith("[")||!value.endsWith("]"))return null;
 const result=value.slice(1,-1).split(",").map(v=>Number(v.trim()));
 assert.ok(result.every(Number.isFinite),"Invalid vector "+key);
 return result;
};
const xml=s=>String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
const f=n=>Number(n.toFixed(2));
const summary={schema_version:1,review_only:true,geometry_reconstructed:false,asset_bindings_reconstructed:false,artistic_approval:false,scenes:[]};
for(const record of records.scenes){
 const bytes=fs.readFileSync(path.join(root,record.path));
 assert.equal(shaOf(bytes),record.blob_sha,"Room source changed without review "+record.id);
 const source=bytes.toString("utf8");
 assert.match(source,/^status:\s*accepted\s*$/m);
 const zones=entities(section(source,"zones")).map(item=>{
  const center=numbers(item.body,"center"),size=numbers(item.body,"size");
  assert.equal(center?.length,2,"Missing 2D source zone center");
  assert.equal(size?.length,2,"Missing 2D source zone size");
  assert.ok(size.every(v=>v>0));
  return {id:item.id,center,size};
 });
 const instances=entities(section(source,"instances")).map(item=>{
  const alias=field(item.body,"asset_ref");
  assert.ok(alias&&aliases.has(alias),"Unknown asset alias for "+item.id);
  const transform=item.body.match(/transform:\s*\{translate:\s*\[([^\]]+)\]/);
  const position=transform?transform[1].split(",").map(v=>Number(v.trim())):null;
  assert.ok(!position||(position.length===3&&position.every(Number.isFinite)),"Bad explicit source position");
  const relation=field(item.body,"parent_relation");
  assert.ok(position||relation,"Unpositioned room instance without source parent "+item.id);
  return {id:item.id,alias,position,relation};
 });
 assert.equal(instances.length,record.instance_references);
 const positioned=instances.filter(item=>item.position);
 const parented=instances.filter(item=>!item.position);
 const footprint=source.includes("\nroom:\n")?numbers(section(source,"room"),"footprint"):null;
 if(footprint)assert.equal(footprint.length,2);
 const bounds=footprint?{minX:-footprint[0]/2,maxX:footprint[0]/2,minZ:-footprint[1]/2,maxZ:footprint[1]/2}:
  {minX:Infinity,maxX:-Infinity,minZ:Infinity,maxZ:-Infinity};
 for(const zone of zones){
  bounds.minX=Math.min(bounds.minX,zone.center[0]-zone.size[0]/2);
  bounds.maxX=Math.max(bounds.maxX,zone.center[0]+zone.size[0]/2);
  bounds.minZ=Math.min(bounds.minZ,zone.center[1]-zone.size[1]/2);
  bounds.maxZ=Math.max(bounds.maxZ,zone.center[1]+zone.size[1]/2);
 }
 for(const item of positioned){
  bounds.minX=Math.min(bounds.minX,item.position[0]);
  bounds.maxX=Math.max(bounds.maxX,item.position[0]);
  bounds.minZ=Math.min(bounds.minZ,item.position[2]);
  bounds.maxZ=Math.max(bounds.maxZ,item.position[2]);
 }
 assert.ok(Object.values(bounds).every(Number.isFinite));
 const padding=.35,spanX=bounds.maxX-bounds.minX+2*padding,spanZ=bounds.maxZ-bounds.minZ+2*padding;
 const scale=Math.min(595/spanX,480/spanZ);
 const originX=85+(595-spanX*scale)/2;
 const originY=90+(480-spanZ*scale)/2;
 const X=x=>f(originX+(x-bounds.minX+padding)*scale);
 const Y=z=>f(originY+(bounds.maxZ+padding-z)*scale);
 const svg=[
  '<svg xmlns="http://www.w3.org/2000/svg" role="img" viewBox="0 0 1000 665" aria-labelledby="room-title room-description">',
  '<title id="room-title">'+xml(record.id)+' — recovered source layout diagnostics</title>',
  '<desc id="room-description">Exact source zone coordinates and explicitly placed instance centers only. No object meshes, unbound asset geometry, or wall layout has been invented.</desc>',
  '<rect width="1000" height="665" fill="#edf3f4"/>',
  '<rect x="45" y="50" width="680" height="560" rx="12" fill="#fff" stroke="#a2b7b7"/>',
  '<text x="50" y="32" font-size="20" font-family="sans-serif" fill="#25444a">'+xml(record.id)+'</text>',
  '<text x="55" y="634" font-size="14" font-family="sans-serif" fill="#405660">Top-down X/Z diagram · source anchors, not model footprints</text>',
  '<text x="730" y="70" font-size="18" font-family="sans-serif" fill="#29444b">Parent-attached items</text>'
 ];
 if(footprint){
  svg.push('<rect x="'+X(-footprint[0]/2)+'" y="'+Y(footprint[1]/2)+'" width="'+f(footprint[0]*scale)+'" height="'+f(footprint[1]*scale)+'" fill="none" stroke="#51656a" stroke-width="2" stroke-dasharray="9 5"/>');
 }
 zones.forEach((zone,index)=>{
  const [x,z]=zone.center,[w,d]=zone.size;
  svg.push('<rect data-zone="'+xml(zone.id)+'" x="'+X(x-w/2)+'" y="'+Y(z+d/2)+'" width="'+f(w*scale)+'" height="'+f(d*scale)+'" fill="'+(index%2?"#ecdef5":"#d7ede3")+'" fill-opacity=".46" stroke="#83a09b" stroke-dasharray="4 4"/>');
  svg.push('<text x="'+X(x-w/2+.06)+'" y="'+f(Y(z+d/2)+16)+'" font-size="12" font-family="sans-serif" fill="#24453d">'+xml(zone.id)+'</text>');
 });
 positioned.forEach((item,index)=>{
  const [x,,z]=item.position;
  svg.push('<circle data-instance="'+xml(item.id)+'" cx="'+X(x)+'" cy="'+Y(z)+'" r="6" fill="#a24645" stroke="#fff" stroke-width="1.4"/>');
  svg.push('<text x="'+f(X(x)+9)+'" y="'+f(Y(z)+4+(index%2)*10)+'" font-size="13" font-family="sans-serif" fill="#582927">'+xml(item.id)+'</text>');
 });
 parented.forEach((item,index)=>{
  const y=94+index*28;
  svg.push('<text data-parented="'+xml(item.id)+'" x="730" y="'+y+'" font-size="14" font-family="sans-serif" fill="#37515a">'+xml(item.id)+'</text>');
  svg.push('<text x="730" y="'+(y+15)+'" font-size="11" font-family="sans-serif" fill="#6a7c82">'+xml(item.relation)+'</text>');
 });
 svg.push('<text x="730" y="580" font-size="13" font-family="sans-serif" fill="#566a71">'+parented.length+' positions intentionally not inferred</text>','</svg>');
 fs.writeFileSync(path.join(output,record.id+".svg"),svg.join("\n")+"\n");
 summary.scenes.push({
  id:record.id,source_path:record.path,source_blob:record.blob_sha,
  svg:"site/room-previews/"+record.id+".svg",
  zones:zones.length,instances:instances.length,explicit_anchors:positioned.length,
  inherited_positions:parented.length,
  unresolved_alias_placements:instances.filter(item=>!aliases.get(item.alias).selected_binding).length,
  bounds_kind:footprint?"source-room-footprint-and-zones":"auto-framed-zones-and-anchors",
  parent_attached:parented.map(item=>({id:item.id,relation:item.relation}))
 });
}
assert.equal(summary.scenes.reduce((n,item)=>n+item.instances,0),37);
fs.writeFileSync(path.join(output,"manifest.json"),JSON.stringify(summary,null,2)+"\n");
console.log("Sceneology room source diagnostics built: 4 source-pinned rooms; 37 placements; no asset binding, invented geometry, or gallery selection.");
