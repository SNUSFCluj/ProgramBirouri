import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import * as pdfjs from 'pdfjs-dist';
const require_ = createRequire(import.meta.url);
pdfjs.GlobalWorkerOptions.workerSrc = require_.resolve('pdfjs-dist/build/pdf.worker.mjs');
import { citesteFI } from '../src/import/fi';
const b=readFileSync('/mnt/user-data/uploads/276268c0-FI_OCT_2026_PT_BALAN.pdf');
const fi = await citesteFI(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength) as ArrayBuffer,'fi.pdf');
const cu = fi.oameni.filter(o=>(o.festivePesteNorma ?? 0) > 0);
console.log('persoane', fi.oameni.length, '| cu festive peste norma', cu.length);
console.log('nume'.padEnd(28), 'fest', 'peste', 'raman', 'platite');
for (const o of [...cu].sort((a,b)=>(b.festivePesteNorma!)-(a.festivePesteNorma!)).slice(0,6))
  console.log(o.nume.slice(0,26).padEnd(28), String(o.festiveInNorma).padStart(4), String(o.festivePesteNorma).padStart(5), String(o.suplimentareFinale).padStart(5), String(o.suplimentarePlatite).padStart(7));
const fara = fi.oameni.filter(o=>o.festiveInNorma == null).length;
console.log('fara caseta citita:', fara);
