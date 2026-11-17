from pathlib import Path
from pypdf import PdfReader
import json, hashlib
source=Path('/Users/simonwong/Downloads/AI test3')
output=Path('.materials'); output.mkdir(exist_ok=True)
records=[]
for path in sorted(source.glob('*.pdf'),key=lambda p:p.name.lower()):
    reader=PdfReader(path)
    pages=[page.extract_text() or '' for page in reader.pages]
    target=output/(path.stem+'.txt')
    target.write_text('\n\n'.join(f'=== PDF PAGE {i+1} ===\n{text}' for i,text in enumerate(pages)))
    record={'file':path.name,'pages':len(pages),'characters':sum(map(len,pages)),'empty_pages':[i+1 for i,t in enumerate(pages) if len(t.strip())<25],'sha256':hashlib.sha256(path.read_bytes()).hexdigest(),'status':'extracted; pending content review'}
    records.append(record)
    (output/'inventory.json').write_text(json.dumps(records,ensure_ascii=False,indent=2))
    print(path.name, len(pages), record['characters'], 'empty:',record['empty_pages'])
Path('docs/MATERIALS.md').write_text('# 教材處理紀錄\n\n逐份擷取；原始 PDF 及完整擷取文字只留本機，不進公開 repository。頁碼均為 PDF 頁次。\n\n| 教材 | 頁數 | 擷取文字數 | 閱讀狀態 |\n|---|---:|---:|---|\n'+''.join(f"| {r['file']} | {r['pages']} | {r['characters']} | 已擷取，待核對 |\n" for r in records))
