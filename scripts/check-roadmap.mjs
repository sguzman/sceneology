import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";

const root = path.resolve(import.meta.dirname, "..");
const read = rel => fs.readFileSync(path.join(root, rel), "utf8");
const ledger = JSON.parse(read("docs/roadmap.json"));
const roadmap = read("docs/ROADMAP.md");
const intakeSchema = JSON.parse(read("docs/migration-intake.schema.json"));
assert.equal(intakeSchema.type, "object");
assert.equal(intakeSchema.properties?.disposition?.enum?.includes("admit"), true);
assert.ok(intakeSchema.allOf?.length, "Missing fail-closed public admission condition");

assert.equal(ledger.schema_version, 1);
assert.equal(ledger.project, "sceneology");
assert.equal(ledger.scope, "bounded-public-scene-migration-mvp");
assert.ok(Array.isArray(ledger.milestones) && ledger.milestones.length >= 1);
assert.ok(Array.isArray(ledger.baseline?.completed_task_ids));

const ids = new Set();
const milestones = new Set();
let total = 0;
let earned = 0;
const tasks = new Map();
for (const phase of ledger.milestones) {
  assert.match(phase.id, /^[A-Z]$/);
  assert.ok(!milestones.has(phase.id), "Duplicate phase " + phase.id);
  milestones.add(phase.id);
  assert.ok(typeof phase.emoji === "string" && phase.emoji.length > 0);
  assert.ok(typeof phase.title === "string" && phase.title.trim());
  assert.ok(Array.isArray(phase.tasks) && phase.tasks.length > 0);
  for (const task of phase.tasks) {
    assert.match(task.id, /^[A-Z][0-9]{2}$/);
    assert.equal(task.id[0], phase.id);
    assert.ok(!ids.has(task.id), "Duplicate roadmap task " + task.id);
    ids.add(task.id);
    tasks.set(task.id, task);
    assert.ok(Number.isInteger(task.points) && task.points > 0);
    assert.ok(["done", "todo", "blocked"].includes(task.status));
    assert.ok(Array.isArray(task.evidence));
    assert.ok(roadmap.includes("**" + task.id + " (" + task.points + ")"), "Missing human-readable task " + task.id);
    for (const rel of task.evidence) {
      assert.ok(typeof rel === "string" && /^[a-zA-Z0-9._/-]+$/.test(rel));
      assert.ok(!rel.split("/").some(x => !x || x === "." || x === ".."));
      assert.ok(fs.statSync(path.join(root, rel), { throwIfNoEntry: false })?.isFile(),
        "Evidence file missing: " + rel);
    }
    if (task.status === "done") {
      assert.ok(task.evidence.length > 0, "Completed task lacks evidence: " + task.id);
      earned += task.points;
    }
    total += task.points;
  }
}
assert.equal(total, 100, "Roadmap weights must total 100 points");
let baseline = 0;
const baselineIds = new Set(ledger.baseline.completed_task_ids);
assert.equal(baselineIds.size, ledger.baseline.completed_task_ids.length);
for (const id of baselineIds) {
  const task = tasks.get(id);
  assert.ok(task && task.status === "done", "Invalid baseline task: " + id);
  baseline += task.points;
}
assert.ok(baseline <= earned);
for (const rel of ["docs/MIGRATION.md", "docs/PUBLICATION.md", "docs/migration-intake.schema.json"]) {
  assert.ok(fs.statSync(path.join(root, rel), { throwIfNoEntry: false })?.isFile());
}
console.log(`Sceneology roadmap: ${baseline}% -> ${earned}% (+${earned - baseline} percentage points); ${ids.size} weighted tasks.`);
