import {chromium} from 'playwright';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const c=await b.newContext({viewport:{width:390,height:844}});const p=await c.newPage();
await p.route('**/animejs/**',r=>r.fulfill({path:'/home/claude/landed/node_modules/animejs/lib/anime.min.js',contentType:'text/javascript'}));await p.route('**/pdf.js/**',r=>r.abort());
await p.goto('file:///home/claude/landed/dist/landed.html');await p.waitForTimeout(1500);
await p.evaluate(()=>document.querySelectorAll('.rv,.tile').forEach(e=>e.classList.add('in')));
console.log(await p.evaluate(()=>{const w=document.documentElement.clientWidth;const out=[];document.querySelectorAll('body *').forEach(e=>{const r=e.getBoundingClientRect();if(r.right>w+1&&r.width>0){let a=e.parentElement,clip=false;while(a&&a!==document.documentElement){const o=getComputedStyle(a).overflowX;if(o!=='visible'){clip=true;break}a=a.parentElement}if(!clip)out.push(e.tagName+'.'+(e.className.baseVal??e.className)+'#'+e.id+' '+Math.round(r.right))}});return [document.documentElement.scrollWidth,out.slice(0,10)]}));
await b.close();
