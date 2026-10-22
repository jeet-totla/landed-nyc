import {chromium} from 'playwright';
const S='/tmp/claude-0/-home-claude/903b9957-5556-526c-92f0-eacdf88104f3/scratchpad/mob/';
import fs from 'fs';fs.mkdirSync(S,{recursive:true});
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const c=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true});const p=await c.newPage();
await p.route('**/animejs/**',r=>r.fulfill({path:'node_modules/animejs/lib/anime.min.js',contentType:'text/javascript'}));await p.route('**/pdf.js/**',r=>r.abort());
await p.goto('file:///home/claude/landed/index.html');await p.waitForTimeout(3500);
await p.screenshot({path:S+'0hero.png'});
await p.evaluate(()=>document.querySelectorAll('.rv,.tile').forEach(e=>e.classList.add('in')));
for(const id of ['problem','lines','tool','how']){await p.locator('#'+id).screenshot({path:S+id+'.png'});}
console.log('overflow',await p.evaluate(()=>{const w=innerWidth;return [...document.querySelectorAll('body *')].filter(e=>{const r=e.getBoundingClientRect();return r.right>w+1&&r.width>0&&getComputedStyle(e).position!=='fixed'}).slice(0,12).map(e=>e.tagName+'.'+e.className+' '+Math.round(e.getBoundingClientRect().right))}));
await b.close();
