/** Grila lunară pe foi, cu rândul de ore reale adăugat sub „Nr. Ore”. */
import { useMemo, useState } from 'react';
import type { Program } from '../types';
import type { Legatura, OmLegat } from '../lib/legatura';
import { scrieDurata } from '../lib/timp';

interface Props {
  program: Program;
  legatura: Legatura;
  onOm: (om: OmLegat) => void;
}

export function Grila({ program, legatura, onOm }: Props) {
  const [foaie, setFoaie] = useState(program.foi[0]?.nume ?? '');
  const zile = useMemo(() => Array.from({ length: program.zile }, (_, i) => i + 1), [program.zile]);
  const oameni = legatura.oameni.filter((o) => o.foaie === foaie);

  const weekend = (zi: number) => {
    const d = new Date(program.an, program.luna - 1, zi).getDay();
    return d === 0 || d === 6;
  };

  return (
    <div className="grila-wrap">
      <div className="foi-bar">
        {program.foi.map((f) => (
          <button key={f.nume} className={`pill-btn${f.nume === foaie ? ' primary' : ''}`} onClick={() => setFoaie(f.nume)}>
            {f.nume}
            <span className="nr-mic">{f.oameni.length}</span>
          </button>
        ))}
      </div>

      <div className="tabel-scroll">
        <table className="grila">
          <thead>
            <tr>
              <th className="c-nr">Nr.</th>
              <th className="c-nume">Numele și prenumele</th>
              <th className="c-mic">Școală</th>
              <th className="c-mic">Report</th>
              {zile.map((z) => (
                <th key={z} className={`c-zi${weekend(z) ? ' we' : ''}`}>{z}</th>
              ))}
              <th className="c-tot">Total</th>
            </tr>
          </thead>
          <tbody>
            {oameni.map((o, idx) => (
              <BlocOm key={`${o.program.nume}-${idx}`} om={o} zile={zile} weekend={weekend} onOm={onOm} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function BlocOm({ om, zile, weekend, onOm }: {
  om: OmLegat;
  zile: number[];
  weekend: (z: number) => boolean;
  onOm: (om: OmLegat) => void;
}) {
  const p = om.program;
  const real = om.fi?.orePeZi ?? {};

  return (
    <>
      {p.randuriTrenuri.map((rand, i) => (
        <tr key={`t${i}`} className={`r-tren${i === 0 ? ' prim' : ''}`}>
          {i === 0 && <td className="c-nr" rowSpan={5}>{p.nr ?? ''}</td>}
          {i === 0 && (
            <td className="c-nume" rowSpan={5}>
              <button className="nume-btn" onClick={() => onOm(om)}>{p.nume}</button>
              {p.subtitlu && <div className="sub">{p.subtitlu}</div>}
              {!om.fi && <div className="avertizare" title="Nu are fișă individuală în PDF-ul încărcat">fără fișă</div>}
            </td>
          )}
          {i === 0 && <td className="c-mic" rowSpan={5}>{p.oreScoala ? scrieDurata(p.oreScoala) : ''}</td>}
          {i === 0 && <td className="c-mic" rowSpan={5}>{p.oreReport ? scrieDurata(p.oreReport) : ''}</td>}
          {zile.map((z) => (
            <td key={z} className={`c-zi${weekend(z) ? ' we' : ''}`}>{rand[z] ?? ''}</td>
          ))}
          {i === 0 && (
            <td className="c-tot" rowSpan={5}>
              <div className="tot-p">{scrieDurata(om.programMinute)}</div>
              <div className="tot-r">{om.fi ? scrieDurata(om.realMinute) : '—'}</div>
            </td>
          )}
        </tr>
      ))}
      <tr className="r-ore">
        {zile.map((z) => (
          <td key={z} className={`c-zi${weekend(z) ? ' we' : ''}`}>
            {p.orePeZi[z] ? scrieDurata(p.orePeZi[z]) : ''}
          </td>
        ))}
      </tr>
      <tr className="r-real">
        {zile.map((z) => {
          const r = real[z] ?? 0;
          const pr = p.orePeZi[z] ?? 0;
          const dif = r && pr ? r - pr : 0;
          return (
            <td key={z} className={`c-zi${weekend(z) ? ' we' : ''}${dif > 0 ? ' plus' : dif < 0 ? ' minus' : ''}`}>
              {r ? scrieDurata(r) : ''}
            </td>
          );
        })}
      </tr>
    </>
  );
}
