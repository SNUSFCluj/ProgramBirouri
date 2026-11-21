import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import * as pdfjs from 'pdfjs-dist';
const require_ = createRequire(import.meta.url);
pdfjs.GlobalWorkerOptions.workerSrc = require_.resolve('pdfjs-dist/build/pdf.worker.mjs');
import { citesteFI } from '../src/import/fi';
import { scrieDurata } from '../src/lib/timp';
const b=readFileSync('/mnt/user-data/uploads/276268c0-FI_OCT_2026_PT_BALAN.pdf');
const fi = await citesteFI(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength) as ArrayBuffer,'fi.pdf');
console.log('persoane', fi.oameni.length, '| fara odihna:', fi.oameni.filter(o=>o.odihnaTotal===0).length);
for (const o of [...fi.oameni].sort((a,b)=>b.odihnaTotal-a.odihnaTotal).slice(0,5))
  console.log('  ', o.nume.slice(0,26).padEnd(28), scrieDurata(o.odihnaTotal));
