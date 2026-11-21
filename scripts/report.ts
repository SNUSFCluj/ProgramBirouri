import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import * as pdfjs from 'pdfjs-dist';
const require_ = createRequire(import.meta.url);
pdfjs.GlobalWorkerOptions.workerSrc = require_.resolve('pdfjs-dist/build/pdf.worker.mjs');
import { citesteFI } from '../src/import/fi';
import { scrieDurata } from '../src/lib/timp';
const b=readFileSync('/mnt/user-data/uploads/276268c0-FI_OCT_2026_PT_BALAN.pdf');
const fi = await citesteFI(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength) as ArrayBuffer,'fi.pdf');
const tinte=['BALAN ADRIAN','ANDREICA VASILE','CATANA','BOLOGA','CONSTANTIN VIOREL'];
for (const o of fi.oameni) {
  if (!tinte.some(t=>o.nume.toUpperCase().includes(t))) continue;
  const norma=(o.norma??176)*60;
  console.log(`${o.nume.padEnd(26)} norma ${o.norma}  real ${scrieDurata(o.total)}  real-norma ${scrieDurata(o.total-norma)}`);
}
