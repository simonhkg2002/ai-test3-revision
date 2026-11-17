"""Run against a LOCAL test database only; creates disposable test answers."""
import json, urllib.request, urllib.error, http.cookiejar, uuid
from time import time
base='http://127.0.0.1:5173'
def client():return urllib.request.build_opener(urllib.request.HTTPCookieProcessor(http.cookiejar.CookieJar()))
def call(c,path,method='GET',body=None,origin=base):
 req=urllib.request.Request(base+path,method=method,headers={'Origin':origin,'Content-Type':'application/json'},data=None if body is None else json.dumps(body).encode())
 try:
  with c.open(req) as r:return r.status,json.loads(r.read())
 except urllib.error.HTTPError as r:return r.code,json.loads(r.read())
a,b=client(),client()
assert call(a,'/api/events')[0]==401
assert call(a,'/api/session','POST',{'pin':'0000'})[0]==401
assert call(a,'/api/session','POST',{'pin':'4321'})[0]==200
assert call(b,'/api/session','POST',{'pin':'4321'})[0]==200
assert call(a,'/api/events','POST',{'events':[]},'https://wrong.example')[0]==403
assert call(a,'/api/events','POST',{'events':[{'id':'invalid'}]})[0]==400
now=int(time()*1000)
events=[dict(id=str(uuid.uuid4()),kind='answer',qid='language-c3',moduleId='language',at=now+i,correct=True,assisted=False,self=False) for i in range(2)]
assert call(a,'/api/events','POST',{'events':[events[0]]})[0]==200
assert call(a,'/api/events','POST',{'events':[events[0]]})[0]==200
assert call(b,'/api/events','POST',{'events':[events[1]]})[0]==200
rows=call(b,'/api/events')[1]['events']
for e in events:assert len([r for r in rows if r['id']==e['id']])==1
assert call(a,'/api/session','DELETE')[0]==200
assert call(a,'/api/events')[0]==401
print('PASS: PIN, auth, CSRF, input validation, idempotent retries, separate-client D1 read/write, logout')
