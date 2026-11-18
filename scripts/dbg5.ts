import { readFileSync } from 'node:fs';
import { citesteProgram } from '../src/import/program';
import { scrieDurata } from '../src/lib/timp';
const b=readFileSync(process.argv[2]);
const p=citesteProgram(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength) as ArrayBuffer, process.argv[2].split('/').pop()!);
for (const f of p.foi) {
  console.log('---', f.nume);
  for (const om of f.oameni) {
    const t=Object.values(om.orePeZi).reduce((a,b)=>a+b,0);
    console.log(`  ${om.nume.padEnd(24)} ${scrieDurata(t)}`);
  }
}
