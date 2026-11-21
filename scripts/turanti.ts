import { readFileSync } from 'node:fs';
import { citesteProgram } from '../src/import/program';
import { scrieDurata } from '../src/lib/timp';
const f='/mnt/user-data/uploads/9f89435d-Program_noiembrie_2026_CJ26-2026_6_pagini.xlsx';
const b=readFileSync(f);
const p=citesteProgram(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength) as ArrayBuffer, f.split('/').pop()!, {an:2026,luna:11});
for (const nume of ['Șef tură + Acari + Pompagii','Revizori + Aj. depou']) {
  const foaie=p.foi.find(x=>x.nume===nume)!;
  console.log('===', nume);
  for (const o of foaie.oameni) {
    const t=Object.values(o.orePeZi).reduce((a,b)=>a+b,0);
    console.log(`   ${String(o.nr).padStart(2)} ${o.nume.slice(0,24).padEnd(26)} ${scrieDurata(t).padStart(8)}  zi1-7: ${[1,2,3,4,5,6,7].map(z=>o.orePeZi[z]?scrieDurata(o.orePeZi[z]):'-').join(' ')}`);
  }
}
