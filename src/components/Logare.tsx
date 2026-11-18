/** Ecranul de logare. Fără creare de cont — conturile le face administratorul. */
import { useState } from 'react';
import { intra, type Cont } from '../cloud/auth';

export function Logare({ onIntrat }: { onIntrat: (c: Cont) => void }) {
  const [utilizator, setUtilizator] = useState('');
  const [parola, setParola] = useState('');
  const [eroare, setEroare] = useState('');
  const [lucreaza, setLucreaza] = useState(false);

  async function trimite(e: React.FormEvent) {
    e.preventDefault();
    if (!utilizator.trim() || !parola) return;
    setEroare(''); setLucreaza(true);
    try {
      onIntrat(await intra(utilizator, parola));
    } catch (err) {
      setEroare((err as Error).message);
    } finally {
      setLucreaza(false);
    }
  }

  return (
    <div className="logare-fundal">
      <form className="logare" onSubmit={(e) => { void trimite(e); }}>
        <img src="./icon-192.png" alt="" className="logare-logo" />
        <h1>Program <i>birouri</i></h1>
        <p className="muted">Compară programul lunar cu orele din fișele P1.</p>

        <label>
          Nume utilizator
          <input
            value={utilizator}
            onChange={(e) => setUtilizator(e.target.value)}
            autoComplete="username"
            autoFocus
          />
        </label>
        <label>
          Parolă
          <input
            type="password"
            value={parola}
            onChange={(e) => setParola(e.target.value)}
            autoComplete="current-password"
          />
        </label>

        {eroare && <div className="stare rau">{eroare}</div>}

        <button className="pill-btn primary lat" type="submit" disabled={lucreaza}>
          {lucreaza ? 'Se verifică…' : 'Intră'}
        </button>
      </form>
    </div>
  );
}
