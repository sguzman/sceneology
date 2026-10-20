// The gallery is an editorial allowlist. Library records never auto-appear.
async function readJson(path) {
  const response = await fetch(path, { cache: "no-cache" });
  if (!response.ok) throw new Error("Unable to load gallery catalog.");
  return response.json();
}
function safePath(value) {
  return typeof value === "string" &&
    /^(scenes|experiments|site|assets)\/[a-zA-Z0-9._/-]+$/.test(value) &&
    !value.split("/").some(segment => segment === ".." || segment === ".");
}
function createCard(record) {
  const card = document.createElement("a");
  card.className = "work";
  card.href = "./" + record.viewer;
  const image = document.createElement("img");
  image.src = "./" + record.thumbnail;
  image.alt = "Preview of " + record.title;
  image.loading = "lazy";
  const details = document.createElement("span");
  details.className = "work-text";
  for (const [kind, value] of [
    ["work-kind", record.kind], ["work-title", record.title], ["work-summary", record.summary]
  ]) {
    const el = document.createElement("span");
    el.className = kind;
    el.textContent = value;
    details.append(el);
  }
  card.append(image, details);
  return card;
}
async function loadGallery() {
  const region = document.getElementById("gallery");
  try {
    const [library, showcase] = await Promise.all([
      readJson("./catalog/library.json"),
      readJson("./catalog/showcase.json")
    ]);
    if (library.schema_version !== 1 || showcase.schema_version !== 1 ||
        !Array.isArray(library.records) || !Array.isArray(showcase.approved_ids)) {
      throw new Error("Invalid gallery catalog.");
    }
    const records = new Map(library.records.map(entry => [entry.id, entry]));
    const selected = showcase.approved_ids.map(id => {
      const entry = records.get(id);
      if (!entry || !safePath(entry.viewer) || !safePath(entry.thumbnail)) {
        throw new Error("Approved gallery record is missing or invalid.");
      }
      return entry;
    });
    if (!selected.length) {
      region.className = "empty";
      region.textContent = "No works have been selected for the public showcase yet.";
      return;
    }
    region.className = "gallery";
    region.replaceChildren(...selected.map(createCard));
  } catch (error) {
    region.className = "empty";
    region.textContent = "The gallery could not be loaded.";
    console.error("Sceneology gallery:", error);
  }
}
loadGallery();
