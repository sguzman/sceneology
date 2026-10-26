const holder=document.getElementById("room-list");
const count=document.getElementById("room-count");
try{
 const response=await fetch("./room-previews/manifest.json",{cache:"no-cache"});
 if(!response.ok)throw Error("Room source manifest could not load");
 const data=await response.json();
 if(data.schema_version!==1||data.scenes?.length!==4||data.review_only!==true||
    data.artistic_approval!==false||data.geometry_reconstructed!==false||data.asset_bindings_reconstructed!==false)
  throw Error("Room evidence boundary changed");
 const cards=data.scenes.map(item=>{
  if(!/^[a-z0-9.-]+$/.test(item.id)||!/^scenes\/composition-sources\/[a-z0-9.-]+\.scene\.yml$/.test(item.source_path))
   throw Error("Unsafe source path");
  const card=document.createElement("article");card.className="room-card";card.dataset.roomId=item.id;
  const image=document.createElement("img");
  image.loading="lazy";image.decoding="async";image.src="./room-previews/"+item.id+".svg";
  image.alt="Top-down zone and explicit-anchor diagnostic of "+item.id+"; no reconstructed object geometry";
  const content=document.createElement("div");content.className="copy";
  const h=document.createElement("h2");h.textContent=item.id.replaceAll("-"," ");
  const p=document.createElement("p");p.className="room-meta";
  p.textContent=item.zones+" authored zones · "+item.explicit_anchors+" explicit anchors · "+item.inherited_positions+
     " parent-relative positions · "+item.unresolved_alias_placements+" unresolved asset placements";
  const link=document.createElement("a");
  link.textContent="Inspect exact source scene";link.href="https://github.com/sguzman/sceneology/blob/main/"+item.source_path;
  link.target="_blank";link.rel="noopener noreferrer";
  content.append(h,p,link);card.append(image,content);return card;
 });
 holder.replaceChildren(...cards);
 count.textContent=data.scenes.length+" accepted-source compositions ready for spatial inspection; zero newly rendered exhibitions";
}catch(error){count.textContent="Unable to load room reconstruction diagnostics";console.error("Sceneology rooms:",error);}
