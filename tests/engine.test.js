const fs=require('fs');eval(fs.readFileSync(__dirname+'/../engine.js','utf8')+';globalThis.A=analyze;globalThis.R=renewal;globalThis.V=vet;globalThis.M=moveIn;globalThis.D=depositClock;globalThis.P=passport;globalThis.F=feeAudit;');
const demos={
hero:`Monthly rent: $3,400
Security deposit: $6,800 (two months)
Broker fee: 15% of annual rent, paid by tenant
Application fee: $150`,
d1:`Hi! Studio at 214 E 11th St, $3,400/month. To unlock the full address and schedule a viewing there's a $4,000 listing access fee, plus broker fee of 15% of annual rent paid by tenant. Application fee $150. Security deposit $6,800 (two months). First month in advance. Limited time, others waiting, send it today.`,
d2:`RESIDENTIAL LEASE RIDER, Unit 4C. The monthly rent is $2,850 per month. Security deposit equal to two months' rent, $5,700. Tenant shall pay a non-refundable move-in fee of $750 and an amenity fee of $120 per month. A late fee of $150 applies if rent is more than 1 day late. Landlord may enter the premises at any time without notice. Tenant waives the warranty of habitability and agrees the apartment is accepted as is. Tenant pays the landlord's attorney fees in any dispute. This lease is between the landlord and tenant for the premises described above, for a term of twelve months, beginning on the first day of the month noted in the lease cover page.`,
d3:`Hello, I'm the owner and I'm currently overseas on a mission. Because I can't show the apartment, please send a $1,500 holding deposit by Zelle before viewing and I will mail you the keys. The agent is Alex from Prime NYC Realty, license pending. Send it today, others are waiting.`};
for(const k in demos){const r=A(demos[k]);console.log('\n==',k,'rent',r.rent,'atRisk',r.atRisk,r.verdict,'demanded',r.demanded,'ceil',r.ceiling);r.flags.forEach(f=>console.log(' ',f.sev,f.id,f.over,'|',f.quote.slice(0,60)));}
console.log(R({type:'market',current:3000,proposed:3400,cpi:3.38,pre2009:true,big:true}).verdicts.map(v=>v.t),R({type:'stabilized',current:2000,proposed:2060,start:'2026-11-01'}).verdicts.map(v=>v.t));
console.log(V({units:20,c:2,b:5,a:3,comp:9,lit:1,portfolio:14,broker:'unknown'}).flags.map(f=>f.t));

console.log(JSON.stringify(M({rent:3400,income:90000,credit:false,guarantor:false,months:6}).paths.map(p=>[p.id,p.cash,p.nonref,p.ok])));
console.log(D({moveOut:'2026-10-01',today:new Date('2026-10-22T12:00:00')}).left, D({moveOut:'2026-10-10',today:new Date('2026-10-22T12:00:00')}).left);
console.log(P({has:{id:1,funds:1,offer:1},funds:40000,rent:3400}));
console.log(F('Background check fee $75. Renewal fee $100.',true).total);
