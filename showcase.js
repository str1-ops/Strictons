import * as pdfjsLib from "https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.min.mjs";
pdfjsLib.GlobalWorkerOptions.workerSrc="https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.worker.min.mjs";

const spreads=[[1],[2,3],[4,5],[6,7],[8,9],[10,11],[12,13],[14,15],[16]];
const cache=new Map();
let pdf,index=0,busy=false;
const spread=document.querySelector("#bookSpread"),left=document.querySelector("#leftPage"),right=document.querySelector("#rightPage"),loading=document.querySelector("#bookLoading"),prev=document.querySelector("#prevPage"),next=document.querySelector("#nextPage");

function scaleFor(page,count){const v=page.getViewport({scale:1});return Math.min(Math.min(innerHeight*.62,640)/v.height,(Math.min(innerWidth*.72,980)/count)/v.width)}
async function renderPage(n,count){
 const key=n+"@"+count+"@"+Math.round(devicePixelRatio||1);
 if(cache.has(key))return cache.get(key);
 const p=(async()=>{const page=await pdf.getPage(n),vp=page.getViewport({scale:scaleFor(page,count)}),dpr=Math.min(devicePixelRatio||1,2),c=document.createElement("canvas");c.width=Math.round(vp.width*dpr);c.height=Math.round(vp.height*dpr);c.style.width=vp.width+"px";c.style.height=vp.height+"px";await page.render({canvasContext:c.getContext("2d"),viewport:vp,transform:dpr===1?null:[dpr,0,0,dpr,0,0]}).promise;return c})();cache.set(key,p);return p;
}
async function prepare(i){const pages=spreads[i];if(!pages)return null;const rendered=await Promise.all(pages.map(n=>renderPage(n,pages.length)));return {pages,rendered}}
function copy(source,target){target.width=source.width;target.height=source.height;target.style.width=source.style.width;target.style.height=source.style.height;target.getContext("2d").drawImage(source,0,0)}
async function show(i){
 if(!pdf||busy||i<0||i>=spreads.length||i===index)return;
 busy=true;
 try{
   const ready=await prepare(i); // current spread stays fully visible while next is prepared
   const single=ready.pages.length===1;
   spread.classList.toggle("single",single);
   if(single){copy(ready.rendered[0],right);left.width=left.height=0}
   else{copy(ready.rendered[0],left);copy(ready.rendered[1],right)}
   index=i;prev.disabled=index===0;next.disabled=index===spreads.length-1;
   [index-1,index+1,index+2].filter(x=>x>=0&&x<spreads.length).forEach(x=>prepare(x).catch(()=>{}));
 }finally{busy=false}
}
async function init(){
 try{
  pdf=await pdfjsLib.getDocument({url:"/Beachcomber.pdf",disableAutoFetch:false,disableStream:false,disableRange:false}).promise;
  const first=await prepare(0);copy(first.rendered[0],right);spread.classList.add("single");prev.disabled=true;next.disabled=false;loading.classList.add("hidden");
  // Warm the first three openings immediately; then finish the rest during idle time.
  await Promise.all([prepare(1),prepare(2),prepare(3)]);
  const warmRest=()=>Promise.all(spreads.slice(4).map((_,k)=>prepare(k+4))).catch(()=>{});
  "requestIdleCallback" in window?requestIdleCallback(warmRest,{timeout:1800}):setTimeout(warmRest,200);
 }catch(e){console.error(e);loading.classList.add("hidden")}
}
prev.onclick=()=>show(index-1);next.onclick=()=>show(index+1);
spread.onclick=e=>show(index+(e.clientX<spread.getBoundingClientRect().left+spread.clientWidth/2?-1:1));
addEventListener("keydown",e=>{if(e.key==="ArrowLeft")show(index-1);if(e.key==="ArrowRight")show(index+1)});
init();

const header=document.querySelector("#siteHeader"),openBtn=document.querySelector("#menuOpen"),overlay=document.querySelector("#menuOverlay");function setHeader(){header.classList.toggle("scrolled",scrollY>1)}addEventListener("scroll",setHeader,{passive:true});setHeader();function menu(open){if(open){overlay.classList.remove("closing");overlay.classList.add("open");overlay.setAttribute("aria-hidden","false");openBtn.setAttribute("aria-expanded","true");document.body.classList.add("menu-open")}else if(overlay.classList.contains("open")){overlay.classList.remove("open");overlay.classList.add("closing");overlay.setAttribute("aria-hidden","true");openBtn.setAttribute("aria-expanded","false");setTimeout(()=>{overlay.classList.remove("closing");document.body.classList.remove("menu-open")},300)}}openBtn.addEventListener("click",()=>menu(!overlay.classList.contains("open")));overlay.querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>menu(false)));document.querySelector(".site-header .wordmark")?.addEventListener("click",()=>menu(false));addEventListener("keydown",e=>{if(e.key==="Escape")menu(false)});