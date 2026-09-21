export const measures={
 OP_18b:{title:'ED stay · general patients',short:'General ED stay',unit:'min',definition:'Hospital median time from ED arrival to departure for discharged patients, excluding psychiatric/mental health patients and transfers.',period:'Oct 1, 2024 – Sep 30, 2025'},
 OP_18a:{title:'ED stay · all discharged patients',short:'Overall ED stay',unit:'min',definition:'Hospital median time from ED arrival to departure for all discharged ED patients, including psychiatric/mental health patients and transfers.',period:'Oct 1, 2024 – Sep 30, 2025'},
 OP_18c:{title:'ED stay · mental health patients',short:'Mental health ED stay',unit:'min',definition:'Hospital median time from ED arrival to departure for discharged psychiatric/mental health patients.',period:'Oct 1, 2024 – Sep 30, 2025'},
 OP_18d:{title:'ED stay · transferred patients',short:'Transfer ED stay',unit:'min',definition:'Hospital median time from ED arrival to departure for patients transferred to another facility.',period:'Oct 1, 2024 – Sep 30, 2025'},
 OP_22:{title:'Patients leaving before being seen',short:'Left before being seen',unit:'%',definition:'Hospital-reported percentage of ED patients who left before being seen.',period:'Jan 1 – Dec 31, 2024'}
};
export const volumes=['low','medium','high','very high','Not Available'];
export const value=(h,m)=>h.metrics[m]?.value??null;
export const valid=(rows,m)=>rows.filter(h=>Number.isFinite(value(h,m)));
export function quantile(values,p){const a=values.filter(Number.isFinite).sort((a,b)=>a-b);if(!a.length)return null;const i=(a.length-1)*p,l=Math.floor(i);return a[l]+(a[Math.ceil(i)]-a[l])*(i-l)}
export function summarize(rows,m){const a=valid(rows,m),v=a.map(h=>value(h,m));return {total:rows.length,n:a.length,missing:rows.length-a.length,median:quantile(v,.5),q1:quantile(v,.25),q3:quantile(v,.75),mean:v.length?v.reduce((a,b)=>a+b,0)/v.length:null,max:v.length?Math.max(...v):null}}
export function filterRows(rows,f,ignoreState=false){return rows.filter(h=>(ignoreState||!f.state||h.state===f.state)&&(!f.city||h.city.trim().toUpperCase()===f.city.trim().toUpperCase())&&(!f.volume||h.volume===f.volume)&&(!f.query||`${h.name} ${h.id}`.toLowerCase().includes(f.query.trim().toLowerCase())))}
export function bins(rows,m){const size=m==='OP_22'?1:60,count=m==='OP_22'?10:10;const b=Array.from({length:count+1},(_,i)=>({lo:i*size,hi:i===count?Infinity:(i+1)*size,n:0}));for(const h of valid(rows,m))b[Math.min(count,Math.floor(value(h,m)/size))].n++;return b}
export function grouped(rows,m,key){return [...new Set(rows.map(h=>h[key]))].map(k=>({key:k,...summarize(rows.filter(h=>h[key]===k),m)}))}
export function sortRows(rows,m,key='value',dir=-1){return [...rows].sort((a,b)=>{if(key==='value'){const av=value(a,m),bv=value(b,m);if(av===null)return bv===null?a.name.localeCompare(b.name):1;if(bv===null)return -1;return (av-bv)*dir||a.name.localeCompare(b.name)}if(key==='volume')return (volumes.indexOf(a.volume)-volumes.indexOf(b.volume))*dir||a.name.localeCompare(b.name);return String(a[key]??'').localeCompare(String(b[key]??''))*dir||a.id.localeCompare(b.id)})}

export const encodeCsv=rows=>rows.map(r=>r.map(v=>'"'+String(v??'').replaceAll('"','""')+'"').join(',')).join('\r\n');
