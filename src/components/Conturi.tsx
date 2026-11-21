/** Administrarea conturilor. O vede doar cel care administrează aplicația. */
import { useEffect, useState } from 'react';
import { Fereastra } from './Fereastra';
import type { Cont } from '../cloud/auth';
import { faceCont, listaConturi, redenumeste, schimbaAccesul, stergeCont, type ContSalvat } from '../cloud/conturi';
import { ButonSterge } from './ButonSterge';

export function Conturi({ eu, onCont, onInchide }: { eu: Cont; onCont: (c: Cont) => void; onInchide: () => void }) {
  const [lista, setLista] = useState<ContSalvat[] | null>(null);
  const [nume, setNume] = useState('');
  const [utilizator, setUtilizator] = useState('');
  const [parola, setParola] = useState('');
  const [eroare, setEroare] = useState('');
  const [mesaj, setMesaj] = useState('');
  const [lucreaza, setLucreaza] = useState(false);

  async function reincarca() {
    try {
      setLista(await listaConturi(eu.uid));
    } catch (e) {
      setEroare((e as Error).message);
      setLista([]);
    }
  }

  useEffect(() => { void reincarca(); }, []);

  async function adauga() {
    setEroare(''); setMesaj(''); setLucreaza(true);
    try {
      const cont = await faceCont(nume, utilizator, parola);
      setMesaj(`Contul „${cont.utilizator}” a fost creat. Dă-i omului numele de utilizator și parola.`);
      setNume(''); setUtilizator(''); setParola('');
      await reincarca();
    } catch (err) {
      setEroare((err as Error).message);
    } finally {
      setLucreaza(false);
    }
  }

  async function schimba(c: ContSalvat, activ: boolean) {
    setEroare(''); setMesaj('');
    try {
      await schimbaAccesul(c.uid, activ);
      await reincarca();
    } catch (err) {
      setEroare((err as Error).message);
    }
  }

  async function sterge(c: ContSalvat) {
    setEroare(''); setMesaj('');
    try {
      await stergeCont(c.uid);
      await reincarca();
    } catch (err) {
      setEroare((err as Error).message);
    }
  }

  async function schimbaNumele(c: ContSalvat) {
    const nou = prompt(`Numele scris în clar pentru contul ${c.utilizator}:`, c.nume || c.utilizator);
    if (nou == null || !nou.trim()) return;
    setEroare(''); setMesaj('');
    try {
      await redenumeste(c.uid, nou);
      if (c.uid === eu.uid) onCont({ ...eu, nume: nou.trim() });
      await reincarca();
    } catch (err) {
      setEroare((err as Error).message);
    }
  }

  const potCrea = nume.trim().length > 0 && utilizator.trim().length >= 3 && parola.length >= 6;

  return (
    <Fereastra onInchide={onInchide}>
      <div className="modal lat" onClick={(e) => e.stopPropagation()}>
        <div className="modal-cap">
          <div>
            <h2>Conturi</h2>
            <div className="muted">Cine poate intra în aplicație. Fără cont nu are nimeni acces.</div>
          </div>
          <button className="pill-btn" onClick={onInchide}>Închide</button>
        </div>

        <div className="modal-corp">
          <div className="cutie">
            <div className="cutie-t">Cont nou</div>
            <div className="grid3">
              <label>
                Nume
                <input value={nume} onChange={(e) => setNume(e.target.value)} placeholder="ex. Simona Marțian" />
              </label>
              <label>
                Nume utilizator (pentru logare)
                <input
                  value={utilizator}
                  onChange={(e) => setUtilizator(e.target.value)}
                  placeholder="ex. pop.ion"
                  autoComplete="off"
                  autoCapitalize="none"
                />
              </label>
              <label>
                Parolă inițială (cel puțin 6)
                <input type="text" value={parola} onChange={(e) => setParola(e.target.value)} autoComplete="new-password" />
              </label>
            </div>
            {eroare && <div className="stare rau">{eroare}</div>}
            {mesaj && <div className="stare">{mesaj}</div>}
            <button className="pill-btn primary" disabled={lucreaza || !potCrea} onClick={() => { void adauga(); }}>
              {lucreaza ? 'Se creează…' : 'Creează contul'}
            </button>
            <div className="muted mic">
              Omul intră cu numele de utilizator și parola asta, apoi și-o schimbă
              singur din meniul lui. Dacă uită parola, îi ștergi contul și îi faci altul.
            </div>
          </div>

          <table className="lista">
            <thead>
              <tr><th>Nume</th><th>Utilizator</th><th>Rol</th><th>Acces</th><th /></tr>
            </thead>
            <tbody>
              {lista == null ? (
                <tr><td colSpan={5} className="muted">Se încarcă…</td></tr>
              ) : lista.length === 0 ? (
                <tr><td colSpan={5} className="muted">Niciun cont.</td></tr>
              ) : lista.map((c) => (
                <tr key={c.uid}>
                  <td>
                    <button className="nume-btn" onClick={() => { void schimbaNumele(c); }} title="Schimbă numele">
                      {c.nume || c.utilizator}
                    </button>
                  </td>
                  <td className="mono">{c.utilizator}</td>
                  <td>
                    <span className={`eticheta${c.rol === 'superadmin' ? ' tare' : ''}`}>
                      {c.rol === 'superadmin' ? 'AdmiN' : 'admin'}
                    </span>
                  </td>
                  <td>
                    {c.uid === eu.uid ? (
                      <span className="muted">tu</span>
                    ) : (
                      <label className="bifa">
                        <input type="checkbox" checked={c.activ} onChange={(e) => { void schimba(c, e.target.checked); }} />
                        {c.activ ? 'activ' : 'oprit'}
                      </label>
                    )}
                  </td>
                  <td className="num">
                    {c.uid !== eu.uid && (
                      <ButonSterge mic ce={`contul ${c.utilizator}`} onSterge={() => { void sterge(c); }} />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Fereastra>
  );
}
