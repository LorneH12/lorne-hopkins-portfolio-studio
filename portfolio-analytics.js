/* Consent-gated portfolio analytics. No network request until opt-in. */
(()=>{'use strict';
const config=document.querySelector('script[data-portfolio]');
const project=config?.dataset.clarityProject||'', portfolio=config?.dataset.portfolio;
if(!portfolio)return;
const key='lh-portfolio-analytics-v1', restricted=navigator.globalPrivacyControl===true||navigator.doNotTrack==='1';
let active=false, started=false, lastActivity=Date.now(), seconds=0;
const sent=new Set();
const saved=()=>{try{const p=JSON.parse(localStorage.getItem(key));return p&&Date.now()-p.at<15552000000?p.choice:null;}catch{return null;}};
const store=choice=>{try{localStorage.setItem(key,JSON.stringify({choice,at:Date.now()}));}catch{}};
const event=name=>{if(active)window.clarity('event',name);};
const once=name=>{if(active&&!sent.has(name)){sent.add(name);event(name);}};
const tag=(k,v)=>{if(active)window.clarity('set',k,v);};
const settings=document.createElement('button');settings.type='button';settings.className='privacy-settings';settings.textContent='Privacy choices';
(document.querySelector('footer')||document.body).append(settings);
const dialog=document.createElement('dialog');dialog.className='privacy-dialog';dialog.setAttribute('aria-labelledby','privacy-title');
dialog.innerHTML='<h2 id="privacy-title">Your privacy choices</h2><p>Allow optional Microsoft Clarity analytics to help improve this portfolio? With permission, Microsoft receives page views, clicks, scrolling, device information and session replays. Input fields are masked. Advertising storage stays off.</p><p>You can decline and use every feature. Change your choice here at any time.</p><p><a href="privacy.html">Read the privacy notice</a></p><p class="privacy-status" role="status"></p><div class="privacy-actions"><button type="button" data-choice="denied">Decline analytics</button><button type="button" data-choice="granted">Allow analytics</button></div><button type="button" data-close>Close</button>';
document.body.append(dialog);
function open(){dialog.querySelector('.privacy-status').textContent=restricted?'Your browser privacy signal is respected; analytics is disabled.':!project?'Analytics is not active yet.':`Current choice: ${saved()||'not selected'}.`;dialog.querySelector('[data-choice="granted"]').disabled=restricted||!project;dialog.showModal();}
settings.onclick=open;dialog.querySelector('[data-close]').onclick=()=>dialog.close();
function start(){
 if(started||restricted||!project||saved()!=='granted')return;
 started=active=true;
 document.querySelectorAll('input,textarea,[contenteditable],form,#player-frame').forEach(e=>e.setAttribute('data-clarity-mask','true'));
 window.clarity=window.clarity||function(){(window.clarity.q=window.clarity.q||[]).push(arguments);};
 window.clarity('consentv2',{ad_Storage:'denied',analytics_Storage:'granted'});
 tag('portfolio',portfolio);tag('release','analytics-v1');
 // Only allow known campaign categories. Never send names, email addresses or recipient IDs.
 const params=new URLSearchParams(location.search);
 const sources=['linkedin','resume','email','application'];const campaigns=['general','asu','srp','glendale','ies'];
 if(sources.includes(params.get('utm_source')))tag('source',params.get('utm_source'));
 if(campaigns.includes(params.get('utm_campaign')))tag('campaign',params.get('utm_campaign'));
 const script=document.createElement('script');script.async=true;script.src='https://www.clarity.ms/tag/'+project;document.head.append(script);
 event('portfolio_visit');
}
dialog.querySelectorAll('[data-choice]').forEach(b=>b.onclick=()=>{
 const choice=b.dataset.choice;store(choice);dialog.close();
 if(choice==='granted'){start();return;}
 if(started){active=false;window.clarity('consentv2',{ad_Storage:'denied',analytics_Storage:'denied'});location.reload();}
});
window.addEventListener('storage',e=>{if(e.key===key){if(saved()!=='granted'&&started)location.reload();else start();}});
const course=()=>document.querySelector('.course-tabs [aria-selected="true"]')?.id.replace('course-tab-','')||'unknown';
document.addEventListener('click',e=>{
 lastActivity=Date.now();if(!active)return;
 const el=e.target.closest('a,button');if(!el)return;
 if(el.closest('.privacy-dialog')||el===settings)return;
 const href=el.getAttribute('href')||'';
 if(/\.pdf(?:$|[?#])/i.test(href)){
  const type=/resume/i.test(href)?'resume':/cover/i.test(href)?'cover_letter':'document';
  event(type+(el.hasAttribute('download')?'_download_click':'_view_click'));tag('document_interest',type);
 }
 if(href.startsWith('mailto:'))event('email_contact_click');
 if(href.includes('linkedin.com'))event('linkedin_contact_click');
 if(el.matches('.course-tabs button')){tag('course',course());event('training_select');}
 if(el.matches('[data-play]')){tag('course',course());event('course_launch');}
 if(href.includes('/course-')){tag('course',course());event('course_external_open');}
 if(el.matches('[data-still]'))event('training_'+el.dataset.still+'_preview');
 if(el.matches('button[data-view="story"]'))event('training_star_open');
 if(el.matches('#work [role="tab"]')){tag('project',el.dataset.panel);event('project_select');}
});
document.querySelector('#course-select')?.addEventListener('change',()=>{tag('course',course());event('training_select');});
document.querySelectorAll('details').forEach((el,i)=>el.addEventListener('toggle',()=>{if(el.open){tag('project','case_'+(i+1));event('project_expand');}}));
['pointerdown','keydown','scroll','touchstart'].forEach(type=>addEventListener(type,()=>{lastActivity=Date.now();},{passive:true}));
setInterval(()=>{
 if(!active||document.hidden||Date.now()-lastActivity>30000)return;
 seconds+=5;
 [30,60,120].forEach(n=>{if(seconds>=n)once('engaged_'+n+'s');});
 const sections=[...document.querySelectorAll('section[id]')];
 sections.forEach(el=>{const r=el.getBoundingClientRect();if(Math.min(r.bottom,innerHeight)-Math.max(r.top,0)>Math.min(r.height,innerHeight)*.5)once('section_'+el.id+'_view');});
},5000);
// Loading only after explicit consent also excludes prior interactions from collection.
if(saved()==='granted')start();
if(project&&!saved()&&!restricted)open();
})();
