import assert from "node:assert/strict";

const idPattern=/^[a-z][a-z0-9-]*$/;
const colorPattern=/^#[0-9a-fA-F]{6}$/;
const number=x=>typeof x==="number"&&Number.isFinite(x);

// A narrow, intentionally synthetic demonstration of schema evolution.
// Historical source dialects require independently reviewed adapters.
export function migrateSyntheticSceneV0(legacy) {
 assert.ok(legacy&&typeof legacy==="object"&&!Array.isArray(legacy));
 assert.equal(legacy.schema_version,0,"Only synthetic v0 is supported");
 assert.match(legacy.id,idPattern);
 assert.ok(typeof legacy.title==="string"&&legacy.title.trim());
 assert.ok(legacy.canvas&&number(legacy.canvas.width)&&legacy.canvas.width>0);
 assert.ok(number(legacy.canvas.height)&&legacy.canvas.height>0);
 assert.match(legacy.canvas.background,colorPattern);
 assert.ok(Array.isArray(legacy.shapes)&&legacy.shapes.length>0);

 const seen=new Set();
 const elements=legacy.shapes.map(shape=>{
  assert.match(shape.id,idPattern);
  assert.ok(!seen.has(shape.id),"Duplicate object id");seen.add(shape.id);
  assert.ok(["rectangle","ellipse"].includes(shape.type),"Unsupported v0 shape");
  for(const property of ["x","y","width","height"])assert.ok(number(shape[property]),"Invalid "+property);
  assert.ok(shape.width>0&&shape.height>0,"Nonpositive dimensions");
  assert.ok(shape.x>=0&&shape.y>=0&&shape.x+shape.width<=legacy.canvas.width&&shape.y+shape.height<=legacy.canvas.height,"Shape extends outside canvas");
  assert.match(shape.fill,colorPattern);
  return {
   id:shape.id,role:"object",shape:shape.type,
   transform:{position:[shape.x,shape.y],scale:[1,1],rotation:0},
   size:[shape.width,shape.height],color:shape.fill
  };
 });
 return {
  schema_version:1,
  id:legacy.id,title:legacy.title,
  summary:"Schema evolution fixture; not imported historical artwork.",
  dimension:"2d",units:"px",
  frame:{width:legacy.canvas.width,height:legacy.canvas.height},
  elements,relations:[],constraints:[],
  presentation:{
   background:legacy.canvas.background,
   draw_order:elements.map(e=>e.id),
   style:{name:"synthetic-v0-conversion"}
  },
  realization:{kind:"declarative-only",engine:"none",assets:[],notes:"Schema migration example, not a realized viewer."}
 };
}
