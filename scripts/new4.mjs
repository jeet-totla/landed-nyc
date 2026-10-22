import {chromium} from 'playwright';
const S='/tmp/claude-0/-home-claude/903b9957-5556-526c-92f0-eacdf88104f3/scratchpad/';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});const errs=[];
async function mk(w,h,t){const c=await b.newContext({viewport:{width:w,height:h},colorScheme:t||'light'});const p=await c.newPage();p.on('pageerror',e=>errs.push(e.message));
 await p.route('**/animejs/3.2.1/anime.min.js',r=>r.fulfill({path:'node_modules/animejs/lib/anime.min.js',contentType:'text/javascript'}));
 await p.route('**/pdf.js/**',r=>r.abort());await p.goto('file:///home/claude/landed/dist/landed.html');return p;}
const p=await mk(1360,900);await p.evaluate(()=>document.querySelectorAll('.rv,.tile').forEach(e=>e.classList.add('in')));
await p.locator('.t-map').screenshot({path:S+'map.png'});
await p.click('[data-tab=heat]');await p.click('#hrun');await p.locator('#p-heat').screenshot({path:S+'heat.png'});
console.log('heat:',await p.locator('#hout .vb').innerText(),'|',await p.locator('#hl').innerText());
await p.click('[data-tab=stab]');await p.click('#srun');await p.click('#mkrh');await p.locator('#p-stab').screenshot({path:S+'stab.png'});
console.log('stab:',await p.locator('#sout .vb').innerText());
await p.click('#tor');console.log('renewal type:',await p.inputValue('#r-type'),await p.locator('#p-renewal').isVisible());
await p.click('[data-tab=log]');await p.selectOption('#g-rooms select >> nth=3','Issue');await p.fill('[data-n="1-0"]','Crack in wall');await p.selectOption('#g-rooms select >> nth=0','OK');await p.click('#grun');
await p.locator('#p-log').screenshot({path:S+'log.png'});console.log('log:',await p.locator('#gout .vb').innerText());
await p.click('#g-dep');console.log('deposit visible',await p.locator('#p-deposit').isVisible());
const m=await mk(390,844);await m.evaluate(()=>document.querySelectorAll('.rv,.tile').forEach(e=>e.classList.add('in')));
await m.locator('.t-map').screenshot({path:S+'m-map.png'});console.log('hscroll',await m.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1));
console.log('errs',errs);await b.close();
