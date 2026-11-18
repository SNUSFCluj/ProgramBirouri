/** Meniul contului: schimbarea parolei și ieșirea din cont. */
import { useEffect, useRef, useState } from 'react';
import { iesi, schimbaParola, type Cont } from '../cloud/auth';
import { Conturi } from './Conturi';

export function Meniu({ cont, onIesit }: { cont: Cont; onIesit: () => void }) {
  const [deschis, setDeschis] = useState(false);
  const [parolaD, setParolaD] = useState(false);
  const [conturiD, setConturiD] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!deschis) return;
    const clic = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setDeschis(false);
    };
    const tasta = (e: KeyboardEvent) => { if (e.key === 'Escape') setDeschis(false); };
    document.addEventListener('mousedown', clic);
    document.addEventListener('keydown', tasta);
    return () => {
      document.removeEventListener('mousedown', clic);
      document.removeEventListener('keydown', tasta);
    };
  }, [deschis]);

  return (
    <div className="meniu-zona" ref={ref}>
      <button className={`pill-btn${deschis ? ' primary' : ''}`} onClick={() => setDeschis(!deschis)} aria-expanded={deschis}>
        {cont.utilizator}
      </button>
      {deschis && (
        <div className="meniu">
          <button onClick={() => { setDeschis(false); setParolaD(true); }}>
            Schimbă parola
            <small>Parola nouă trebuie să aibă cel puțin șase caractere.</small>
          </button>
          {cont.rol === 'superadmin' && (
            <button onClick={() => { setDeschis(false); setConturiD(true); }}>
              Conturi
              <small>Faci conturi noi și blochezi conturile care nu mai au ce căuta aici.</small>
            </button>
          )}
          <button onClick={() => { setDeschis(false); void iesi().then(onIesit); }}>
            Ieși din cont
            <small>Te întorci la ecranul de logare.</small>
          </button>
        </div>
      )}
      {parolaD && <SchimbaParola onInchide={() => setParolaD(false)} />}
      {conturiD && <Conturi eu={cont} onInchide={() => setConturiD(false)} />}
    </div>
  );
}

function SchimbaParola({ onInchide }: { onInchide: () => void }) {
  const [veche, setVeche] = useState('');
  const [noua, setNoua] = useState('');
  const [inca, setInca] = useState('');
  const [eroare, setEroare] = useState('');
  const [gata, setGata] = useState(false);
  const [lucreaza, setLucreaza] = useState(false);

  async function trimite(e: React.FormEvent) {
    e.preventDefault();
    setEroare('');
    if (noua !== inca) { setEroare('Parolele noi nu se potrivesc.'); return; }
    if (noua.length < 6) { setEroare('Parola nouă trebuie să aibă cel puțin șase caractere.'); return; }
    setLucreaza(true);
    try {
      await schimbaParola(veche, noua);
      setGata(true);
    } catch (err) {
      setEroare((err as Error).message);
    } finally {
      setLucreaza(false);
    }
  }

  return (
    <div className="modal-fundal" onClick={onInchide}>
      <form className="modal ingust" onClick={(e) => e.stopPropagation()} onSubmit={(e) => { void trimite(e); }}>
        <div className="modal-cap">
          <h2>Schimbă parola</h2>
          <button type="button" className="pill-btn" onClick={onInchide}>Închide</button>
        </div>
        {gata ? (
          <div className="modal-corp">
            <div className="stare">Parola a fost schimbată.</div>
          </div>
        ) : (
          <div className="modal-corp camp-lista">
            <label>
              Parola de acum
              <input type="password" value={veche} onChange={(e) => setVeche(e.target.value)} autoComplete="current-password" />
            </label>
            <label>
              Parola nouă
              <input type="password" value={noua} onChange={(e) => setNoua(e.target.value)} autoComplete="new-password" />
            </label>
            <label>
              Parola nouă încă o dată
              <input type="password" value={inca} onChange={(e) => setInca(e.target.value)} autoComplete="new-password" />
            </label>
            {eroare && <div className="stare rau">{eroare}</div>}
            <button className="pill-btn primary lat" type="submit" disabled={lucreaza}>
              {lucreaza ? 'Se schimbă…' : 'Schimbă parola'}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
