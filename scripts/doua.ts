import { readFileSync } from 'node:fs';
import { citesteProgram } from '../src/import/program';
import { scrieDurata } from '../src/lib/timp';
const buf=(p:string)=>{const b=readFileSync(p);return b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength) as ArrayBuffer;};
for (const [f, luna] of [
  ['/mnt/user-data/uploads/784ae86d-Prog_mec_CLUJ_01.10.2026_1.xlsx', {an:2026,luna:10}],
  ['/mnt/user-data/uploads/9f89435d-Program_noiembrie_2026_CJ26-2026_6_pagini.xlsx', {an:2026,luna:11}],
] as Array<[string, {an:number;luna:number}]>) {
  const p = citesteProgram(buf(f), f.split('/').pop()!, luna);
  console.log('===', f.split('/').pop(), '|', p.zile, 'zile');
  for (const foaie of p.foi) {
    const cuOre = foaie.oameni.filter(o=>Object.keys(o.orePeZi).length>0).length;
    const t = foaie.oameni.reduce((a,o)=>a+Object.values(o.orePeZi).reduce((x,y)=>x+y,0),0);
    console.log(`   ${foaie.nume.padEnd(30)} ${String(foaie.oameni.length).padStart(3)} oameni, ${cuOre} cu ore, total ${scrieDurata(t)}`);
  }
  const prim = p.foi[0].oameni[0];
  console.log('   primul:', prim.nume, '| ore', scrieDurata(Object.values(prim.orePeZi).reduce((a,b)=>a+b,0)),
    '| trenuri zi1', prim.randuriTrenuri.map(r=>r[1]).filter(Boolean).join('/') || '-');
}
