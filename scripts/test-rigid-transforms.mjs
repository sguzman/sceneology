import assert from "node:assert/strict";
import {applyBasis,composeRigid,localRigid,rotateEuler,transformPoint} from "./rigid-transform.mjs";
const close=(actual,expected,context)=>{
 assert.equal(actual.length,expected.length,context+" dimension");
 for(let i=0;i<actual.length;i++)assert.ok(Math.abs(actual[i]-expected[i])<1e-9,context+" axis "+i+": "+actual[i]+" != "+expected[i]);
};
const dot=(a,b)=>a.reduce((v,x,i)=>v+x*b[i],0);
const parent=localRigid([1,0,0],[90,0,0]);
const child=localRigid([0,0,2],[0,0,90]);
const world=composeRigid(parent,child);
// Noncommuting rotations: Rx(90) * Rz(90) cannot be represented by adding Euler angles.
close(transformPoint(world,[0,1,0]),[0,-2,0],"nested 2-axis fixed-coordinate proof");
close(world.position,[1,-2,0],"transformed child origin");
const naive=localRigid([1,-2,0],[90,0,90]);
assert.ok(transformPoint(naive,[0,1,0]).some((n,i)=>Math.abs(n-transformPoint(world,[0,1,0])[i])>1e-4),
 "Regression fixture must distinguish correct rotation composition from Euler addition");
const grandchild=localRigid([.5,-.2,1],[12,25,-50]);
const nested=composeRigid(world,grandchild);
for(const p of [[0,0,0],[2,3,-4],[.25,-.5,1]]){
 close(transformPoint(nested,p),transformPoint(parent,transformPoint(child,transformPoint(grandchild,p))),"three-stage hierarchy");
}
for(const basis of [parent.basis,child.basis,world.basis,nested.basis]){
 for(let i=0;i<3;i++)for(let j=0;j<3;j++)assert.ok(Math.abs(dot(basis[i],basis[j])-(i===j?1:0))<1e-9,"Basis must stay orthonormal");
}
close(rotateEuler([0,1,0],[90,0,0]),[0,0,1],"local rotation convention");
close(applyBasis(localRigid([0,0,0],[0,0,0]).basis,[5,-3,2]),[5,-3,2],"identity basis");
console.log("Sceneology constructive rigid-hierarchy transforms passed: noncommuting Euler parent-child articulation and three-stage composition.");
