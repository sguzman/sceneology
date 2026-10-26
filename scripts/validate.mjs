import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import { errorsFor } from "./schema-subset.mjs";

const root = path.resolve(import.meta.dirname, "..");
await import("./build-accepted-previews.mjs");
await import("./build-quest-girl-preview.mjs");
await import("./test-model-preview-browser.mjs");
const load = relative => JSON.parse(fs.readFileSync(path.join(root, relative), "utf8"));
const fileExists = relative => fs.statSync(path.join(root, relative), {throwIfNoEntry: false})?.isFile() === true;
const allowedKinds = new Set(["scene","object","character","experiment","effect","animation","renderer","tool","ontology","other"]);
const allowedStatuses = new Set(["planned","active","experimental","validated","failed","complete","archived"]);
const allowedRights = new Set(["original","permitted-third-party","mixed-cleared"]);
const allowedSourceDirectories = new Set(["scenes","source-scenes","models","characters","experiments","ontology","runtime","assets","tools","docs"]);
const safePath = (value, roots) => typeof value === "string" &&
  /^[a-zA-Z0-9._/-]+$/.test(value) && value.split("/").length > 1 &&
  roots.has(value.split("/")[0]) && !value.split("/").some(segment => !segment || segment === "." || segment === "..");

const recordSchema = load("ontology/schemas/record-v1.schema.json");
const library = load("catalog/library.json");
const showcase = load("catalog/showcase.json");
assert.equal(library.schema_version, 1);
assert.equal(showcase.schema_version, 1);
assert.ok(Array.isArray(library.records));
assert.ok(Array.isArray(showcase.approved_ids));

const ids = new Set();
for (const entry of library.records) {
  assert.ok(entry && typeof entry === "object" && !Array.isArray(entry));
  assert.deepEqual(errorsFor(entry, recordSchema, recordSchema), [], "Invalid catalog record schema: " + entry.id);
  if (entry.provenance.origin === "previously-public") {
    assert.ok(entry.provenance.public_source && entry.provenance.source_blob, "Public source evidence required: " + entry.id);
  }
  assert.match(entry.id, /^[a-z][a-z0-9-]*$/);
  assert.ok(!ids.has(entry.id), "Duplicate record " + entry.id);
  ids.add(entry.id);
  assert.ok(typeof entry.title === "string" && entry.title.trim());
  assert.ok(typeof entry.summary === "string" && entry.summary.trim());
  assert.ok(allowedKinds.has(entry.kind), "Invalid kind: " + entry.id);
  assert.ok(allowedStatuses.has(entry.status), "Invalid technical status: " + entry.id);
  assert.ok(allowedRights.has(entry.rights), "Uncleared rights: " + entry.id);
  assert.ok(safePath(entry.path, allowedSourceDirectories) && fileExists(entry.path), "Missing source path: " + entry.id);
  for (const optional of ["viewer","thumbnail"]) {
    if (entry[optional] !== undefined)
      assert.ok(safePath(entry[optional], new Set(["scenes","models","characters","experiments","site","assets"])) &&
        fileExists(entry[optional]), "Invalid " + optional + " for " + entry.id);
  }
}
const chosen = new Set();
for (const id of showcase.approved_ids) {
  assert.equal(typeof id, "string");
  assert.ok(!chosen.has(id), "Duplicate gallery selection: " + id);
  chosen.add(id);
  const record = library.records.find(item => item.id === id);
  assert.ok(record, "Selected work not found in library: " + id);
  assert.ok(record.viewer && record.thumbnail, "Selected work missing real viewer or thumbnail: " + id);
  assert.notEqual(record.status, "failed", "Failed studies must not appear in the curated gallery: " + id);
}
for (const required of ["index.html","site/main.js","site/style.css","ontology/README.md","CONSTITUTION.md"]) {
  assert.ok(fileExists(required), "Missing project foundation: " + required);
}
console.log(`Sceneology validation passed: ${library.records.length} technical records, ${showcase.approved_ids.length} curated exhibits.`);

await import("./check-roadmap.mjs");
await import("./check-ontology.mjs");
await import("./publication-gate.mjs");

await import("./test-ontology-roundtrip.mjs");

await import("./check-provenance.mjs");

await import("./check-inline-geometry.mjs");

await import("./check-curation.mjs");
