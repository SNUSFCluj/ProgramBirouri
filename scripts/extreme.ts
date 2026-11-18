import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import * as pdfjs from 'pdfjs-dist';
const require_ = createRequire(import.meta.url);
pdfjs.GlobalWorkerOptions.workerSrc = require_.resolve('pdfjs-dist/build/pdf.worker.mjs');
import { citesteProgram } from '../src/import/program';
import { citesteFI } from '../src/import/fi';
import { leaga } from '../src/lib/legatura';
import { scrieDurata } from '../src/lib/timp';
const buf=(p:string)=>{const b=readFileSync(p);return b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength) as ArrayBuffer;};
const program = citesteProgram(buf(process.argv[2]), process.argv[2].split('/').pop()!);
const fi = await citesteFI(buf(process.argv[3]), 'fi.pdf');
const l = leaga(program, fi);
const sortate = [...l.oameni].sort((a,b)=>Math.abs(b.realMinute-b.programMinute)-Math.abs(a.realMinute-a.programMinute));
console.log('cele mai mari diferente:');
for (const o of sortate.slice(0,12)) {
  console.log(`${o.foaie.padEnd(10)} ${o.program.nume.padEnd(24)} prog ${scrieDurata(o.programMinute).padStart(8)} real ${o.fi?scrieDurata(o.realMinute).padStart(8):'    —   '} dif ${o.fi?scrieDurata(o.realMinute-o.programMinute):''}`);
}
console.log('\nzile cu peste 24h in program:');
for (const f of program.foi) for (const om of f.oameni)
  for (const [z,v] of Object.entries(om.orePeZi)) if (v > 24*60) console.log(' ', f.nume, om.nume, 'zi', z, scrieDurata(v));
console.log('\nzile cu peste 24h in fise:');
for (const o of fi.oameni) for (const [z,v] of Object.entries(o.orePeZi)) if (v > 24*60) console.log(' ', o.nume, 'zi', z, scrieDurata(v));
