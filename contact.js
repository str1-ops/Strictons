const header=document.querySelector('#siteHeader');const openBtn=document.querySelector('#menuOpen');const closeBtn=document.querySelector('#menuClose');const overlay=document.querySelector('#menuOverlay');function setHeader(){header.classList.toggle('scrolled',scrollY>1)}addEventListener('scroll',setHeader,{passive:true});setHeader();function menu(open){
  if(open){
    overlay.classList.remove('closing');
    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden','false');
    openBtn.setAttribute('aria-expanded','true');
    document.body.classList.add('menu-open');
  }else if(overlay.classList.contains('open')){
    overlay.classList.remove('open');
    overlay.classList.add('closing');
    overlay.setAttribute('aria-hidden','true');
    openBtn.setAttribute('aria-expanded','false');
    setTimeout(()=>{
      overlay.classList.remove('closing');
      document.body.classList.remove('menu-open');
    },300);
  }
}openBtn.addEventListener('click',()=>menu(!overlay.classList.contains('open')));if(closeBtn)closeBtn.addEventListener('click',()=>menu(false));overlay.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>menu(false)));addEventListener('keydown',e=>{if(e.key==='Escape')menu(false)});const reel=document.querySelector('#reel');let x=0,last=performance.now();function animate(now){const dt=Math.min(40,now-last);last=now;x-=dt*.018;const first=reel.firstElementChild;if(first&&-x>first.offsetWidth+24){x+=first.offsetWidth+24;reel.appendChild(first)}reel.style.transform=`translate3d(${x}px,0,0)`;requestAnimationFrame(animate)}requestAnimationFrame(animate);
const STRICtons_CAL_LINK = "";
if (STRICtons_CAL_LINK) {
  const placeholder = document.querySelector('#strictons-cal');
  placeholder.classList.remove('cal-placeholder');
  placeholder.innerHTML = '';
  const script = document.createElement('script');
  script.src = 'https://app.cal.com/embed/embed.js';
  script.async = true;
  script.onload = () => {
    if (window.Cal) {
      window.Cal('init', {origin:'https://cal.com'});
      window.Cal('inline', {elementOrSelector:'#strictons-cal', calLink:STRICtons_CAL_LINK, layout:'month_view'});
      window.Cal('ui', {hideEventTypeDetails:false, layout:'month_view'});
    }
  };
  document.head.appendChild(script);
}
