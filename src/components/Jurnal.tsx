/** Jurnalul de versiuni: ce s-a schimbat și când. */
import { JURNAL, VERSIUNE } from '../jurnal';
import { Fereastra } from './Fereastra';

export function Jurnal({ onInchide }: { onInchide: () => void }) {
  return (
    <Fereastra onInchide={onInchide}>
      <div className="modal lat" onClick={(e) => e.stopPropagation()}>
        <div className="modal-cap">
          <div>
            <h2>Jurnal de versiuni</h2>
            <div className="muted">Acum rulează v{VERSIUNE}.</div>
          </div>
          <button className="pill-btn" onClick={onInchide}>Închide</button>
        </div>
        <div className="modal-corp">
          {JURNAL.map((i) => (
            <div key={i.v} className="jurnal-i">
              <div className="jurnal-cap">
                <span className="eticheta tare mono">v{i.v}</span>
                <b>{i.titlu}</b>
                <span className="muted mic">{i.data}</span>
              </div>
              <ul>
                {i.schimbari.map((s, k) => <li key={k}>{s}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </Fereastra>
  );
}
