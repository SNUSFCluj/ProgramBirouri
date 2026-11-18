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
const numeXls = process.argv[2].split('/').pop()!;
const program = citesteProgram(buf(process.argv[2]), numeXls);
const fi = await citesteFI(buf(process.argv[3]), 'fi.pdf');
console.log('perioada din PDF: zilele', fi.deLaZi, '-', fi.panaLaZi, '| luna', fi.luna, fi.an);
let l = leaga(program, fi);
const om0 = l.oameni[0];
console.log('COMPLET:', om0.program.nume, 'programat', scrieDurata(om0.programMinute), 'real', scrieDurata(om0.realMinute));

// tăiem fișele la ziua 10, ca și cum PDF-ul ar fi fost scos pe 01–10
const LIMITA = 10;
for (const o of fi.oameni) {
  o.linii = o.linii.filter(x => x.zi <= LIMITA);
  const z: Record<number, number> = {};
  for (const d of Object.keys(o.orePeZi).map(Number)) if (d <= LIMITA) z[d] = o.orePeZi[d];
  o.orePeZi = z; o.total = Object.values(z).reduce((a,b)=>a+b,0);
}
fi.panaLaZi = LIMITA;
l = leaga(program, fi);
const om = l.oameni[0];
console.log('\nPARTIAL pana in', l.panaLaZi, '| potriviri', l.oameni.filter(o=>o.fi).length, '/', l.oameni.length);
console.log(om.program.nume, '— programat', scrieDurata(om.programMinute), 'real', scrieDurata(om.realMinute));
console.log('zi | program | real (asa cum apare in grila)');
for (let z = 1; z <= program.zile; z++) {
  const p = om.program.orePeZi[z] ?? 0, r = om.fi?.orePeZi[z] ?? 0;
  const afisat = om.fi ? scrieDurata(r) : '';
  const dincolo = l.panaLaZi != null && z > l.panaLaZi ? '  (fara informatii)' : '';
  if (z <= 13 || z >= 29) console.log(`${String(z).padStart(2)} | ${p?scrieDurata(p):'  -  '} | ${afisat}${dincolo}`);
}
