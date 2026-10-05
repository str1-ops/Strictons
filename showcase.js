import * as pdfjsLib from "https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.min.mjs";
pdfjsLib.GlobalWorkerOptions.workerSrc="https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.worker.min.mjs";

const spreads=[[1],[2,3],[4,5],[6,7],[8,9],[10,11],[12,13],[14,15],[16]];
let pdf,index=0,renderTasks=[];
const spread=document.querySelector("#bookSpread");
const left=document.querySelector("#leftPage");
const right=document.querySelector("#rightPage");
const loading=document.querySelector("#bookLoading");
const prev=document.querySelector("#prevPage");
const next=document.querySelector("#nextPage");

function fitScale(page, pagesInSpread){
  const base=page.getViewport({scale:1});
  const maxH=Math.min(innerHeight*.62,640);
  const maxW=Math.min(innerWidth*.72,980)/pagesInSpread;
  return Math.min(maxH/base.height,maxW/base.width);
}
async function paint(pageNo,canvas,pagesInSpread){
  const page=await pdf.getPage(pageNo);
  const scale=fitScale(page,pagesInSpread);
  const viewport=page.getViewport({scale});
  const dpr=Math.min(devicePixelRatio||1,2);
  canvas.width=Math.round(viewport.width*dpr);
  canvas.height=Math.round(viewport.height*dpr);
  canvas.style.width=viewport.width+"px";
  canvas.style.height=viewport.height+"px";
  const task=page.render({canvasContext:canvas.getContext("2d"),viewport,transform:dpr===1?null:[dpr,0,0,dpr,0,0]});
  renderTasks.push(task);
  await task.promise;
}
async function show(i){
  if(!pdf)return;
  index=Math.max(0,Math.min(spreads.length-1,i));
  renderTasks.forEach(t=>{try{t.cancel()}catch{}});
  renderTasks=[];
  loading.classList.remove("hidden");
  const pages=spreads[index];
  spread.classList.toggle("single",pages.length===1);
  try{
    if(pages.length===1){
      await paint(pages[0],right,1);
      left.width=left.height=0;
    }else{
      await Promise.all([paint(pages[0],left,2),paint(pages[1],right,2)]);
    }
    prev.disabled=index===0;
    next.disabled=index===spreads.length-1;
    const upcoming=spreads[index+1]||[];
    upcoming.forEach(n=>pdf.getPage(n).catch(()=>{}));
  }finally{loading.classList.add("hidden")}
}
async function init(){
  try{
    const task=pdfjsLib.getDocument({url:"/Beachcomber.pdf",disableAutoFetch:false,disableStream:false,disableRange:false});
    pdf=await task.promise;
    await show(0);
  }catch(e){
    console.error("Guide failed to load",e);
    loading.classList.add("hidden");
  }
}
prev.addEventListener("click",()=>show(index-1));
next.addEventListener("click",()=>show(index+1));
spread.addEventListener("click",e=>show(index+(e.clientX<spread.getBoundingClientRect().left+spread.clientWidth/2?-1:1)));
addEventListener("keydown",e=>{if(e.key==="ArrowLeft")show(index-1);if(e.key==="ArrowRight")show(index+1)});
let resizeTimer;addEventListener("resize",()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>pdf&&show(index),120)});
init();

const header=document.querySelector("#siteHeader"),openBtn=document.querySelector("#menuOpen"),overlay=document.querySelector("#menuOverlay");function setHeader(){header.classList.toggle("scrolled",scrollY>1)}addEventListener("scroll",setHeader,{passive:true});setHeader();function menu(open){if(open){overlay.classList.remove("closing");overlay.classList.add("open");overlay.setAttribute("aria-hidden","false");openBtn.setAttribute("aria-expanded","true");document.body.classList.add("menu-open")}else if(overlay.classList.contains("open")){overlay.classList.remove("open");overlay.classList.add("closing");overlay.setAttribute("aria-hidden","true");openBtn.setAttribute("aria-expanded","false");setTimeout(()=>{overlay.classList.remove("closing");document.body.classList.remove("menu-open")},300)}}openBtn.addEventListener("click",()=>menu(!overlay.classList.contains("open")));overlay.querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>menu(false)));document.querySelector(".site-header .wordmark")?.addEventListener("click",()=>menu(false));addEventListener("keydown",e=>{if(e.key==="Escape")menu(false)});