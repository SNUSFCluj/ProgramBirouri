/** Lista alfabetică a tuturor oamenilor, cu căutare, filtru pe funcții și totaluri. */
import { useMemo, useState } from 'react';
import type { Legatura, OmLegat } from '../lib/legatura';
import { cuvinteNume } from '../lib/nume';
import { scrieDurata } from '../lib/timp';

interface Props {
  legatura: Legatura;
  onOm: (om: OmLegat) => void;
}

export function Oameni({ legatura, onOm }: Props) {
  const [cauta, setCauta] = useState('');
  const [functie, setFunctie] = useState('');
  const [foaie, setFoaie] = useState('');

  const functii = useMemo(() => {
    const s = new Set<string>();
    for (const o of legatura.oameni) if (o.fi?.functia) s.add(o.fi.functia);
    return [...s].sort((a, b) => a.localeCompare(b, 'ro'));
  }, [legatura]);

  const foi = useMemo(() => [...new Set(legatura.oameni.map((o) => o.foaie))], [legatura]);

  const lista = useMemo(() => {
    const q = cuvinteNume(cauta).join(' ');
    return legatura.oameni
      .filter((o) => (!functie || o.fi?.functia === functie))
      .filter((o) => (!foaie || o.foaie === foaie))
      .filter((o) => !q || cuvinteNume(o.program.nume).join(' ').includes(q) || (o.fi && cuvinteNume(o.fi.nume).join(' ').includes(q)))
      .sort((a, b) => a.program.nume.localeCompare(b.program.nume, 'ro'));
  }, [legatura, cauta, functie, foaie]);

  const normaMin = legatura.norma != null ? legatura.norma * 60 : null;

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
        <span className="muted nr-total">{lista.length} oameni</span>
      </div>

      <table className="lista">
        <thead>
          <tr>
            <th>Nume</th>
            <th>Foaie</th>
            <th>Funcția</th>
            <th className="num">Normă</th>
            <th className="num">Programat</th>
            <th className="num">Real</th>
            <th className="num">Diferență</th>
          </tr>
        </thead>
        <tbody>
          {lista.map((o, i) => {
            const dif = o.fi ? o.realMinute - o.programMinute : 0;
            const fataDeNorma = normaMin != null && o.fi ? o.realMinute - normaMin : null;
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
                  {fataDeNorma != null && (
                    <div className={`sub ${fataDeNorma >= 0 ? 'plus' : 'minus'}`}>
                      {fataDeNorma >= 0 ? 'peste normă ' : 'sub normă '}
                      {scrieDurata(Math.abs(fataDeNorma))}
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
