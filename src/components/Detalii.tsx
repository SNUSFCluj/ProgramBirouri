/** Fereastra cu detaliile unui om: zi de zi, programat lângă real. */
import type { OmLegat } from '../lib/legatura';
import { NUME_COLOANE } from '../import/fi';
import { scrieDurata } from '../lib/timp';

interface Props {
  om: OmLegat;
  zile: number;
  an: number;
  luna: number;
  onInchide: () => void;
}

export function Detalii({ om, zile, an, luna, onInchide }: Props) {
  const p = om.program;
  const real = om.fi?.orePeZi ?? {};
  const rows = Array.from({ length: zile }, (_, i) => i + 1);

  return (
    <div className="modal-fundal" onClick={onInchide}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-cap">
          <div>
            <h2>{p.nume}</h2>
            <div className="muted">
              {om.foaie}
              {om.fi ? ` · ${om.fi.functia} · marca ${om.fi.marca}` : ' · fără fișă individuală'}
            </div>
          </div>
          <button className="pill-btn" onClick={onInchide}>Închide</button>
        </div>

        <div className="modal-sumar">
          <div><span className="muted">Programat</span><b className="mono">{scrieDurata(om.programMinute)}</b></div>
          <div><span className="muted">Real</span><b className="mono">{om.fi ? scrieDurata(om.realMinute) : '—'}</b></div>
          <div><span className="muted">Diferență</span>
            <b className={`mono ${om.realMinute - om.programMinute >= 0 ? 'plus' : 'minus'}`}>
              {om.fi ? (om.realMinute - om.programMinute >= 0 ? '+' : '') + scrieDurata(om.realMinute - om.programMinute) : '—'}
            </b>
          </div>
          <div><span className="muted">Normă</span><b className="mono">{om.fi?.norma != null ? `${om.fi.norma}:00` : '—'}</b></div>
        </div>

        <div className="modal-corp">
          <table className="lista zile">
            <thead>
              <tr>
                <th className="num">Zi</th>
                <th>Program</th>
                <th className="num">Ore program</th>
                <th className="num">Ore reale</th>
                <th>Din fișă</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((z) => {
                const trenuri = p.randuriTrenuri.map((r) => r[z]).filter(Boolean).join(' / ');
                const pr = p.orePeZi[z] ?? 0;
                const re = real[z] ?? 0;
                if (!trenuri && !pr && !re) return null;
                const linii = (om.fi?.linii ?? []).filter((l) => l.zi === z || l.ziFinal === z);
                const dif = pr && re ? re - pr : 0;
                const d = new Date(an, luna - 1, z).getDay();
                return (
                  <tr key={z} className={d === 0 || d === 6 ? 'we' : ''}>
                    <td className="num mono">{z}</td>
                    <td>{trenuri}</td>
                    <td className="num mono">{pr ? scrieDurata(pr) : ''}</td>
                    <td className={`num mono ${dif > 0 ? 'plus' : dif < 0 ? 'minus' : ''}`}>{re ? scrieDurata(re) : ''}</td>
                    <td className="muted mic">
                      {linii.map((l, i) => (
                        <div key={i}>
                          {l.tren && <b>{l.tren}</b>}
                          {l.intrare != null && l.iesire != null && ` ${scrieDurata(l.intrare)}–${scrieDurata(l.iesire)}`}
                          {' '}
                          {Object.entries(l.coloane)
                            .map(([c, v]) => `${NUME_COLOANE[Number(c)]} ${scrieDurata(v)}`)
                            .join(', ')}
                          {l.ziFinal !== l.zi && <i> (tură pe 2 zile, împărțită)</i>}
                        </div>
                      ))}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
