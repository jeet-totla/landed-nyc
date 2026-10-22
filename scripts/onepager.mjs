import {chromium} from 'playwright';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});const p=await b.newPage();
await p.goto('file:///home/claude/landed/onepager/page.html');
console.log(await p.evaluate(()=>({sh:document.body.scrollHeight,ch:document.body.clientHeight,slack:document.querySelector('.foot').getBoundingClientRect().top-document.querySelector('.wide').getBoundingClientRect().bottom,page:11*96})));
await p.pdf({path:'/home/claude/landed/onepager/Landed-one-pager.pdf',format:'Letter',printBackground:true,margin:{top:0,right:0,bottom:0,left:0}});
await b.close();
