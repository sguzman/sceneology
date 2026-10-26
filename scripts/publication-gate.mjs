import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";

const root=path.resolve(import.meta.dirname,"..");
const roots=[".github","catalog","scenes","models","characters","experiments","assets","runtime","tools","site","ontology","docs","scripts","tests","index.html","README.md","AGENTS.md","CONSTITUTION.md","LICENSE",".gitignore"];
const extensions=new Set([".html",".js",".mjs",".json",".md",".yml",".yaml",".css",".svg"]);
const patterns=[
 {id:"private-key-header",regex:/-----BEGIN (?:OPENSSH|RSA|EC|DSA)? ?PRIVATE KEY-----/},
 {id:"local-home-directory",regex:/(?:\/home\/[a-zA-Z][a-zA-Z0-9_-]+\/|\/Users\/[a-zA-Z][a-zA-Z0-9_-]+\/)/},
 {id:"home-user-directory",regex:/[A-Za-z]:\\Users\\[a-zA-Z0-9._-]+\\/},
 {id:"bearer-credential",regex:/\bAuthorization\s*:\s*Bearer\s+[a-zA-Z0-9._-]{24,}/i},
 {id:"api-secret",regex:/\b(?:api[_-]?key|secret[_-]?key|access[_-]?token)\s*[:=]\s*["'][a-zA-Z0-9_-]{24,}["']/i},
 {id:"private-address",regex:/https?:\/\/(?:10\.(?:\d{1,3}\.){3}|192\.168\.(?:\d{1,3}\.){2})/}
];
function scan(text) {
 return patterns.filter(p=>p.regex.test(text)).map(p=>p.id);
}
function walk(relative){
 const abs=path.join(root,relative);
 if(!fs.existsSync(abs))return [];
 return fs.statSync(abs).isDirectory()?
  fs.readdirSync(abs).flatMap(name=>walk(relative+"/"+name)):[relative];
}
const checked=roots.flatMap(walk).filter(f=>extensions.has(path.extname(f)) || f==="LICENSE" || f===".gitignore");
assert.equal(new Set(checked).size,checked.length,"Scanner traversed duplicate paths");
assert.ok(checked.includes("docs/ROADMAP.md")&&checked.includes("scripts/publication-gate.mjs")&&checked.includes(".github/workflows/pages.yml"),"Public scan coverage incomplete");
for(const file of checked){
 const results=scan(fs.readFileSync(path.join(root,file),"utf8"));
 assert.deepEqual(results,[],file+": potential confidential data, hold for human review");
}
const main=fs.readFileSync(path.join(root,"site/main.js"),"utf8");
assert.ok(main.includes("showcase.approved_ids.map"),"Gallery must be based on explicit approval allowlist");
assert.ok(!main.includes("library.records.map(createCard)"),"Do not automatically exhibit the technical library");
assert.ok(scan("safe public scene specification").length===0);
assert.ok(scan("Authorization: Bearer "+"x".repeat(32)).includes("bearer-credential"));
console.log("Sceneology whole-repository publication safety heuristics passed for "+checked.length+" text files. All publication, license, metadata and human review gates still apply.");
