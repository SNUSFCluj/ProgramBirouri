/** Lista alfabetică a tuturor oamenilor, cu căutare, filtru pe funcții și totaluri. */
import { useMemo, useState } from 'react';
import type { Legatura, OmLegat } from '../lib/legatura';
import { cuvinteNume } from '../lib/nume';
import { scrieDurata } from '../lib/timp';

interface Props {
  legatura: Legatura;
  onOm: (om: OmLegat) => void;
}

/** Orele întregi din caseta fișei; gol când fișa nu le dă. */
function ore(v: number | null | undefined): string {
  return v == null ? '' : `${v}`;
}

/** Coloanele după care se poate sorta, cu valoarea fiecăreia. */
const COLOANE = {
  programat: (o: OmLegat) => o.programMinute,
  real: (o: OmLegat) => (o.fi ? o.realMinute : null),
  diferenta: (o: OmLegat) => (o.fi ? o.realMinute - o.programMinute : null),
  capSectie: (o: OmLegat) => o.fi?.odihnaTotal ?? null,
  festive: (o: OmLegat) => o.fi?.festiveInNorma ?? null,
  pesteNorma: (o: OmLegat) => o.fi?.festivePesteNorma ?? null,
  raman: (o: OmLegat) => o.fi?.suplimentareFinale ?? null,
  platite: (o: OmLegat) => o.fi?.suplimentarePlatite ?? null,
} satisfies Record<string, (o: OmLegat) => number | null>;

type Coloana = keyof typeof COLOANE;

/**
 * Sortarea trece prin trei stări la fiecare clic: întâi de la mare la mic,
 * apoi de la mic la mare, apoi înapoi la ordinea alfabetică.
 */
interface Sortare { coloana: Coloana; crescator: boolean }

