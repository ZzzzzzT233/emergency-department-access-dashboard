"""Rebuild the site snapshot from the unmodified homework CSV (stdlib only)."""
from pathlib import Path
import csv,json,hashlib,statistics,sys
root=Path(__file__).parent
source=Path(sys.argv[1]) if len(sys.argv)>1 else root.parent/'hw1'/'Timely_and_Effective_Care-Hospital.csv'
rows=list(csv.DictReader(source.open(encoding='utf-8-sig')))
keep=['OP_18a','OP_18b','OP_18c','OP_18d','OP_22','EDV']; hospitals={}; periods={};seen=set()
selected=[]
for r in rows:
 m=r['Measure ID']
 if m not in keep:continue
 key=(r['Facility ID'],m);assert key not in seen, f'Duplicate facility/measure: {key}';seen.add(key)
 h=hospitals.setdefault(r['Facility ID'],{'id':r['Facility ID'],'name':r['Facility Name'],'city':r['City/Town'],'state':r['State'],'county':r['County/Parish'],'zip':r['ZIP Code'],'metrics':{}})
 if m=='EDV':h['volume']=r['Score'];h['volumeFootnote']=r['Footnote']
 else:
  try:v=float(r['Score']);assert v>=0
  except ValueError:v=None
  h['metrics'][m]={'value':v,'sample':r['Sample'],'footnote':r['Footnote']}
 periods.setdefault(m,set()).add((r['Start Date'],r['End Date']))
 selected.append(r)
assert len(hospitals)==4658
assert all(len(p)==1 for p in periods.values())
summary={}
for m in keep[:-1]:
 vals=[h['metrics'][m]['value'] for h in hospitals.values() if h['metrics'][m]['value'] is not None]
 summary[m]={'valid':len(vals),'missing':len(hospitals)-len(vals),'median':statistics.median(vals),'mean':statistics.mean(vals)}
meta={'source':'Timely_and_Effective_Care-Hospital.csv','sha256':hashlib.sha256(source.read_bytes()).hexdigest(),'processed':'2026-09-21','releaseDate':None,'sourceRows':len(rows),'selectedRows':len(selected),'hospitalCount':len(hospitals),'periods':{k:list(next(iter(v))) for k,v in periods.items()},'summary':summary}
(root/'dist'/'hospitals.json').write_text(json.dumps({'meta':meta,'hospitals':list(hospitals.values())},separators=(',',':')))
# Publish only the hospital-level emergency records used by this dashboard.
fields=['Facility ID','Facility Name','City/Town','State','ZIP Code','County/Parish','Measure ID','Measure Name','Score','Sample','Footnote','Start Date','End Date']
with (root/'dist'/'emergency-care-source.csv').open('w',newline='') as f:
 w=csv.DictWriter(f,fieldnames=fields,extrasaction='ignore');w.writeheader();w.writerows(selected)
print(json.dumps(meta,indent=2))
