import {chromium} from 'playwright';
const S='/tmp/claude-0/-home-claude/903b9957-5556-526c-92f0-eacdf88104f3/scratchpad/';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const errs=[];
async function mk(w,h,theme){const ctx=await b.newContext({viewport:{width:w,height:h},colorScheme:theme||'light'});const p=await ctx.newPage();
 p.on('pageerror',e=>errs.push(w+': '+e.message));
 await p.route('**/animejs/3.2.1/anime.min.js',r=>r.fulfill({path:'node_modules/animejs/lib/anime.min.js',contentType:'text/javascript'}));
 await p.route('**/pdf.js/3.11.174/pdf.min.js',r=>r.fulfill({path:'node_modules/pdfjs-dist/build/pdf.min.js',contentType:'text/javascript'}));
 await p.route('**/pdf.js/3.11.174/pdf.worker.min.js',r=>r.fulfill({path:'node_modules/pdfjs-dist/build/pdf.worker.min.js',contentType:'text/javascript'}));
 await p.goto('file:///home/claude/landed/dist/landed.html');return p;}
const p=await mk(1360,900);await p.waitForTimeout(4200);
await p.screenshot({path:S+'v2-hero.png'});
await p.evaluate(()=>document.querySelectorAll('.rv,.tile').forEach(e=>e.classList.add('in')));
for(const [id,name] of [['problem','problem'],['lines','lines'],['tool','tool'],['how','how']]){
  await p.locator('#'+id).scrollIntoViewIfNeeded();await p.waitForTimeout(500);
  const el=p.locator('#'+id);await el.screenshot({path:S+'v2-'+name+'.png'});}
// exercise every tool
await p.click('[data-demo=d1]');await p.waitForTimeout(300);
await p.click('[data-tab=movein]');await p.click('#mrun');
await p.click('[data-tab=passport]');await p.click('#pprun');
await p.click('[data-tab=renewal]');await p.click('#rrun');
await p.click('[data-tab=fees]');await p.click('#fdemo');await p.click('#mkc');
await p.click('[data-tab=deposit]');await p.click('#drun');
await p.click('[data-tab=vet]');await p.click('#vrun');
await p.waitForTimeout(500);
console.log('fees out:',(await p.locator('#fout .vb').innerText()),'| deposit:',(await p.locator('#dout .big2').innerText()),'| mout:',(await p.locator('#mout .vb').innerText()),'| pp:',(await p.locator('#ppout .vb').innerText()));
await p.click('[data-tab=movein]');await p.locator('#p-movein').screenshot({path:S+'v2-movein.png'});
await p.click('[data-tab=deposit]');await p.locator('#p-deposit').screenshot({path:S+'v2-deposit.png'});
// pdf upload: generate a text PDF with chromium
const pg=await (await b.newContext()).newPage();
await pg.setContent('<body style="font:16px sans-serif"><h2>Lease Rider</h2><p>The monthly rent is $2,850 per month.</p><p>Security deposit equal to two months rent, $5,700.</p><p>Tenant shall pay a move-in fee of $750.</p></body>');
await pg.pdf({path:S+'test-lease.pdf'});
await p.click('[data-tab=checker]');await p.setInputFiles('#file',S+'test-lease.pdf');await p.waitForTimeout(2500);
console.log('pdf status:',await p.locator('#fileStatus').innerText(),'| flags:',await p.locator('#out .flag').count());
// mobile
const m=await mk(390,844);await m.waitForTimeout(3500);await m.screenshot({path:S+'v2-m-hero.png'});
await m.evaluate(()=>document.querySelectorAll('.rv,.tile').forEach(e=>e.classList.add('in')));
await m.locator('#problem').screenshot({path:S+'v2-m-problem.png'});
const ov=await m.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);console.log('mobile h-scroll:',ov);
const d=await mk(1360,900,'dark');await d.waitForTimeout(3500);await d.screenshot({path:S+'v2-dark.png'});
console.log(errs.join('\n')||'no page errors');await b.close();
