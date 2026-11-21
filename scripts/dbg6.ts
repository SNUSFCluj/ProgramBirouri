import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import * as pdfjs from 'pdfjs-dist';
const require_ = createRequire(import.meta.url);
pdfjs.GlobalWorkerOptions.workerSrc = require_.resolve('pdfjs-dist/build/pdf.worker.mjs');
const b=readFileSync('/mnt/user-data/uploads/276268c0-FI_OCT_2026_PT_BALAN.pdf');
const doc = await pdfjs.getDocument({data: b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength) as ArrayBuffer}).promise;
const p = await doc.getPage(25);
const c = await p.getTextContent();
type W={t:string;x:number;y:number};
const ws:W[]=[];
for (const it of c.items as Array<{str:string;transform:number[]}>) if (it.str.trim()) ws.push({t:it.str, x:it.transform[4], y:it.transform[5]});
const g=new Map<number,W[]>();
for (const w of ws){const k=Math.round(w.y/3); (g.get(k)??g.set(k,[]).get(k)!).push(w);}
const randuri=[...g.entries()].sort((a,b)=>b[0]-a[0]).map(([,v])=>v.sort((a,b)=>a.x-b.x).map(w=>w.t).join(' '));
for (const r of randuri.slice(0,10)) console.log(JSON.stringify(r));
