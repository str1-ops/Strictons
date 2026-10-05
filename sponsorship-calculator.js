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

const ids=[
  'sponsorshipFee','dailyCheckins','guideUseRate','sectionReachRate',
  'conversionRate','averageSpend','grossMargin'
];
const inputs=Object.fromEntries(ids.map(id=>[id,document.getElementById(id)]));

const outputIds=[
  'annualCheckins','monthlyCost','costPerCheckin','funnelCheckins','funnelGuideUsers',
  'funnelSectionReach','funnelCustomers','breakEvenCustomers','breakEvenPace',
  'grossProfitPerCustomer','breakEvenMonthly','requiredConversion','modelCustomers',
  'modelRevenue','modelGrossProfit','customerAcquisitionCost','estimatedNetReturn','returnMultiple'
];
const outputs=Object.fromEntries(outputIds.map(id=>[id,document.getElementById(id)]));

const numberFmt=new Intl.NumberFormat('en-AU',{maximumFractionDigits:0});
const decimalFmt=new Intl.NumberFormat('en-AU',{minimumFractionDigits:1,maximumFractionDigits:1});
const currencyFmt=new Intl.NumberFormat('en-AU',{style:'currency',currency:'AUD',maximumFractionDigits:0});
const currency2Fmt=new Intl.NumberFormat('en-AU',{style:'currency',currency:'AUD',minimumFractionDigits:2,maximumFractionDigits:2});

function num(input){return Math.max(0,Number(input?.value)||0)}
function pct(input){return Math.min(100,num(input))/100}
function set(id,value){if(outputs[id])outputs[id].textContent=value}
function money(value){return Number.isFinite(value)?currencyFmt.format(value):'—'}
function ratioMoney(value){return Number.isFinite(value)?currency2Fmt.format(value):'—'}
function int(value){return Number.isFinite(value)?numberFmt.format(Math.round(value)):'—'}
function percent(value){return Number.isFinite(value)?decimalFmt.format(value*100)+'%':'—'}

function update(){
  const fee=num(inputs.sponsorshipFee);
  const daily=num(inputs.dailyCheckins);
  const guideUse=pct(inputs.guideUseRate);
  const sectionReach=pct(inputs.sectionReachRate);
  const conversion=pct(inputs.conversionRate);
  const averageSpend=num(inputs.averageSpend);
  const grossMargin=pct(inputs.grossMargin);

  const annualCheckins=daily*365;
  const monthlyCost=fee/12;
  const costPerCheckin=annualCheckins>0?fee/annualCheckins:NaN;

  const guideUsers=annualCheckins*guideUse;
  const localFindsAudience=guideUsers*sectionReach;
  const referredCustomers=localFindsAudience*conversion;

  const customerRevenue=referredCustomers*averageSpend;
  const grossProfitPerCustomer=averageSpend*grossMargin;
  const grossProfitGenerated=referredCustomers*grossProfitPerCustomer;
  const customerAcquisitionCost=referredCustomers>0?fee/referredCustomers:NaN;
  const netReturn=grossProfitGenerated-fee;
  const returnMultiple=fee>0?grossProfitGenerated/fee:NaN;

  const breakEvenCustomers=grossProfitPerCustomer>0?fee/grossProfitPerCustomer:NaN;
  const breakEvenMonthly=Number.isFinite(breakEvenCustomers)?breakEvenCustomers/12:NaN;
  const requiredConversion=localFindsAudience>0&&Number.isFinite(breakEvenCustomers)?breakEvenCustomers/localFindsAudience:NaN;
  const breakEvenDays=Number.isFinite(breakEvenCustomers)&&breakEvenCustomers>0?365/breakEvenCustomers:NaN;

  set('annualCheckins',int(annualCheckins));
  set('monthlyCost',money(monthlyCost));
  set('costPerCheckin',annualCheckins>0?ratioMoney(costPerCheckin):'—');

  set('funnelCheckins',int(annualCheckins));
  set('funnelGuideUsers',int(guideUsers));
  set('funnelSectionReach',int(localFindsAudience));
  set('funnelCustomers',int(referredCustomers));

  set('grossProfitPerCustomer',grossProfitPerCustomer>0?money(grossProfitPerCustomer):'—');
  set('breakEvenCustomers',Number.isFinite(breakEvenCustomers)?decimalFmt.format(breakEvenCustomers):'—');
  set('breakEvenMonthly',Number.isFinite(breakEvenMonthly)?decimalFmt.format(breakEvenMonthly):'—');
  set('requiredConversion',Number.isFinite(requiredConversion)?percent(requiredConversion):'—');

  if(Number.isFinite(breakEvenDays)){
    set('breakEvenPace','Equivalent to about one incremental customer every '+decimalFmt.format(breakEvenDays)+' days.');
  }else{
    set('breakEvenPace','Enter average spend and gross margin to calculate.');
  }

  set('modelCustomers',int(referredCustomers));
  set('modelRevenue',money(customerRevenue));
  set('modelGrossProfit',money(grossProfitGenerated));
  set('customerAcquisitionCost',referredCustomers>0?money(customerAcquisitionCost):'—');
  set('estimatedNetReturn',money(netReturn));
  set('returnMultiple',Number.isFinite(returnMultiple)?decimalFmt.format(returnMultiple)+'×':'—');
}

Object.values(inputs).forEach(input=>input?.addEventListener('input',update));
document.getElementById('resetCalculator')?.addEventListener('click',()=>{
  Object.values(inputs).forEach(input=>{if(input)input.value='0'});
  update();
});
document.getElementById('printCalculator')?.addEventListener('click',()=>window.print());
update();
