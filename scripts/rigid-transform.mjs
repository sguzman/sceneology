// Rigid transforms for constructive scene parts. Basis vectors are columns.
// Source Euler angles use X, then Y, then Z rotations in degrees.
const add=(a,b)=>a.map((v,i)=>v+b[i]);
export function rotateEuler(point,degrees){
 const [rx,ry,rz]=degrees.map(v=>v*Math.PI/180);let[x,y,z]=point;
 let c=Math.cos(rx),s=Math.sin(rx);[y,z]=[y*c-z*s,y*s+z*c];
 c=Math.cos(ry);s=Math.sin(ry);[x,z]=[x*c+z*s,-x*s+z*c];
 c=Math.cos(rz);s=Math.sin(rz);return[x*c-y*s,x*s+y*c,z];
}
export function applyBasis(basis,p){
 return [
  basis[0][0]*p[0]+basis[1][0]*p[1]+basis[2][0]*p[2],
  basis[0][1]*p[0]+basis[1][1]*p[1]+basis[2][1]*p[2],
  basis[0][2]*p[0]+basis[1][2]*p[1]+basis[2][2]*p[2]
 ];
}
export function localRigid(position,degrees){
 return {position:[...position],basis:[[1,0,0],[0,1,0],[0,0,1]].map(axis=>rotateEuler(axis,degrees))};
}
export function composeRigid(parent,child){
 return {
  position:add(parent.position,applyBasis(parent.basis,child.position)),
  basis:child.basis.map(axis=>applyBasis(parent.basis,axis))
 };
}
export function transformPoint(transform,point){
 return add(transform.position,applyBasis(transform.basis,point));
}
