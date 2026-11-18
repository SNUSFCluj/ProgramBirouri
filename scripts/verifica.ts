/** Verificare rapidă a importatoarelor, pe fișiere reale. Rulează cu vite-node. */
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import * as pdfjs from 'pdfjs-dist';
const require_ = createRequire(import.meta.url);
pdfjs.GlobalWorkerOptions.workerSrc = require_.resolve('pdfjs-dist/build/pdf.worker.mjs');
import { citesteProgram } from '../src/import/program';
import { citesteFI } from '../src/import/fi';
import { leaga } from '../src/lib/legatura';
import { scrieDurata } from '../src/lib/timp';

const XLS = process.argv[2];
const PDF = process.argv[3];

function buf(p: string): ArrayBuffer {
  const b = readFileSync(p);
  return b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength) as ArrayBuffer;
}

const program = citesteProgram(buf(XLS), XLS.split('/').pop()!);
console.log('PROGRAM:', program.luna, program.an, program.zile, 'zile');
for (const f of program.foi) console.log('  foaie', f.nume, '—', f.oameni.length, 'oameni');

const fi = await citesteFI(buf(PDF), PDF.split('/').pop()!);
console.log('FI:', fi.oameni.length, 'oameni, luna', fi.luna, fi.an);

const l = leaga(program, fi);
console.log('potriviri:', l.oameni.filter((o) => o.fi).length, '/', l.oameni.length);
console.log('fara fisa:', l.faraFisa.map((o) => `${o.program.nume} (${o.foaie})`).join(', '));
console.log('fise nefolosite:', l.faraProgram.map((o) => o.nume).join(', '));
console.log('norma:', l.norma);

const tinta = process.argv[4] ?? 'CONSTANTIN VIOREL';
const om = l.oameni.find((o) => o.program.nume.toUpperCase().includes(tinta.toUpperCase()));
if (om) {
  console.log(`\n${om.program.nume} — ${om.foaie} — fisa: ${om.fi?.nume ?? 'lipsa'}`);
  console.log('zi | program | real');
  for (let z = 1; z <= program.zile; z++) {
    const p = om.program.orePeZi[z] ?? 0;
    const r = om.fi?.orePeZi[z] ?? 0;
    if (p || r) console.log(`${String(z).padStart(2)} | ${p ? scrieDurata(p) : '  -  '} | ${r ? scrieDurata(r) : '  -  '}`);
  }
  console.log('TOTAL program', scrieDurata(om.programMinute), ' real', scrieDurata(om.realMinute));
}

// verificare POP
for (const o of l.oameni) {
  if (o.program.nume.toUpperCase().startsWith('POP')) {
    console.log('POP:', o.program.nume, '→', o.fi ? `${o.fi.nume} [${o.fi.marca}]` : 'lipsa');
  }
}
