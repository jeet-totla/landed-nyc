/* ===== LOOKUP START: live public-data lookups (browser fetch, NYC Open Data and data.ny.gov) ===== */
const NYC_DATA='https://data.cityofnewyork.us/resource/';
const NYS_DATA='https://data.ny.gov/resource/';
const DS={violations:'wvxf-dwi5',complaints:'ygpa-z7cr',registrations:'tesw-yqqr',contacts:'feu5-w2e2',litigation:'59kj-x8nc'};
const BOROS={'Manhattan':{id:'1',name:'MANHATTAN'},'Bronx':{id:'2',name:'BRONX'},'Brooklyn':{id:'3',name:'BROOKLYN'},'Queens':{id:'4',name:'QUEENS'},'Staten Island':{id:'5',name:'STATEN ISLAND'}};
const sq=s=>String(s).toUpperCase().replace(/\s+/g,' ').trim().replace(/'/g,"''");
async function soql(base,id,params){
  const u=new URL(base+id+'.json');
  Object.keys(params).forEach(k=>u.searchParams.set(k,params[k]));
  const r=await fetch(u.toString(),{headers:{Accept:'application/json'}});
  if(!r.ok) throw new Error('HTTP '+r.status);
  return r.json();
}
/* Turn what people type ("E 11th St", "Atlantic Ave") into HPD's spelling ("EAST 11 STREET", "ATLANTIC AVENUE"). */
const SUFFIX={ST:'STREET',STR:'STREET',AVE:'AVENUE',AV:'AVENUE',RD:'ROAD',PL:'PLACE',BLVD:'BOULEVARD',DR:'DRIVE',LN:'LANE',CT:'COURT',PKWY:'PARKWAY',HWY:'HIGHWAY',TER:'TERRACE',SQ:'SQUARE',PLZ:'PLAZA'};
const FULLSUF=['STREET','AVENUE','ROAD','PLACE','BOULEVARD','DRIVE','LANE','COURT','PARKWAY','HIGHWAY','TERRACE','SQUARE','PLAZA','BROADWAY','WAY','ALLEY','WALK','LOOP','PATH'];
const DIR={E:'EAST',W:'WEST',N:'NORTH',S:'SOUTH'};
function normStreet(x){
  let w=String(x).toUpperCase().replace(/[.,#]/g,' ').replace(/\b(\d+)(ST|ND|RD|TH)\b/g,'$1').replace(/\s+/g,' ').trim().split(' ');
  if(w.length>1&&DIR[w[0]]&&/^\d/.test(w[1]))w[0]=DIR[w[0]];
  const last=w.length-1;
  if(w.length>1&&SUFFIX[w[last]])w[last]=SUFFIX[w[last]];
  return w.join(' ');
}
const hasSuffix=n=>FULLSUF.includes(n.split(' ').pop());
/* HPD matches addresses literally: house number as HPD stores it, street name as HPD spells it (EAST 11 STREET). */
async function lookupBuilding(o){
  const b=BOROS[o.boro]; if(!b) throw new Error('Pick a borough');
  const house=sq(o.house), street=sq(normStreet(o.street));
  if(!house||!street) throw new Error('Enter a house number and street');
  const bld="boroid='"+b.id+"' AND housenumber='"+house+"' AND upper(streetname)"+(hasSuffix(street)?"='"+street+"'":" like '"+street+" %'")+"";
  const cmp="borough='"+b.name+"' AND house_number='"+house+"' AND upper(street_name)"+(hasSuffix(street)?"='"+street+"'":" like '"+street+" %'")+"";
  const since=new Date(Date.now()-365*86400000).toISOString().slice(0,10)+'T00:00:00';
  const [viol,comp,lit,reg]=await Promise.all([
    soql(NYC_DATA,DS.violations,{$select:'class,count(*) as n',$where:bld+" AND violationstatus='Open'",$group:'class'}),
    soql(NYC_DATA,DS.complaints,{$select:'count(distinct complaint_id) as n',$where:cmp+" AND received_date > '"+since+"'"}),
    soql(NYC_DATA,DS.litigation,{$select:'casetype,casestatus,count(*) as n',$where:bld,$group:'casetype,casestatus'}),
    soql(NYC_DATA,DS.registrations,{$select:'registrationid,buildingid',$where:bld,$limit:'5'})
  ]);
  const cls={A:0,B:0,C:0,I:0};
  viol.forEach(r=>{cls[r.class]=(cls[r.class]||0)+Number(r.n);});
  const openLit=lit.filter(r=>!/closed/i.test(r.casestatus||'')).reduce((n,r)=>n+Number(r.n),0);
  const out={a:cls.A,b:cls.B,c:cls.C,comp:Number((comp[0]||{}).n||0),lit:openLit,owner:null,portfolio:null,found:viol.length>0||reg.length>0||lit.length>0,registrationid:reg[0]&&reg[0].registrationid};
  if(reg.length){
    try{
      const ids=reg.map(r=>"'"+r.registrationid+"'").join(',');
      const cs=await soql(NYC_DATA,DS.contacts,{$select:'type,corporationname,firstname,lastname',$where:'registrationid in ('+ids+") AND type in ('CorporateOwner','IndividualOwner','HeadOfficer')",$limit:'10'});
      const c=cs.find(x=>x.corporationname)||cs[0];
      if(c){ out.owner=c.corporationname||((c.firstname||'')+' '+(c.lastname||'')).trim()||null;
        if(c.corporationname){ const p=await soql(NYC_DATA,DS.contacts,{$select:'count(distinct registrationid) as n',$where:"corporationname='"+sq(c.corporationname)+"'"}); out.portfolio=Number((p[0]||{}).n||0)||null; } }
    }catch(e){/* owner is a bonus; keep the counts */}
  }
  return out;
}
/* data.ny.gov "Broker search": brokers and tradenames. Salespeople work under a broker, so also check the brokerage. */
async function lookupBroker(q){
  const t=sq(q); if(t.length<3) throw new Error('Enter a name or licence number');
  const where=/^\d{2}[A-Z]{2}\d{5,}$/.test(t)?"license_number='"+t+"'":"upper(license_holder_name) like '%"+t+"%' OR upper(business_name) like '%"+t+"%'";
  const rows=await soql(NYS_DATA,'2uuv-4c3e',{$where:where,$limit:'8',$order:'license_expiration_date DESC'});
  const now=Date.now();
  return rows.map(r=>({name:r.license_holder_name,business:r.business_name,type:r.license_type,number:r.license_number,expires:(r.license_expiration_date||'').slice(0,10),active:r.license_expiration_date?new Date(r.license_expiration_date).getTime()>=now:false,city:r.business_city}));
}
/* ===== LOOKUP END ===== */
