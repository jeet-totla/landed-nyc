import {chromium} from 'playwright';
const S='/tmp/claude-0/-home-claude/903b9957-5556-526c-92f0-eacdf88104f3/scratchpad/';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});const errs=[];
const p=await (await b.newContext({viewport:{width:1360,height:900}})).newPage();p.on('pageerror',e=>errs.push(e.message));
await p.route('**/animejs/**',r=>r.fulfill({path:'node_modules/animejs/lib/anime.min.js',contentType:'text/javascript'}));await p.route('**/pdf.js/**',r=>r.abort());
await p.goto('file:///home/claude/landed/index.html');await p.waitForTimeout(800);
await p.locator('.t-line').scrollIntoViewIfNeeded();await p.waitForTimeout(500);await p.locator('.t-line').screenshot({path:S+'m1.png'});
await p.waitForTimeout(3500);await p.locator('.t-line').screenshot({path:S+'m2.png'});
for(const c of ['t-fun','t-ren','t-rent','t-stu','t-map','t-stack']){await p.locator('.'+c).scrollIntoViewIfNeeded();await p.waitForTimeout(3300);}
const txt=await p.evaluate(()=>['.t-fun .hbar b','.t-ren .col b','.t-rent .k','.t-rent .hbar b','.t-stu svg text','.t-map .bn','.t-stack .tot'].map(s=>[...document.querySelectorAll(s)].map(e=>e.textContent).join('|')));
console.log(txt,errs);
await p.locator('.t-stu').screenshot({path:S+'m3.png'});await p.locator('.t-map').screenshot({path:S+'m4.png'});
await b.close();
