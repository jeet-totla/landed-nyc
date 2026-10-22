/* ===== ENGINE START ===== */
const WORDNUM={one:1,two:2,three:3,four:4,five:5,six:6,1:1,2:2,3:3,4:4,5:5,6:6};
const SRC={
 fare:{label:'FARE Act rules · NYC DCWP',url:'https://www.nyc.gov/site/dca/about/FAQ-Broker-Fees.page'},
 gol:{label:'General Obligations Law §7-108',url:'https://www.nysenate.gov/legislation/laws/GOB/7-108'},
 rpl238:{label:'Real Property Law §238-a',url:'https://www.nysenate.gov/legislation/laws/RPP/238-A'},
 rpl235:{label:'Real Property Law §235-b',url:'https://www.nysenate.gov/legislation/laws/RPP/235-B'},
 rpl234:{label:'Real Property Law §234',url:'https://www.nysenate.gov/legislation/laws/RPP/234'},
 rpl226c:{label:'Real Property Law §226-c',url:'https://www.nysenate.gov/legislation/laws/RPP/226-C'},
 rpl214:{label:'Good Cause exemptions · RPL §214',url:'https://www.nysenate.gov/legislation/laws/RPP/214'},
 rpl216:{label:'Good Cause cap · RPL §216',url:'https://www.nysenate.gov/legislation/laws/RPP/216'},
 gcnotice:{label:'HPD Good Cause notice',url:'https://www.nyc.gov/assets/hpd/downloads/pdfs/services/good-cause-eviction-law-notice.pdf'},
 ag:{label:'NY Attorney General · tenant rights',url:'https://ag.ny.gov/consumer-frauds/tenants-rights'},
 ftc:{label:'FTC · rental listing scams',url:'https://consumer.ftc.gov/articles/rental-listing-scams'},
 dos:{label:'NYS licence lookup',url:'https://appext20.dos.ny.gov/lcns_public/lic_name_search_frm'},
 dhcr:{label:'NY HCR · rent regulation',url:'https://hcr.ny.gov/'}
};
const num=s=>parseFloat(String(s).replace(/,/g,''));
const usd=n=>'$'+Math.round(n).toLocaleString('en-US');
function segments(text){
  const out=[];let pos=0;
  text.split('\n').forEach(line=>{
    let off=0;
    line.split(/(?<=[.!?;,])\s+|\s+plus\s+|\s+\+\s+|\s+and\s+(?=an?\s)/i).forEach(p=>{
      const i=line.indexOf(p,off);
      if(p.trim()) out.push({start:pos+i,end:pos+i+p.length,text:p});
      off=i+p.length;
    });
    pos+=line.length+1;
  });
  return out;
}
const amt=s=>{const m=s.match(/\$\s?([\d,]+(?:\.\d{1,2})?)/);return m?num(m[1]):null;};
function detectRent(text,segs){
  let m=text.match(/\$\s?([\d,]{3,})(?:\.\d\d)?\s*(?:\/|per|a|each)\s*(?:mo\b|month)/i);
  if(m) return num(m[1]);
  for(const s of segs){ if(/\brent\b/i.test(s.text)&&!/deposit|late|fee|advance|annual|broker/i.test(s.text)){const a=amt(s.text); if(a&&a>=500) return a;} }
  return null;
}
function monthsIn(t){
  const m=t.match(/\b(one|two|three|four|five|six|1|2|3|4|5|6)\s*(?:\(\d\)\s*)?months?/i);
  return m?WORDNUM[m[1].toLowerCase()]:null;
}
function analyze(text,rentOverride){
  const segs=segments(text);
  const rent=rentOverride||detectRent(text,segs);
  const facts={rent,deposit:null,items:[]};
  const flags=[];
  const add=f=>flags.push(Object.assign({over:0},f));
  const lower=text.toLowerCase();
  for(const s of segs){
    const t=s.text, a=amt(t), at=[s.start,s.end];
    // --- scam signals
    const pay=/\b(wire|zelle|cash ?app|venmo|gift ?cards?|western union|bitcoin|crypto|money ?gram)\b/i.test(t);
    const away=/\b(overseas|out of (the )?(country|town|state)|abroad|missionary|deployed)\b/i.test(t);
    const keys=/(mail|ship|send|courier)\w*\s+(you\s+)?the\s+keys|keys\s+(will be\s+)?(mailed|shipped|sent)/i.test(t);
    const noView=/(before|without)\s+(you\s+)?(see|view|tour)ing|can'?t\s+(show|meet)|unable to show|no (viewings|showings)/i.test(t);
    if(pay||away||keys||noView){
      add({id:'scam',sev:'high',title:'Scam pattern: payment or access before you can verify',at,quote:t.trim(),
        over:(pay&&a)?a:0,
        why:'Untraceable payment methods, an owner who is "away", keys sent by mail and no viewing are the standard rental-scam script. Real landlords let you see the unit before you pay.',
        ask:'Do not send money. Ask to see the unit in person and to verify the owner on ACRIS and the broker on the DOS license lookup.',src:['ftc','dos']});
      continue;
    }
    // --- hidden listing / access fee
    if(/(listing|access|unlock|viewing|showing|tour|membership|registration|search)\s*(fee|charge|payment)|pay\s+(?:to|before)\s+(?:view|see|unlock)/i.test(t)){
      add({id:'access',sev:'high',title:'Fee to see or access a listing',at,quote:t.trim(),over:a||0,
        why:'Charging renters for access to a listing is the paywall pattern the FARE Act targets. When an agent works for the landlord, the landlord pays the agent, and no one can make a tenant pay to rent a place.',
        ask:'Ask who the agent works for and request the written fee disclosure the FARE Act requires before any lease. Do not pay for access.',src:['fare']});
      continue;
    }
    // --- broker fee
    if(/(broker|finder|commission|agent['’]?s?\s+fee)/i.test(t)&&/(fee|commission)/i.test(t)&&(/\$|%|month/i.test(t))){
      let cost=a||0, how='';
      const pct=t.match(/(\d+(?:\.\d+)?)\s*%/);
      if(!a&&pct&&rent){ const annual=/annual|year/i.test(t); cost=rent*(annual?12:1)*num(pct[1])/100; how=annual?' (15% of annual rent)'.replace('15',pct[1]):''; }
      const mo=monthsIn(t);
      if(!a&&!pct&&mo&&rent) cost=rent*mo;
      add({id:'broker',sev:'high',title:'Broker fee charged to the tenant',at,quote:t.trim(),over:cost,
        why:'Since June 11, 2025 the FARE Act bars a landlord-hired broker or agent from charging the tenant. Only a broker you hired yourself, who represents only you, can be paid by you.',
        ask:'Ask: "Who hired you? Please send the itemized fee disclosure the FARE Act requires." If the landlord hired them, the fee is theirs to pay.',src:['fare']});
      continue;
    }
    // --- security deposit
    if(/deposit/i.test(t)&&!/hold(ing)?\s+deposit/i.test(t)){
      let d=a, mo=monthsIn(t);
      if(!d&&mo&&rent) d=rent*mo;
      if(d){ facts.deposit=d; facts.items.push(['Security deposit',d]); }
      if(d&&rent&&d>rent*1.001){
        add({id:'deposit',sev:'high',title:'Security deposit above one month',at,quote:t.trim(),over:d-rent,
          why:'A security deposit cannot be more than one month\'s rent. This asks for '+(d/rent).toFixed(1).replace('.0','')+' months.',
          ask:'Ask to reduce the deposit to '+usd(rent)+'. The excess must come back or be refused.',src:['gol']});
        continue;
      }
    }
    // --- advance rent beyond first month
    if(/last month|(\b(\d+|two|three|four|five|six)\b)\s+months?['’]?\s+(rent\s+)?(in advance|upfront|up front|prepaid|prepay)/i.test(t)){
      const n=monthsIn(t)||1;
      add({id:'advance',sev:'med',title:'Rent demanded beyond the first month',at,quote:t.trim(),over:rent?rent*Math.max(n-1,1):0,
        why:'The usual legal ask is first month plus a one-month deposit. Extra months paid up front can be treated as part of the deposit, which would break the one-month cap. Newcomers without US credit are often pushed into this.',
        ask:'Ask for the legal basis, and offer a third-party guarantor or proof of funds instead. Compare the true cost on the Approval tab (coming next).',src:['gol','ag']});
      continue;
    }
    // --- application fee
    if(/(application|screening|background|credit[- ]?check|credit report)\s*(fee|charge)/i.test(t)&&a!==null){
      facts.items.push(['Application fee',a]);
      if(a>20) add({id:'app',sev:'high',title:'Application fee above $20',at,quote:t.trim(),over:a-20,
        why:'Landlords may charge at most $20 (or the actual cost, if lower) for a background or credit check, and nothing if you hand them a recent report.',
        ask:'Offer your own recent credit report and ask for the fee to be reduced to $20 or removed.',src:['rpl238']});
      continue;
    }
    // --- late fee
    if(/late\s*(fee|charge|payment)/i.test(t)){
      const cap=rent?Math.min(50,rent*0.05):50;
      let lf=a; const pc=t.match(/(\d+(?:\.\d+)?)\s*%/); if(!lf&&pc&&rent) lf=rent*num(pc[1])/100;
      if(lf&&lf>cap+0.01) add({id:'late',sev:'med',title:'Late fee above the legal cap',at,quote:t.trim(),over:lf-cap,
        why:'A late fee cannot exceed the lesser of $50 or 5% of monthly rent'+(rent?' (here '+usd(cap)+')':'')+'.',
        ask:'Ask for the clause to be corrected to the legal maximum.',src:['rpl238']});
      const g=t.match(/\b(\d+|one|two|three|four)\b[\s-]*days?\b/i);
      if(g&&WORDNUM[g[1].toLowerCase()]<5) add({id:'grace',sev:'med',title:'No five-day grace period before a late fee',at,quote:t.trim(),over:0,
        why:'A late fee can only be charged once rent is more than five days late.',ask:'Ask for a five-day grace period in writing.',src:['rpl238']});
      continue;
    }
    // --- other non-rent fees
    if(/(move[- ]in|move[- ]out|amenity|admin(istrative)?|processing|key|fob|elevator|renewal|lease[- ](?:signing|break|processing)|pet|convenience)\s*(fee|charge)/i.test(t)&&a){
      const monthly=/(per|a|\/)\s*month|monthly/i.test(t);
      add({id:'nonrent',sev:'med',title:'Extra non-rent fee',at,quote:t.trim(),over:monthly?a*12:a,
        why:'Beyond rent, one month\'s deposit and a $20 screening fee, most upfront charges have no legal footing in an NYC residential lease'+(monthly?'; this one also repeats every month':'')+'. The NY Attorney General has settled cases over exactly these fees.',
        ask:'Ask which statute allows "'+(t.match(/(move[- ]in|move[- ]out|amenity|admin\w*|processing|key|fob|elevator|renewal|lease[- ]\w+|pet|convenience)\s*(fee|charge)/i)||['this fee'])[0]+'" and request its removal.',src:['rpl238','ag']});
      continue;
    }
    // --- waiver
    if(/waiv/i.test(t)&&/(habitab|warranty|rights?)/i.test(t)){
      add({id:'waive',sev:'high',title:'Waiver of the warranty of habitability',at,quote:t.trim(),over:0,
        why:'A tenant cannot waive the right to a livable apartment. Such a clause is void, and its presence says something about the landlord.',
        ask:'Ask for the clause to be deleted before you sign.',src:['rpl235']});
      continue;
    }
    // --- entry
    if(/\benter\b/i.test(t)&&/(at any time|any time|without (prior |advance )?notice)/i.test(t)){
      add({id:'entry',sev:'med',title:'Entry at any time, without notice',at,quote:t.trim(),over:0,
        why:'Landlords need to give reasonable notice before entering, except in emergencies. A clause granting entry at any time is a red flag for a landlord who will not respect that.',
        ask:'Ask for "with at least 24 hours\' notice, except in an emergency".',src:['ag']});
      continue;
    }
    // --- legal fees
    if(/(attorney|legal|lawyer)['’]?s?\s*fees?/i.test(t)&&/tenant|you|lessee/i.test(t)){
      add({id:'legal',sev:'low',title:'Tenant pays landlord\'s legal fees',at,quote:t.trim(),over:0,
        why:'In residential leases this clause is read both ways, so you can recover your fees if you win. For rent-stabilized tenants, legal fees are generally only due when a court orders them.',
        ask:'Fine to sign, but know it cuts both ways.',src:['rpl234']});
      continue;
    }
    // --- license
    if(/licen[sc]e\s+(pending|not required|applied)|unlicensed/i.test(t)){
      add({id:'license',sev:'med',title:'Broker licence not confirmed',at,quote:t.trim(),over:0,
        why:'People who rent apartments for others in New York need a real estate licence from the Department of State. "Pending" is not a licence.',
        ask:'Ask for the licence number and check it on the DOS lookup before sharing documents or money.',src:['dos']});
      continue;
    }
    // --- pressure
    if(/(today only|limited time|others? (are )?waiting|act fast|first come|must decide|within (24|48) hours|many (other )?applicants|send (it )?today)/i.test(t)){
      add({id:'pressure',sev:'low',title:'Pressure to move fast',at,quote:t.trim(),over:0,
        why:'Urgency is how bad terms get accepted. A legitimate landlord can wait a day for you to read the lease.',
        ask:'Ask for the lease and fee disclosure in writing, and take 24 hours.',src:['ag']});
      continue;
    }
  }
  // --- missing disclosures (long lease-like text only)
  if(text.length>420&&/(lease|tenant|landlord|premises)/i.test(text)){
    const miss=[]; 
    if(!/good cause/i.test(text)) miss.push('Good Cause notice');
    if(!/window guard/i.test(text)) miss.push('window guards');
    if(!/bed ?bug/i.test(text)) miss.push('bedbug history');
    if(!/flood/i.test(text)) miss.push('flood history');
    if(miss.length) add({id:'disc',sev:'low',title:'Required disclosures not found in this text',at:null,quote:'Not found: '+miss.join(', '),over:0,
      why:'NYC and New York State leases must carry these notices or riders. If you only pasted part of the lease, check the rest; if they are missing, ask for them.',
      ask:'Ask for the complete rider package: '+miss.join(', ')+'.',src:['ag']});
  }
  // merge repeated pattern flags into one card
  for(const id of ['scam','pressure']){
    const same=flags.filter(f=>f.id===id);
    if(same.length>1){
      const first=same[0]; first.quote=same.map(f=>f.quote.replace(/[,.]$/,'')).join(' … ');
      first.over=same.reduce((n,f)=>n+f.over,0); first.ats=same.map(f=>f.at);
      same.slice(1).forEach(f=>flags.splice(flags.indexOf(f),1));
    }
  }
  const sevRank={high:0,med:1,low:2};
  flags.sort((x,y)=>sevRank[x.sev]-sevRank[y.sev]);
  const atRisk=flags.reduce((n,f)=>n+(f.over||0),0);
  // move-in comparison
  let demanded=null,ceiling=null;
  if(rent){
    const oneTime=flags.filter(f=>['broker','access','app','nonrent','advance'].includes(f.id));
    const app=facts.items.find(i=>i[0]==='Application fee');
    const brokerEtc=oneTime.filter(f=>['broker','access','nonrent'].includes(f.id)).reduce((n,f)=>n+(f.over||0),0);
    const dep=facts.deposit||rent;
    demanded=rent+dep+(app?app[1]:0)+brokerEtc;
    ceiling=rent+rent+ (app?20:0);
  }
  const hi=flags.filter(f=>f.sev==='high').length, me=flags.filter(f=>f.sev==='med').length;
  const verdict=hi?'stop':(me?'push':(flags.length?'minor':'clean'));
  return {rent,facts,flags,atRisk,demanded,ceiling,verdict,hi,me,segs};
}
function renewal(o){
  const cur=o.current, prop=o.proposed, pct=(prop-cur)/cur*100;
  const out={pct,verdicts:[],max:null,over:0,covered:null,type:o.type};
  if(o.type==='stabilized'){
    const s=o.start?new Date(o.start+'T00:00:00'):null;
    const inFreeze=s&&s>=new Date('2026-10-01T00:00:00')&&s<=new Date('2027-09-30T23:59:59');
    out.covered=true; out.freeze=!!inFreeze;
    if(inFreeze){ out.max=cur; out.over=Math.max(0,(prop-cur)*12);
      out.verdicts.push(pct>0.001?{src:['dhcr'],sev:'high',t:'Above the freeze',d:'The Rent Guidelines Board voted a 0% increase for 1- and 2-year renewal leases starting October 1, 2026 through September 30, 2027. Your legal regulated rent should stay at '+usd(cur)+'.'}:{sev:'ok',t:'Matches the freeze',d:'No increase, which is what the 2026 Rent Guidelines Board order allows for leases starting in this window.'});
      if(pct>0.001) out.verdicts.push({sev:'med',t:'Check your legal rent first',d:'The freeze applies to your legal regulated rent. If you pay a lower preferential rent, the rules differ. Ask DHCR for your rent history before replying.'});
    } else { out.max=null; out.verdicts.push({sev:'med',t:'Outside the freeze window',d:'Your renewal lease starts outside October 1, 2026 to September 30, 2027, so a different Rent Guidelines Board order may apply. Check the order for your start date on the RGB site.'}); }
  } else {
    const cap=Math.min(10,5+o.cpi); out.cap=cap;
    let covered=true,why=[];
    if(!o.pre2009){covered=false;why.push('certificate of occupancy issued on or after January 1, 2009');}
    if(!o.big){covered=false;why.push('landlord owns 10 or fewer units in total');}
    if(o.luxury){covered=false;why.push('rent above 245% of HUD fair market rent');}
    out.covered=covered;
    if(!covered){ out.verdicts.push({src:['rpl214','gcnotice'],sev:'med',t:'Good Cause may not cover this apartment',d:'Based on your answers: '+why.join('; ')+'. Confirm each point on the HPD Good Cause page, because the burden to prove an exemption sits with the landlord.'}); }
    else {
      out.max=cur*(1+cap/100); out.over=Math.max(0,(prop-out.max)*12);
      out.verdicts.push(pct>cap+0.0001?{src:['rpl216','gcnotice'],sev:'high',t:'Presumptively unreasonable',d:pct.toFixed(1)+'% is above the '+cap.toFixed(2)+'% cap (the lesser of 10% or 5% plus CPI). The landlord has to justify it, and you cannot be evicted just for refusing an unreasonable increase.'}:{sev:'ok',t:'Within the Good Cause cap',d:pct.toFixed(1)+'% is at or below the '+cap.toFixed(2)+'% cap, so it is presumed reasonable.'});
      if(pct>5) out.verdicts.push({src:['rpl226c'],sev:'info',t:'Notice rules apply',d:'For increases above 5%, written notice is required: 30 days if you have lived there under a year, 60 days for one to two years, 90 days for more than two (RPL §226-c). Late notice is a ground to push back.'});
    }
  }
  return out;
}
function vet(o){
  const f=[]; const u=Math.max(o.units||1,1);
  const dens=(o.c*3+o.b*1.5+o.a*0.5)/u;
  if(o.c>0) f.push({sev:'high',t:o.c+' open Class C violation'+(o.c>1?'s':''),d:'Class C means immediately hazardous (no heat or hot water, lead paint, vermin, no egress). It has to be fixed within 24 hours of notice. Ask the landlord what is being done and when.'});
  if(o.harass) f.push({sev:'high',t:'Harassment finding on record',d:'HPD has found tenant harassment in this building or by this owner. Treat it as a strong reason to walk.'});
  if(o.lit>0) f.push({sev:'med',t:o.lit+' HPD litigation case'+(o.lit>1?'s':''),d:'Tenants or the city have taken the owner to court over conditions. Read the case type on HPD Online.'});
  if(dens>0.5&&!o.c) f.push({sev:'med',t:'Heavy violation load for the size',d:'Weighted violations per unit are '+dens.toFixed(2)+'. A well-run building of this size usually sits well below 0.5.'});
  if(o.comp>u*0.6) f.push({sev:'med',t:'Many complaints last year',d:o.comp+' complaints across '+u+' units suggests recurring problems (heat, pests, leaks).'});
  if(o.portfolio>=10&&(o.c>0||dens>0.5)) f.push({sev:'med',t:'Large portfolio with problems',d:'The owner controls about '+o.portfolio+' buildings. Search the owner on Who Owns What to see if the pattern repeats.'});
  if(o.broker==='no') f.push({sev:'high',t:'Broker not found in the licence database',d:'Do not send documents or money. An unlicensed broker, or one using a real broker\'s name, is a common scam.'});
  else if(o.broker==='unknown') f.push({sev:'med',t:'Broker licence unchecked',d:'Check the name and licence number before you pay or share ID.'});
  if(!f.length) f.push({sev:'ok',t:'Nothing alarming in what you entered',d:'The counts you entered do not trip any of Landed\'s warning thresholds. Still read the full HPD record and ask current tenants about heat and repairs.'});
  const level=f.some(x=>x.sev==='high')?'high':(f.some(x=>x.sev==='med')?'med':'ok');
  return {flags:f,level,dens};
}

function moveIn(o){
  const rent=o.rent,dep=rent,app=20,base=rent+dep+app,m=Math.max(2,o.months||6),paths=[];
  const need=rent*40;
  paths.push({id:'income',name:'Qualify on your own income',cash:base,nonref:app,ok:o.income>=need&&o.credit,
    need:'About '+usd(need)+' a year (40 times rent) plus a US credit score near 700.',
    note:o.credit?(o.income>=need?'You meet the usual bar.':'Income is short by '+usd(need-o.income)+' a year.'):'With no US credit history most landlords will not accept this path.'});
  paths.push({id:'personal',name:'Personal guarantor in the US',cash:base,nonref:app,ok:!!o.guarantor,
    need:'A guarantor earning about '+usd(rent*80)+' to '+usd(rent*100)+' a year (80 to 100 times rent), usually living in the tri-state area.',
    note:o.guarantor?'You have one, so this is the cheapest route.':'Most newcomers do not know anyone who qualifies.'});
  paths.push({id:'third',name:'Third-party guarantor company',cash:base+rent,nonref:app+rent,ok:true,
    need:'A one-time fee of roughly one month\'s rent ('+usd(rent*.9)+' to '+usd(rent*1.1)+'). Not refundable. The building must accept the product.',
    note:'Often the realistic path for international renters. Get the quote in writing and check the building accepts it.'});
  paths.push({id:'upfront',name:'Prepay '+m+' months of rent',cash:rent*m+dep+app,nonref:app,ok:true,
    need:'Rent for '+m+' months plus a one-month deposit.',
    note:'It is refundable in theory, but prepaid rent beyond the first month may be treated as part of the deposit, which is capped at one month. Ask for the legal basis and for the money to be held in escrow.'});
  const okp=paths.filter(p=>p.ok);
  const cheapNon=okp.reduce((a,b)=>b.nonref<a.nonref?b:a);
  const lowCash=okp.reduce((a,b)=>b.cash<a.cash?b:a);
  return {paths,cheapNon,lowCash,rent};
}
function depositClock(o){
  const mo=new Date(o.moveOut+'T00:00:00'), dl=new Date(mo.getTime()+14*86400000), now=o.today||new Date();
  const t0=new Date(now.getFullYear(),now.getMonth(),now.getDate());
  const left=Math.round((dl-t0)/86400000);
  return {deadline:dl,left,status:left>=0?'open':'missed',deposit:o.deposit};
}
function passport(o){
  const W={id:2,status:2,funds:3,offer:2,credit:1,ref:2,tax:1,guar:2};
  let score=0,max=0;const have=[],miss=[];
  const L={id:'Passport and visa or I-20',status:'Proof of student or work status',funds:'Bank statements (last 3 months)',offer:'Admission letter or employer offer letter',credit:'Credit report from your home country',ref:'Reference from a previous landlord',tax:'Tax returns or payslips',guar:'Letter from a guarantor or family'};
  for(const k in W){max+=W[k];if(o.has[k]){score+=W[k];have.push(L[k]);}else miss.push(L[k]);}
  const months=o.rent?o.funds/o.rent:0;
  const pct=Math.round(score/max*100);
  const level=pct>=75?'strong':pct>=45?'workable':'thin';
  return {pct,level,have,miss,months};
}
function feeAudit(text,stabilized){
  const r=analyze(text,null);
  const feeIds=['broker','access','app','nonrent','late','grace','deposit','advance','legal','waive','entry'];
  let flags=r.flags.filter(f=>feeIds.includes(f.id));
  if(stabilized){
    for(const s of segments(text)){
      const a=amt(s.text);
      if(/(background|credit)\s*(check|report)?\s*(fee|charge)|renewal\s*(fee|charge)|lease\s*(renewal|processing)\s*fee/i.test(s.text)&&a)
        flags.push({id:'dhcr',sev:'high',title:'Fee charged to a rent-stabilized tenant',at:[s.start,s.end],quote:s.text.trim(),over:a,
          why:'Rent-stabilized tenants already in occupancy cannot be charged background-check or renewal processing fees. Legal fees are only due when a court orders them.',
          ask:'Ask for the fee to be removed and refunded. If it is not, file with DHCR.',src:['dhcr']});
    }
  }
  const dh=flags.filter(f=>f.id==='dhcr').map(f=>f.at[0]);
  flags=flags.filter(f=>f.id==='dhcr'||!dh.includes(f.at&&f.at[0]));
  const total=flags.reduce((n,f)=>n+(f.over||0),0);
  return {flags,total,rent:r.rent};
}
/* ===== ENGINE END ===== */