export function Oameni({ legatura, onOm }: Props) {
  const [cauta, setCauta] = useState('');
  const [functie, setFunctie] = useState('');
  const [foaie, setFoaie] = useState('');
  const [sortare, setSortare] = useState<Sortare | null>(null);

  function apasa(coloana: Coloana) {
    setSortare((s) => {
      if (!s || s.coloana !== coloana) return { coloana, crescator: false };
      if (!s.crescator) return { coloana, crescator: true };
      return null;
    });
  }

  const functii = useMemo(() => {
    const s = new Set<string>();
    for (const o of legatura.oameni) if (o.fi?.functia) s.add(o.fi.functia);
    return [...s].sort((a, b) => a.localeCompare(b, 'ro'));
  }, [legatura]);

  const foi = useMemo(() => [...new Set(legatura.oameni.map((o) => o.foaie))], [legatura]);

  const lista = useMemo(() => {
    const q = cuvinteNume(cauta).join(' ');
    const alfabetic = (a: OmLegat, b: OmLegat) => a.program.nume.localeCompare(b.program.nume, 'ro');
    const filtrat = legatura.oameni
      .filter((o) => (!functie || o.fi?.functia === functie))
      .filter((o) => (!foaie || o.foaie === foaie))
      .filter((o) => !q || cuvinteNume(o.program.nume).join(' ').includes(q) || (o.fi && cuvinteNume(o.fi.nume).join(' ').includes(q)));

    if (!sortare) return [...filtrat].sort(alfabetic);

    const valoare = COLOANE[sortare.coloana];
    return [...filtrat].sort((a, b) => {
      const x = valoare(a);
      const y = valoare(b);
      // Cine n-are cifra stă la coadă, indiferent de sens.
      if (x == null && y == null) return alfabetic(a, b);
      if (x == null) return 1;
      if (y == null) return -1;
      if (x === y) return alfabetic(a, b);
      return sortare.crescator ? x - y : y - x;
    });
  }, [legatura, cauta, functie, foaie, sortare]);

  const normaMin = legatura.norma != null ? legatura.norma * 60 : null;

  /** Capul unei coloane care se poate sorta. */
  const Cap = ({ coloana, titlu, ajutor }: { coloana: Coloana; titlu: string; ajutor?: string }) => {
    const activ = sortare?.coloana === coloana;
    return (
      <th className={`num sortabil${activ ? ' activ' : ''}`} title={ajutor}>
        <button onClick={() => apasa(coloana)}>
          {titlu}
          <span className="sageata">{!activ ? '↕' : sortare.crescator ? '↑' : '↓'}</span>
        </button>
      </th>
    );
  };

  return (
    <div className="oameni">
      <div className="filtre">
        <input
          className="cauta"
          placeholder="Caută după nume…"
          value={cauta}
          onChange={(e) => setCauta(e.target.value)}
        />
        <button className={`chip${foaie === '' ? ' on' : ''}`} onClick={() => setFoaie('')}>Toate foile</button>
        {foi.map((f) => (
          <button key={f} className={`chip${foaie === f ? ' on' : ''}`} onClick={() => setFoaie(f)}>{f}</button>
        ))}
        {functii.length > 0 && (
          <select className="sel" value={functie} onChange={(e) => setFunctie(e.target.value)}>
            <option value="">Toate funcțiile</option>
            {functii.map((f) => <option key={f} value={f}>{f}</option>)}
          </select>
        )}
        {sortare && (
          <button className="chip" onClick={() => setSortare(null)}>Înapoi la ordinea alfabetică</button>
        )}
        <span className="muted nr-total">{lista.length} oameni</span>
      </div>

      <table className="lista">
        <thead>
          <tr>
            <th>Nume</th>
            <th>Foaie</th>
            <th>Funcția</th>
            <th className="num">Normă</th>
            <Cap coloana="programat" titlu="Programat" />
            <Cap coloana="real" titlu="Real" ajutor="Orele care intră în normă, adunate din fișă" />
            <Cap coloana="diferenta" titlu="Diferență" ajutor="Real minus programat" />
            <Cap coloana="capSectie" titlu="Cap secție" ajutor="Totalul orelor de odihnă din fișă" />
            <Cap coloana="festive" titlu="Festive" ajutor="Din caseta „Totaluri lunare” a fișei" />
            <Cap coloana="pesteNorma" titlu="Peste normă" ajutor="Festive peste normă, din caseta fișei" />
            <Cap coloana="raman" titlu="Rămân" ajutor="Ore suplimentare finale — ce rămâne pe luna următoare" />
            <Cap coloana="platite" titlu="Plătite" ajutor="Ore suplimentare plătite, din fișă" />
          </tr>
        </thead>
        <tbody>
          {lista.map((o, i) => {
            const dif = o.fi ? o.realMinute - o.programMinute : 0;
            return (
              <tr key={`${o.program.nume}-${i}`} onClick={() => onOm(o)}>
                <td>
                  <b>{o.program.nume}</b>
                  {o.fi && o.fi.nume.toUpperCase() !== o.program.nume.toUpperCase() && (
                    <div className="sub">{o.fi.nume}</div>
                  )}
                  {!o.fi && <div className="avertizare">fără fișă</div>}
                </td>
                <td>{o.foaie}</td>
                <td className="muted">{o.fi?.functia ?? ''}</td>
                <td className="num mono">
                  {o.fi?.norma != null ? `${o.fi.norma}:00` : normaMin != null ? scrieDurata(normaMin) : ''}
                </td>
                <td className="num mono">{scrieDurata(o.programMinute)}</td>
                <td className="num mono">{o.fi ? scrieDurata(o.realMinute) : '—'}</td>
                <td className={`num mono ${dif > 0 ? 'plus' : dif < 0 ? 'minus' : ''}`}>
                  {o.fi ? (dif > 0 ? '+' : '') + scrieDurata(dif) : ''}
                </td>
                <td className="num mono">{o.fi ? scrieDurata(o.fi.odihnaTotal) : ''}</td>
                <td className="num mono">{ore(o.fi?.festiveInNorma)}</td>
                <td className={`num mono ${(o.fi?.festivePesteNorma ?? 0) > 0 ? 'plus' : ''}`}>
                  {ore(o.fi?.festivePesteNorma)}
                </td>
                <td className={`num mono ${(o.fi?.suplimentareFinale ?? 0) > 0 ? 'plus' : ''}`}>
                  {ore(o.fi?.suplimentareFinale)}
                </td>
                <td className="num mono">{ore(o.fi?.suplimentarePlatite)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
