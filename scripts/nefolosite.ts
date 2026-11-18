import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import * as pdfjs from 'pdfjs-dist';
const require_ = createRequire(import.meta.url);
pdfjs.GlobalWorkerOptions.workerSrc = require_.resolve('pdfjs-dist/build/pdf.worker.mjs');
import { citesteProgram } from '../src/import/program';
import { citesteFI, NUME_COLOANE } from '../src/import/fi';
import { leaga } from '../src/lib/legatura';
import { scrieDurata } from '../src/lib/timp';
const buf=(p:string)=>{const b=readFileSync(p);return b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength) as ArrayBuffer;};
const program = citesteProgram(buf(process.argv[2]), process.argv[2].split('/').pop()!);
const fi = await citesteFI(buf(process.argv[3]), 'fi.pdf');
const l = leaga(program, fi);
for (const o of l.faraProgram) {
  const pe: Record<string, number> = {};
  for (const li of o.linii) for (const [c,v] of Object.entries(li.coloane)) {
    const n = NUME_COLOANE[Number(c)]; pe[n] = (pe[n] ?? 0) + v;
  }
  const top = Object.entries(pe).sort((a,b)=>b[1]-a[1]).slice(0,4).map(([n,v])=>`${n} ${scrieDurata(v)}`).join(', ');
  console.log(`${o.nume.padEnd(26)} ${o.functia.padEnd(32)} total ${scrieDurata(o.total).padStart(7)}  | ${top}`);
}
