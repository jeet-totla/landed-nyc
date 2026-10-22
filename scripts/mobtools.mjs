import {chromium} from 'playwright';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const c=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true});const p=await c.newPage();
await p.route('**/animejs/**',r=>r.fulfill({path:'node_modules/animejs/lib/anime.min.js',contentType:'text/javascript'}));await p.route('**/pdf.js/**',r=>r.abort());
await p.goto('file:///home/claude/landed/index.html');await p.waitForTimeout(1500);
const sw=async n=>console.log(n,await p.evaluate(()=>document.documentElement.scrollWidth));
await p.click('[data-demo=d1]');await sw('checker');
for(const [t,btn] of [['movein','#mrun'],['passport','#pprun'],['renewal','#rrun'],['fees','#frun'],['deposit','#drun'],['heat','#hrun'],['stab','#srun'],['log','#grun']]){
 await p.evaluate(t=>document.querySelector('[data-tab='+t+']').click(),t);if(t==='fees')await p.click('#fdemo');await p.click(btn);await p.waitForTimeout(300);await sw(t);}
await p.evaluate(()=>document.querySelector('[data-tab=heat]').click());await p.click('#hrun');
await p.locator('#p-heat').screenshot({path:'/tmp/claude-0/-home-claude/903b9957-5556-526c-92f0-eacdf88104f3/scratchpad/mob/heat.png'});
await b.close();
