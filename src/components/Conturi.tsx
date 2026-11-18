/** Administrarea conturilor. O vede doar cel care administrează aplicația. */
import { useEffect, useState } from 'react';
import { faceCont, listaConturi, schimbaAccesul, type ContSalvat } from '../cloud/conturi';

export function Conturi({ onInchide }: { onInchide: () => void }) {
  const [conturi, setConturi] = useState<ContSalvat[]>([]);
  const [incarca, setIncarca] = useState(true);
  const [utilizator, setUtilizator] = useState('');
  const [parola, setParola] = useState('');
  const [eroare, setEroare] = useState('');
  const [mesaj, setMesaj] = useState('');
  const [lucreaza, setLucreaza] = useState(false);

  async function reincarca() {
    setIncarca(true);
    try {
      setConturi(await listaConturi());
    } catch (e) {
      setEroare((e as Error).message);
    } finally {
      setIncarca(false);
    }
  }

  useEffect(() => { void reincarca(); }, []);

  async function adauga(e: React.FormEvent) {
    e.preventDefault();
    setEroare(''); setMesaj(''); setLucreaza(true);
    try {
      const cont = await faceCont(utilizator, parola);
      setMesaj(`Contul ${cont.utilizator} a fost creat.`);
      setUtilizator(''); setParola('');
      await reincarca();
    } catch (err) {
      setEroare((err as Error).message);
    } finally {
      setLucreaza(false);
    }
  }

  async function comuta(c: ContSalvat) {
    setEroare(''); setMesaj('');
    try {
      await schimbaAccesul(c.uid, !c.activ);
      await reincarca();
    } catch (err) {
      setEroare((err as Error).message);
    }
  }

  return (
    <div className="modal-fundal" onClick={onInchide}>
      <div className="modal ingust" onClick={(e) => e.stopPropagation()}>
        <div className="modal-cap">
          <div>
            <h2>Conturi</h2>
            <div className="muted">Cine poate intra în aplicație.</div>
          </div>
          <button className="pill-btn" onClick={onInchide}>Închide</button>
        </div>

        <div className="modal-corp">
          {incarca ? (
            <p className="muted">Se încarcă…</p>
          ) : conturi.length === 0 ? (
            <p className="muted">Nu e creat niciun cont încă.</p>
          ) : (
            <table className="lista">
              <thead>
                <tr><th>Utilizator</th><th>Stare</th><th /></tr>
              </thead>
              <tbody>
                {conturi.map((c) => (
                  <tr key={c.uid}>
                    <td><b>{c.utilizator}</b></td>
                    <td className={c.activ ? 'plus' : 'minus'}>{c.activ ? 'poate intra' : 'blocat'}</td>
                    <td className="num">
                      <button className="pill-btn" onClick={() => { void comuta(c); }}>
                        {c.activ ? 'Blochează' : 'Deblochează'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <form className="camp-lista" onSubmit={(e) => { void adauga(e); }}>
            <h3>Cont nou</h3>
            <label>
              Nume utilizator
              <input value={utilizator} onChange={(e) => setUtilizator(e.target.value)} autoComplete="off" />
            </label>
            <label>
              Parolă
              <input type="password" value={parola} onChange={(e) => setParola(e.target.value)} autoComplete="new-password" />
            </label>
            {eroare && <div className="stare rau">{eroare}</div>}
            {mesaj && <div className="stare">{mesaj}</div>}
            <button className="pill-btn primary lat" type="submit" disabled={lucreaza}>
              {lucreaza ? 'Se creează…' : 'Creează contul'}
            </button>
            <p className="muted mic">
              Omul intră cu numele de utilizator și parola pe care i-o dai, apoi
              și-o poate schimba singur din meniul lui. Un cont blocat nu mai
              poate intra, dar rămâne în listă și poate fi deblocat oricând.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
