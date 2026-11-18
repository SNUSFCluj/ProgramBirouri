/** Pagina de import: programul lunar (Excel) și fișele individuale (PDF). */
import { useRef, useState } from 'react';
import type { ImportFI, Program } from '../types';
import type { Legatura } from '../lib/legatura';
import { citesteProgram } from '../import/program';
import { citesteFI } from '../import/fi';
import { NUME_LUNI } from '../lib/timp';

interface Props {
  program: Program | null;
  fi: ImportFI | null;
  legatura: Legatura;
  onProgram: (p: Program) => void;
  onFI: (f: ImportFI, an: number, luna: number) => void;
}

export function Import({ program, fi, legatura, onProgram, onFI }: Props) {
  const refXls = useRef<HTMLInputElement>(null);
  const refPdf = useRef<HTMLInputElement>(null);
  const [stare, setStare] = useState('');
  const [eroare, setEroare] = useState('');

  async function incarcaExcel(f: File) {
    setEroare(''); setStare('Citesc programul…');
    try {
      const p = citesteProgram(await f.arrayBuffer(), f.name);
      onProgram(p);
      setStare(`Program încărcat: ${p.foi.length} foi, ${p.foi.reduce((a, b) => a + b.oameni.length, 0)} oameni.`);
    } catch (e) {
      setEroare(`Nu am putut citi fișierul Excel: ${(e as Error).message}`);
      setStare('');
    }
  }

  async function incarcaPdf(f: File) {
    setEroare(''); setStare('Citesc fișele…');
    try {
      const r = await citesteFI(await f.arrayBuffer(), f.name, (p) => {
        setStare(`Citesc fișele… pagina ${p.pagina} din ${p.total}`);
      });
      const an = r.an ?? program?.an ?? new Date().getFullYear();
      const luna = r.luna ?? program?.luna ?? new Date().getMonth() + 1;
      onFI(r, an, luna);
      setStare(`Fișe încărcate: ${r.oameni.length} oameni, ${NUME_LUNI[luna - 1]} ${an}.`);
    } catch (e) {
      setEroare(`Nu am putut citi PDF-ul: ${(e as Error).message}`);
      setStare('');
    }
  }

  return (
    <div className="import">
      <div className="carduri">
        <div className="card">
          <h3>Programul lunar</h3>
          <p className="muted">Fișierul Excel al depoului, cu foile EA LP, EA SP, EGM + DSR și MAN.</p>
          <input ref={refXls} type="file" accept=".xlsx,.xls" hidden
            onChange={(e) => { const f = e.target.files?.[0]; if (f) void incarcaExcel(f); e.target.value = ''; }} />
          <button className="pill-btn primary" onClick={() => refXls.current?.click()}>Încarcă Excel</button>
          {program && (
            <div className="rezumat">
              <b>{program.fisier}</b>
              <div className="muted">{NUME_LUNI[program.luna - 1]} {program.an} · {program.foi.length} foi · {program.foi.reduce((a, b) => a + b.oameni.length, 0)} oameni</div>
            </div>
          )}
        </div>

        <div className="card">
          <h3>Fișele individuale (P1)</h3>
          <p className="muted">PDF-ul din CARES cu fișa individuală a serviciului prestat.</p>
          <input ref={refPdf} type="file" accept=".pdf" hidden
            onChange={(e) => { const f = e.target.files?.[0]; if (f) void incarcaPdf(f); e.target.value = ''; }} />
          <button className="pill-btn primary" onClick={() => refPdf.current?.click()}>Încarcă PDF</button>
          {fi && (
            <div className="rezumat">
              <b>{fi.fisier}</b>
              <div className="muted">
                {fi.oameni.length} fișe
                {legatura.norma != null ? ` · normă ${legatura.norma} ore` : ''}
                {fi.panaLaZi != null ? ` · zilele ${fi.deLaZi ?? 1}–${fi.panaLaZi}` : ''}
              </div>
            </div>
          )}
        </div>
      </div>

      {stare && <div className="stare">{stare}</div>}
      {eroare && <div className="stare rau">{eroare}</div>}

      {program && fi && (
        <div className="verificare">
          <h3>Verificare după import</h3>
          <div className="doua">
            <div>
              <h4>Fără fișă în PDF <span className="nr-mic">{legatura.faraFisa.length}</span></h4>
              {legatura.faraFisa.length === 0 ? (
                <p className="muted">Toți oamenii din program au fișă.</p>
              ) : (
                <ul>
                  {legatura.faraFisa.map((o, i) => (
                    <li key={i}>{o.program.nume} <span className="muted">— {o.foaie}</span></li>
                  ))}
                </ul>
              )}
            </div>
            <div>
              <h4>Fișe care nu apar în program <span className="nr-mic">{legatura.faraProgram.length}</span></h4>
              {legatura.faraProgram.length === 0 ? (
                <p className="muted">Toate fișele au fost folosite.</p>
              ) : (
                <ul>
                  {legatura.faraProgram.map((o) => (
                    <li key={o.marca}>{o.nume} <span className="muted">— {o.functia}</span></li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
