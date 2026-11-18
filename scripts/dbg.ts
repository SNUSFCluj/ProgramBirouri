import { readFileSync } from 'node:fs';
import { citesteProgram } from '../src/import/program';
import { scrieDurata } from '../src/lib/timp';
const b=readFileSync(process.argv[2]);
const p=citesteProgram(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength) as ArrayBuffer,'p.xlsx');
const om=p.foi[0].oameni[0];
console.log(om.nume, 'nr', om.nr, 'scoala', scrieDurata(om.oreScoala));
let t=0;
for(let z=1;z<=31;z++){const v=om.orePeZi[z]??0;t+=v;if(v)process.stdout.write(`${z}:${scrieDurata(v)} `);}
console.log('\nTOTAL', scrieDurata(t));
console.log('randuri trenuri zi16:', om.randuriTrenuri.map(r=>r[16]));
