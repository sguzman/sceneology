const id=document.body.dataset.scene;
const approved=new Set(["block-chibi-living-room-v1","block-chibi-kitchen-v1","block-chibi-bathroom-v1","block-chibi-office-v1","block-chibi-backyard-v1","block-chibi-garage-v1","block-chibi-factory-v1"]);
if(!approved.has(id))throw Error("Unrecognized scene");
let factor=1;
const artwork=document.querySelector("#artwork");
const counter=document.querySelector("#zoom-value");
function redraw(){
 factor=Math.min(3,Math.max(.7,factor));
 artwork.style.transform="scale("+factor+")";
 counter.textContent=Math.round(factor*100)+"%";
}
document.querySelector("#zoom-in").addEventListener("click",()=>{factor+=.2;redraw()});
document.querySelector("#zoom-out").addEventListener("click",()=>{factor-=.2;redraw()});
document.querySelector("#zoom-reset").addEventListener("click",()=>{factor=1;redraw()});
const link=document.querySelector("#source-link");
link.href="https://github.com/sguzman/renderarium/tree/main/scenes/"+id;
redraw();
