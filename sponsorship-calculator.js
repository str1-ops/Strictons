const header=document.querySelector('#siteHeader');
const openBtn=document.querySelector('#menuOpen');
const overlay=document.querySelector('#menuOverlay');

function setHeader(){header?.classList.toggle('scrolled',scrollY>1)}
addEventListener('scroll',setHeader,{passive:true});
setHeader();

function menu(open){
  if(!overlay||!openBtn)return;
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
}
openBtn?.addEventListener('click',()=>menu(!overlay.classList.contains('open')));
overlay?.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>menu(false)));
document.querySelector('.site-header .wordmark')?.addEventListener('click',()=>menu(false));
addEventListener('keydown',e=>{if(e.key==='Escape')menu(false)});

const sponsorshipFee=document.getElementById('sponsorshipFee');
const dailyCheckins=document.getElementById('dailyCheckins');
const guestsPerCheckin=document.getElementById('guestsPerCheckin');
const conversionSlider=document.getElementById('conversionSlider');

const annualGuests=document.getElementById('annualGuests');
const dailyCost=document.getElementById('dailyCost');
const costPerGuest=document.getElementById('costPerGuest');
const conversionDisplay=document.getElementById('conversionDisplay');
const doorCustomers=document.getElementById('doorCustomers');
const monthlyDoorCustomers=document.getElementById('monthlyDoorCustomers');

const numberFmt=new Intl.NumberFormat('en-AU',{maximumFractionDigits:0});
const decimalFmt=new Intl.NumberFormat('en-AU',{minimumFractionDigits:1,maximumFractionDigits:1});
const currency2Fmt=new Intl.NumberFormat('en-AU',{style:'currency',currency:'AUD',minimumFractionDigits:2,maximumFractionDigits:2});

function num(input){return Math.max(0,Number(input?.value)||0)}
function formatPercent(value){return value.toFixed(2)+'%'}

function update(){
  const fee=num(sponsorshipFee);
  const checkins=num(dailyCheckins);
  const guests=num(guestsPerCheckin);
  const conversion=Math.min(2.5,Math.max(0,Number(conversionSlider?.value)||0));

  const annualGuestCount=checkins*guests*365;
  const dailySponsorship=fee/365;
  const perGuest=annualGuestCount>0?fee/annualGuestCount:NaN;
  const convertedCustomers=annualGuestCount*(conversion/100);
  const monthlyCustomers=convertedCustomers/12;

  annualGuests.textContent=numberFmt.format(Math.round(annualGuestCount));
  dailyCost.textContent=currency2Fmt.format(dailySponsorship);
  costPerGuest.textContent=Number.isFinite(perGuest)?currency2Fmt.format(perGuest):'—';
  conversionDisplay.textContent=formatPercent(conversion);
  doorCustomers.textContent=numberFmt.format(Math.round(convertedCustomers));
  monthlyDoorCustomers.textContent=decimalFmt.format(monthlyCustomers);

  const progress=(conversion/2.5)*100;
  conversionSlider?.style.setProperty('--slider-progress',progress+'%');
}

[sponsorshipFee,dailyCheckins,guestsPerCheckin,conversionSlider].forEach(input=>input?.addEventListener('input',update));

document.getElementById('resetCalculator')?.addEventListener('click',()=>{
  if(sponsorshipFee)sponsorshipFee.value='0';
  if(dailyCheckins)dailyCheckins.value='0';
  if(guestsPerCheckin)guestsPerCheckin.value='0';
  if(conversionSlider)conversionSlider.value='0';
  update();
});

document.getElementById('printCalculator')?.addEventListener('click',()=>window.print());
update();
