const container=document.getElementById("family-items");
const select=document.getElementById("family-filter");
const count=document.getElementById("family-count");
const nameFromKey=s=>s.split("-").map(w=>w[0].toUpperCase()+w.slice(1)).join(" ");
function make(record){
 const card=document.createElement("article");card.className="review-item";card.dataset.family=record.family;card.dataset.recordId=record.key;
 const figure=document.createElement("figure");
 const image=document.createElement("img");
 image.loading="lazy";image.decoding="async";
 image.src="./family-previews/"+record.public_path.split("/").at(-1).replace(".sc3d.yml",".svg");
 image.alt="Source-derived illustration of "+nameFromKey(record.key)+"; not approved as a gallery image";
 figure.append(image);
 const contents=document.createElement("div");contents.className="copy";
 const heading=document.createElement("h3");heading.textContent=nameFromKey(record.key);
 const status=document.createElement("p");status.textContent="Historical source family: accepted · new preview: awaiting visual approval";
 const source=document.createElement("a");
 source.textContent="Inspect original public model source";
 source.href="https://github.com/sguzman/renderarium/blob/main/"+record.source_path;
 source.target="_blank";source.rel="noopener noreferrer";
  const orbit=document.createElement("a");
 orbit.textContent="Inspect source geometry from different angles";
 orbit.href="./family-orbit.html?model="+encodeURIComponent(record.key);
 orbit.style.display="block";
 orbit.style.marginTop="10px";
 contents.append(heading,status,source,orbit);card.append(figure,contents);
 return card;
}
try{
 const response=await fetch("../catalog/accepted-family-sources.json",{cache:"no-cache"});
 if(!response.ok)throw Error("Source family catalog unavailable");
 const data=await response.json();
 if(data.schema_version!==1||!Array.isArray(data.items)||data.items.length!==30)throw Error("Unexpected family catalog");
 if(data.items.some(r=>r.selection_status!=="source-staged-not-in-gallery"||r.new_renderer_visual_approval!==false))throw Error("Visual approval status unexpectedly changed");
 const cards=data.items.map(make);
 const draw=()=>{
  const chosen=select.value;let visible=0;
  for(const card of cards){const show=!chosen||card.dataset.family===chosen;card.hidden=!show;if(show)visible++;}
  count.textContent=visible+" source-derived previews visible · zero automatically approved exhibits";
 };
 container.replaceChildren(...cards);
 select.addEventListener("change",draw);draw();
}catch(error){
 count.textContent="Unable to load source family previews";
 console.error("Sceneology family review:",error);
}
