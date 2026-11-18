import { readFileSync } from 'node:fs';
import * as XLSX from 'xlsx';
const b=readFileSync(process.argv[2]);
const wb=XLSX.read(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength),{type:'array'});
for (const [sheet, rows] of [['MAN',[28,14]],['EA LP',[10]]] as Array<[string,number[]]>) {
  const ws=wb.Sheets[sheet];
  for (const r of rows) {
    const out:string[]=[];
    for (let c=5;c<=12;c++){
      const ad=XLSX.utils.encode_cell({r:r-1,c:c-1});
      const cell=ws[ad];
      if(cell) out.push(`${ad} t=${cell.t} v=${JSON.stringify(cell.v)} w=${JSON.stringify(cell.w)} z=${JSON.stringify(cell.z)}`);
    }
    console.log(sheet, 'rand', r, '\n  ', out.join('\n   '));
  }
}
