import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const root=path.resolve(import.meta.dirname,"..");
const files=[
 "experiments/backyard-daynight-legacy-webgl2.html",
 "experiments/backyard-outline-inverted-hull-rejected.html",
 "experiments/backyard-outline-screen-space-v2.html",
 "experiments/backyard-rain-wind-archival.html",
 "experiments/backyard-snow-archival.html"
];

function decompress(compressed){
 const bytes=[];
 for(let at=0;at<compressed.length;){
  const header=compressed[at++];
  if(header<128){
   const count=header+1;
   assert.ok(at+count<=compressed.length,"Truncated inline geometry literal");
   for(let i=0;i<count;i++)bytes.push(compressed[at++]);
  }else{
   const count=header-125;
   assert.ok(at+1<compressed.length,"Truncated backreference");
   const distance=compressed[at]|(compressed[at+1]<<8);
   at+=2;
   assert.ok(distance>0&&distance<=bytes.length,"Invalid packed geometry backreference");
   for(let i=0;i<count;i++)bytes.push(bytes[bytes.length-distance]);
  }
  assert.ok(bytes.length<=3265,"Unexpected decompressed scene payload size");
 }
 return Buffer.from(bytes);
}
function sceneHash(raw){
 let n=2166136261;
 for(const v of raw)n=Math.imul(n^v,16777619)>>>0;
 return n;
}
const digests=new Set();
for(const file of files){
 const source=fs.readFileSync(path.join(root,file),"utf8");
 const match=source.match(/const\s+(PACKED|PAYLOAD)\s*=\s*`([A-Za-z0-9+/=\s]+)`/);
 assert.ok(match,"Unrecognized inline scene encoding: "+file);
 const encoded=match[2].replace(/\s+/g,"");
 assert.ok(/^[A-Za-z0-9+/]+={0,2}$/.test(encoded));
 const binary=Buffer.from(encoded,"base64");
 const raw=match[1]==="PACKED"?decompress(binary):binary;
 assert.equal(raw.length,3265,"Unexpected decoded scene payload length: "+file);
 assert.equal(raw.subarray(0,4).toString("ascii"),"RB01","Scene payload schema header differs: "+file);
 assert.equal(sceneHash(raw),2710925923,"Source scene geometry checksum differs: "+file);
 const hash=crypto.createHash("sha256").update(raw).digest("hex");
 digests.add(hash);
 console.log(file+": checked 3265-byte structured geometry payload");
}
assert.equal(digests.size,1,"Archival studies no longer agree on original geometry bytes");
console.log("Sceneology media-payload inspection passed: five archival WebGL2 entries share the same checked binary geometry.");
