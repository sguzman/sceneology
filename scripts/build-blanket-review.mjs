import assert from "node:assert/strict";
import fs from "node:fs";
import crypto from "node:crypto";
import path from "node:path";
import {projectArtifact} from "./build-family-previews.mjs";
const root=path.resolve(import.meta.dirname,"..");
const m=JSON.parse(fs.readFileSync(path.join(root,"catalog/blanket-reconstruction-review.json"),"utf8"));
assert.equal(m.schema_version,1);
assert.equal(m.original_accepted_artifact_recovered,false);
assert.equal(m.artwork_approved,false);
assert.equal(m.allowed_in_showcase,false);
const blobSha=b=>crypto.createHash("sha1").update(Buffer.from("blob "+b.length+"\0")).update(b).digest("hex");
const out=path.join(root,"site/blanket-previews");
fs.mkdirSync(out,{recursive:true});
for(const [kind,record] of [["reference",m.reference],["proposal",m.proposal]]){
 const bytes=fs.readFileSync(path.join(root,record.path));
 assert.equal(blobSha(bytes),record.sha,kind+" source changed without assessment");
 const image=projectArtifact(bytes.toString("utf8"),"bed-cover-"+kind,3);
 assert.ok(image.polygons>=3);
 fs.writeFileSync(path.join(out,kind+".svg"),image.svg);
}
console.log("Sceneology technical blanket comparison generated: two source-derived illustrations, neither is original v1.3 or gallery-approved.");
