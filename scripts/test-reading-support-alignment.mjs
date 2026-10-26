import assert from "node:assert/strict";
import {measureSourceShoeSupport} from "../site/reading-support-alignment.mjs";
const simpleFeet=height=>({key:"quest-girl-v7",faces:["shoe_left","shoe_right"].flatMap((part,i)=>{
 const x=i?0.4:-0.4;
 const v=[[x-.1,height-.1,-.1],[x+.1,height-.1,-.1],[x+.1,height-.1,.1],[x-.1,height-.1,.1],
  [x-.1,height,-.1],[x+.1,height,-.1],[x+.1,height,.1],[x-.1,height,.1]];
 return [[0,1,2,3],[4,5,6,7]].map(ids=>({part,vertices:ids.map(n=>v[n])}));
})});
const rug={key:"wide-area-rug",faces:[{part:"field",vertices:[[-1,.1,-1],[1,.1,-1],[1,.1,1],[-1,.1,1]]}]};
const loc=(x=0,y=0,z=0,yaw_deg=0)=>({translate:[x,y,z],yaw_deg});
const inside=measureSourceShoeSupport(simpleFeet(.05),rug,loc(),loc());
assert.equal(inside.shoes.length,2);
assert.equal(inside.all_shoe_corners_within_rug_field,true);
assert.equal(inside.original_vertical_gap_to_field,-.15);
assert.equal(inside.proposed_visualization_only_y_offset,.15);
assert.equal(inside.exact_mesh_contact_certified,false);
const shifted=measureSourceShoeSupport(simpleFeet(.05),rug,loc(0,0,0,35),loc(0,0,0,50));
assert.equal(shifted.all_shoe_corners_within_rug_field,true,"Rotated support footprint should remain inside");
const outside=measureSourceShoeSupport(simpleFeet(.05),rug,loc(1.5),loc());
assert.equal(outside.all_shoe_corners_within_rug_field,false);
assert.equal(outside.proposed_visualization_only_y_offset,.15,"No support identity inferred from vertical offset");
assert.throws(()=>measureSourceShoeSupport({key:"wrong",faces:[]},rug,loc(),loc()),/pinned/);
console.log("Sceneology source shoe/flat-cover support geometry passed: two soles, rotated footprint, off-rug, and no certification.");
