import {test} from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync} from 'node:fs';
import {onRequest as intake} from '../functions/api/display-inquiries.ts';
import {onRequest as operations} from '../functions/api/display-operations.ts';

const token='internal-test-token-not-a-production-secret-00000';
const origin='https://mall.custombro.org';
function fixture(){
 const database=new DatabaseSync(':memory:');database.exec(readFileSync(new URL('../migrations/0001_display_inquiries.sql',import.meta.url),'utf8'));
 return {database,env:{INQUIRY_OPERATOR_TOKEN:token,INQUIRIES_DB:{prepare(sql){let args=[];return {bind(...values){args=values;return this;},async first(){return database.prepare(sql).get(...args)??null;},async run(){return database.prepare(sql).run(...args);},async all(){return {results:database.prepare(sql).all(...args)};}};}}}};
}
function payload(key=crypto.randomUUID()){return {brief:{purpose:'hero',brand:'INTERNAL TEST',productName:'Ampoule',productShape:'round',diameterMm:30,heightMm:85,productsPerStand:1,quantity:10,materialId:'clear',printSide:'rear',measurementsConfirmed:false},contact:{name:'Internal test',company:'TEST ONLY',email:'internal@example.invalid'},privacyConsent:true,marketingConsent:false,website:'',idempotencyKey:key};}
const post=(body,headers={})=>new Request(origin+'/api/display-inquiries',{method:'POST',headers:{'content-type':'application/json',origin,'cf-connecting-ip':'192.0.2.1',...headers},body:JSON.stringify(body)});
test('stores one bounded lead and supports replay; never manufactures an order or payment',async()=>{
 const f=fixture(),body=payload();const first=await intake({request:post(body),env:f.env});assert.equal(first.status,201);const data=await first.json();assert.match(data.requestId,/^CBI-/);
 const again=await intake({request:post(body),env:f.env});assert.equal(again.status,200);assert.equal((await again.json()).requestId,data.requestId);
 assert.equal(f.database.prepare('SELECT count(*) AS n FROM display_inquiries').get().n,1);
 const changed=await intake({request:post({...body,contact:{...body.contact,name:'different'}}),env:f.env});assert.equal(changed.status,409);
 assert.equal(f.database.prepare('SELECT imported_reference FROM display_inquiries').get().imported_reference,null);f.database.close();
});
test('fails closed without hosting binding; rejects cross origin and tampered input',async()=>{
 const f=fixture();assert.equal((await intake({request:post(payload()),env:{}})).status,503);
 assert.equal((await intake({request:post(payload(),{origin:'https://unrelated.example'}),env:f.env})).status,403);
 assert.equal((await intake({request:post({...payload(),privacyConsent:false}),env:f.env})).status,400);
 assert.equal((await intake({request:post({...payload(),quoteKrw:1,paid:true}),env:f.env})).status,400);
 const bad=payload();bad.brief.materialId='mirror';assert.equal((await intake({request:post(bad),env:f.env})).status,400);
 const tooLarge=post({...payload(),website:'x'.repeat(20000)});assert.equal((await intake({request:tooLarge,env:f.env})).status,413);f.database.close();
});
test('public reads expose no personal records; authenticated import acknowledgment is idempotent',async()=>{
 const f=fixture(),first=await (await intake({request:post(payload()),env:f.env})).json();
 const unauthorized=await operations({request:new Request(origin+'/api/display-operations'),env:f.env});assert.equal(unauthorized.status,401);
 const status=await (await intake({request:new Request(origin+'/api/display-inquiries'),env:f.env})).json();assert.deepEqual(status,{acceptingInquiries:true});
 const auth={authorization:'Bearer '+token};
 const list=await (await operations({request:new Request(origin+'/api/display-operations',{headers:auth}),env:f.env})).json();assert.equal(list.items.length,1);assert.equal(list.items[0].requestId,first.requestId);
 const ack={requestId:first.requestId,action:'mark_imported',importedReference:'sales_'+'a'.repeat(32)};
 const acknowledge=(body)=>operations({request:new Request(origin+'/api/display-operations',{method:'POST',headers:{...auth,'content-type':'application/json'},body:JSON.stringify(body)}),env:f.env});
 assert.equal((await acknowledge(ack)).status,200);assert.equal((await acknowledge(ack)).status,200);assert.equal((await acknowledge({...ack,importedReference:'sales_'+'b'.repeat(32)})).status,409);
 const remaining=await (await operations({request:new Request(origin+'/api/display-operations',{headers:auth}),env:f.env})).json();assert.equal(remaining.items.length,0);f.database.close();
});
test('rate limits repeated public posts without storing raw IP addresses',async()=>{
 const f=fixture();for(let i=0;i<20;i++)assert.equal((await intake({request:post(payload()),env:f.env})).status,201);
 assert.equal((await intake({request:post(payload()),env:f.env})).status,429);
 const counters=f.database.prepare('SELECT * FROM display_intake_limits').all();assert.equal(counters.length,1);assert.equal(JSON.stringify(counters).includes('192.0.2.1'),false);f.database.close();
});
test('rejects contacts the private importer cannot consume while preserving multiline design notes',async()=>{
 const f=fixture();
 for(const field of ['name','company','email'])for(const control of ['\t','\n','\r','\u007f']){
  const body=payload();body.contact[field]=field==='email'?`test${control}@example.invalid`:`before${control}after`;
  assert.equal((await intake({request:post(body),env:f.env})).status,400,`${field} rejects control ${control.charCodeAt(0)}`);
 }
 assert.equal(f.database.prepare('SELECT count(*) AS n FROM display_inquiries').get().n,0);
 const body=payload();body.contact={name:'김 테스트',company:'브랜드 스튜디오',email:'normal@example.invalid'};body.brief.notes='첫 번째 요청\n두 번째 요청\t상세';
 assert.equal((await intake({request:post(body),env:f.env})).status,201);
 const saved=f.database.prepare('SELECT brief_json,contact_json FROM display_inquiries').get();
 assert.equal(JSON.parse(saved.brief_json).notes,body.brief.notes);assert.deepEqual(JSON.parse(saved.contact_json),body.contact);f.database.close();
});
