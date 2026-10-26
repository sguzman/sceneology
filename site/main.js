// Exhibit only IDs explicitly selected by the project owner. Do not list the technical library.
async function readJson(relative) {
  const response=await fetch(relative,{cache:"no-cache"});
  if(!response.ok)throw Error("Gallery data unavailable: "+response.status);
  return response.json();
}
function safePath(value) {
  return typeof value==="string" &&
    /^(scenes|models|characters|experiments|site|assets)\/[A-Za-z0-9._/-]+$/.test(value) &&
    !value.split("/").some(segment=>!segment||segment==="."||segment==="..");
}
function safePublicSource(value){
  if(typeof value!=="string")return null;
  try{
    const parsed=new URL(value);
    return parsed.protocol==="https:" && parsed.hostname==="github.com" &&
      parsed.pathname.startsWith("/") ? parsed.href:null;
  }catch{return null;}
}
function tag(name,className,content){
  const element=document.createElement(name);
  if(className)element.className=className;
  if(content!==undefined)element.textContent=content;
  return element;
}
function createCard(record){
  const card=tag("article","work");
  card.dataset.recordId=record.id;
  const viewer=tag("a","work-viewer");
  viewer.href="./"+record.viewer;
  viewer.setAttribute("aria-label","Open "+record.title+" viewer");
  const media=tag("span","work-media");
  const image=document.createElement("img");
  image.alt="Preview of "+record.title;
  image.src="./"+record.thumbnail;
  image.loading="lazy";
  image.decoding="async";
  image.width=640;image.height=480;
  image.addEventListener("error",()=>{
    const fallback=tag("span","work-media-fallback","Preview unavailable");
    fallback.setAttribute("role","img");
    fallback.setAttribute("aria-label","Preview unavailable for "+record.title);
    media.replaceChildren(fallback);
  },{once:true});
  media.append(image);
  const details=tag("span","work-text");
  details.append(
    tag("span","work-kind",record.kind),
    tag("span","work-title",record.title),
    tag("span","work-summary",record.summary),
    tag("span","work-status","Technical status: "+record.status)
  );
  viewer.append(media,details);
  card.append(viewer);
  const publicSource=safePublicSource(record.provenance?.public_source);
  if(publicSource){
    const source=tag("a","work-source","Original public source");
    source.href=publicSource;
    source.target="_blank";
    source.rel="noopener noreferrer";
    card.append(source);
  }
  return card;
}
async function loadGallery(){
  const region=document.getElementById("gallery");
  try{
    const [library,showcase]=await Promise.all([
      readJson("./catalog/library.json"),
      readJson("./catalog/showcase.json")
    ]);
    if(library.schema_version!==1||showcase.schema_version!==1||
       !Array.isArray(library.records)||!Array.isArray(showcase.approved_ids)){
      throw Error("Invalid gallery catalog");
    }
    const records=new Map(library.records.map(entry=>[entry.id,entry]));
    const selected=showcase.approved_ids.map(id=>{
      const record=records.get(id);
      if(!record||record.status==="failed"||
         !safePath(record.viewer)||!safePath(record.thumbnail)){
        throw Error("Invalid approved gallery entry");
      }
      return record;
    });
    if(!selected.length){
      region.className="empty";
      region.textContent="No works have been selected for the public showcase yet.";
      return;
    }
    region.className="gallery";
    region.replaceChildren(...selected.map(createCard));
  }catch(error){
    region.className="empty";
    region.textContent="The gallery could not be loaded.";
    console.error("Sceneology gallery:",error);
  }
}
loadGallery();
