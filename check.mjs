import assert from 'node:assert/strict';
import fs from 'node:fs';
import {measures,value,valid,quantile,summarize,filterRows,bins,sortRows,encodeCsv} from './dist/analytics.mjs';
const {meta,hospitals}=JSON.parse(fs.readFileSync('dist/hospitals.json'));
assert.equal(hospitals.length,4658);assert.equal(new Set(hospitals.map(h=>h.id)).size,4658);
for(const m of Object.keys(measures)){const s=summarize(hospitals,m);assert.equal(s.n,meta.summary[m].valid);assert.equal(s.missing,meta.summary[m].missing);assert.equal(s.median,meta.summary[m].median);assert.equal(bins(hospitals,m).reduce((s,b)=>s+b.n,0),s.n);const a=sortRows(hospitals,m);assert.equal(value(a.at(-1),m),null);assert.equal(value(a[0],m),s.max);}
assert.equal(quantile([1,2,3,4],.25),1.75);assert.equal(quantile([],0.5),null);
const ma=filterRows(hospitals,{state:'MA'});assert.equal(ma.length,62);assert.equal(summarize(ma,'OP_18b').median,211.5);
assert.equal(filterRows(hospitals,{query:'220086'}).length,1);assert.equal(filterRows(hospitals,{query:'NO_SUCH_HOSPITAL_XYZ'}).length,0);
const zero=hospitals.find(h=>value(h,'OP_22')===0);assert.equal(valid([zero],'OP_22').length,1);assert.equal(bins([zero],'OP_22')[0].n,1);
const mental=bins(hospitals,'OP_18c');assert(mental.at(-1).n>0);
assert.equal(summarize(filterRows(hospitals,{volume:'low'}),'OP_18b').median,120);
assert.equal(summarize(filterRows(hospitals,{volume:'very high'}),'OP_18b').median,192.5);
const paired=hospitals.filter(h=>value(h,'OP_18b')!==null&&value(h,'OP_18c')!==null);assert.equal(paired.length,3023);assert.equal(quantile(paired.map(h=>value(h,'OP_18c')-value(h,'OP_18b')),.5),83);
assert.equal(hospitals.filter(h=>['high','very high'].includes(h.volume)&&value(h,'OP_18b')>188).length,658);
const html=fs.readFileSync('dist/index.html','utf8');for(const name of ['style.css','app.js','emergency-care-source.csv'])assert(fs.existsSync('dist/'+name));assert(html.includes('Missing data, bias & uncertainty'));
console.log('PASS: all five measures match independent CSV summaries; unique IDs, missing vs zero, quartiles, histogram outliers, sorting, filters, paired comparison, 658-hospital screen, and local assets.');

assert.equal(encodeCsv([['001','Hospital, A','He said "yes"'],[null,0,3]]), '"001","Hospital, A","He said ""yes"""\r\n"","0","3"');
assert.equal(filterRows(ma,{city:'boston'}).length,filterRows(ma,{city:'BOSTON'}).length);
