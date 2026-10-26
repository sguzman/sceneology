const results=document.getElementById("model-results");
const count=document.getElementById("model-count");
const search=document.getElementById("model-search");
const category=document.getElementById("model-category");
const mark=(element,className,text)=>{
 const e=document.createElement(element);if(className)e.className=className;if(text!==undefined)e.textContent=text;return e;
};
const featured=document.getElementById("featured-models");
try {
 const [libraryResponse,showcaseResponse]=await Promise.all([
  fetch("../catalog/library.json"),fetch("../catalog/showcase.json")
 ]);
 if(!libraryResponse.ok||!showcaseResponse.ok)throw Error("Featured records unavailable");
 const [library,showcase]=await Promise.all([libraryResponse.json(),showcaseResponse.json()]);
 if(!Array.isArray(library.records)||!Array.isArray(showcase.approved_ids))throw Error("Unexpected gallery format");
 const byId=new Map(library.records.map(record=>[record.id,record]));
 const fragment=document.createDocumentFragment();
 let total=0;
 for(const id of showcase.approved_ids){
  const entry=byId.get(id);
  if(!entry||entry.kind!=="object"||entry.status==="failed")continue;
  if(!/^models\/[a-z0-9._/-]+\.html$/.test(entry.viewer)||
     !/^site\/model-previews\/[a-z0-9._-]+\.png$/.test(entry.thumbnail))continue;
  const card=mark("article","model featured");
  const image=document.createElement("img");
  image.src="../"+entry.thumbnail;image.alt="Real browser capture of "+entry.title;
  image.loading="lazy";image.decoding="async";
  const title=mark("h3","",entry.title);
  const link=mark("a","","Open interactive model");
  link.href="../"+entry.viewer;
  card.append(image,title,mark("p","",entry.summary),link,mark("p","status","Previously accepted model · source-backed"));
  fragment.append(card);total++;
 }
 featured.replaceChildren(fragment);
 if(!total)featured.append(mark("p","empty","No models have been selected for exhibition."));
}catch(err){featured.replaceChildren(mark("p","empty","Featured models could not be loaded."));console.error(err);}

try {
 const response=await fetch("../catalog/expanded-source-index.json");
 if(!response.ok)throw Error("Source index unavailable");
 const index=await response.json();
 if(index.schema_version!==1||!Array.isArray(index.models))throw Error("Unexpected index");
 const families=new Map();
 for(const entry of index.models){
  const root=entry.id.replace(/-v\d+(?:\.\d+)*(?:r)?$/,"");
  const key=entry.category+"|"+root;
  if(!families.has(key))families.set(key,{name:root,category:entry.category,versions:[]});
  families.get(key).versions.push(entry);
 }
 const list=[...families.values()].sort((a,b)=>a.category.localeCompare(b.category)||a.name.localeCompare(b.name));
 for(const label of [...new Set(list.map(x=>x.category))].sort()){
  const option=document.createElement("option");option.value=label;option.textContent=label.replaceAll("-"," ");category.append(option);
 }
 function draw(){
  const q=search.value.trim().toLowerCase(),cat=category.value;
  const found=list.filter(x=>(!cat||x.category===cat)&&(!q||x.name.includes(q)||x.versions.some(v=>v.id.includes(q))));
  const fragment=document.createDocumentFragment();
  for(const entry of found){
   const card=mark("article","model");
   const title=entry.name.replace(/^block-chibi-/,"").replaceAll("-"," ");
   card.append(mark("h3","",title),mark("p","",entry.category.replaceAll("-"," ")));
   const versions=mark("small","",entry.versions.length+" source version"+(entry.versions.length===1?"":"s")+" · technical inventory");
   card.append(versions);
   const links=mark("p","");
   for(const v of entry.versions){
    const a=mark("a","",v.id.match(/v\d+(?:\.\d+)*(?:r)?$/)?.[0]||"source");
    a.href=v.source_url;a.target="_blank";a.rel="noopener noreferrer";links.append(a," ");
   }
   card.append(links);fragment.append(card);
  }
  results.replaceChildren(fragment);
  count.textContent=found.length+" model families shown · "+index.models.length+" source versions indexed. Approval and visual previews require individual review.";
 }
 search.addEventListener("input",draw);category.addEventListener("change",draw);
 draw();
}catch(error){
 results.replaceChildren(mark("p","empty","The model collection could not be loaded."));
 count.textContent="Unable to load model registry.";
 console.error("Model catalog:",error);
}
