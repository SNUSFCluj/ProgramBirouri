import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import * as pdfjs from 'pdfjs-dist';
const require_ = createRequire(import.meta.url);
pdfjs.GlobalWorkerOptions.workerSrc = require_.resolve('pdfjs-dist/build/pdf.worker.mjs');
import { citesteFI, totalDinColoane } from '../src/import/fi';
import { scrieDurata } from '../src/lib/timp';
const b=readFileSync(process.argv[2]);
const fi = await citesteFI(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength) as ArrayBuffer,'fi.pdf');
let egal=0, dif=0; const ex:string[]=[];
for (const o of fi.oameni) for (const l of o.linii) {
  if (l.timpInServiciu == null) continue;
  const f = totalDinColoane(l.coloane);
  if (f === l.timpInServiciu) egal++; else { dif++; if (ex.length<8) ex.push(`${o.nume} zi${l.zi} col7=${scrieDurata(l.timpInServiciu)} regula=${scrieDurata(f)} ${JSON.stringify(l.coloane)}`); }
}
console.log('regula == col7:', egal, '| difera:', dif);
for (const e of ex) console.log(' ', e);
console.log('\ntotaluri mari:');
for (const o of [...fi.oameni].sort((a,b)=>b.total-a.total).slice(0,8)) console.log(` ${o.nume.padEnd(26)} ${scrieDurata(o.total).padStart(8)}  ${o.functia}`);
console.log('\nzile peste 24h:');
for (const o of fi.oameni) for (const [z,v] of Object.entries(o.orePeZi)) if (v>24*60) console.log(' ', o.nume, 'zi', z, scrieDurata(v));
