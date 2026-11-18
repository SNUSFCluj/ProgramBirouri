import { useEffect, useMemo, useState } from 'react';
import type { ImportFI, Luna, Program } from './types';
import { cheieLuna, citesteTema, dateVechiSterse, incarcaTot, salveazaFI, salveazaProgram, salveazaTot, scrieTema } from './store';
import { leaga, type OmLegat } from './lib/legatura';
import { NUME_LUNI } from './lib/timp';
import { Import } from './components/Import';
import { Grila } from './components/Grila';
import { Oameni } from './components/Oameni';
import { Detalii } from './components/Detalii';

type Pagina = 'import' | 'program' | 'oameni';

export default function App() {
  const [luni, setLuni] = useState<Record<string, Luna>>(() => incarcaTot());
  const [cheie, setCheie] = useState<string>(() => {
    const t = incarcaTot();
    const k = Object.keys(t).sort();
    return k.length > 0 ? k[k.length - 1] : '';
  });
  const [pagina, setPagina] = useState<Pagina>('import');
  const [tema, setTema] = useState<'dark' | 'light'>(() => citesteTema());
  const [omDeschis, setOmDeschis] = useState<OmLegat | null>(null);

  useEffect(() => { salveazaTot(luni); }, [luni]);
  useEffect(() => { scrieTema(tema); }, [tema]);

  const luna = cheie ? luni[cheie] : undefined;
  const program = luna?.program ?? null;
  const fi = luna?.fi ?? null;
  const legatura = useMemo(() => leaga(program, fi), [program, fi]);

  function primesteProgram(p: Program) {
    setLuni((l) => {
      const nou = salveazaProgram(l, p);
      return nou;
    });
    setCheie(cheieLuna(p.an, p.luna));
  }

  function primesteFI(f: ImportFI, an: number, lunaNr: number) {
    setLuni((l) => salveazaFI(l, f, an, lunaNr));
    setCheie(cheieLuna(an, lunaNr));
  }

  const cheiLuni = Object.keys(luni).sort();

  return (
    <div className="app">
      <header className="top">
        <div className="top-row">
          <div className="brand">
            <img src="./icon-192.png" alt="" className="logo" />
            Program <i>birouri</i>
            <small>comparare program și fișe P1</small>
          </div>

          <nav className="nav">
            <button className={`pill-btn${pagina === 'import' ? ' primary' : ''}`} onClick={() => setPagina('import')}>Import</button>
            <button className={`pill-btn${pagina === 'program' ? ' primary' : ''}`} onClick={() => setPagina('program')} disabled={!program}>Program</button>
            <button className={`pill-btn${pagina === 'oameni' ? ' primary' : ''}`} onClick={() => setPagina('oameni')} disabled={!program}>Oameni</button>
          </nav>

          <div className="spatiu" />

          {cheiLuni.length > 0 && (
            <select className="sel" value={cheie} onChange={(e) => setCheie(e.target.value)}>
              {cheiLuni.map((k) => {
                const [a, m] = k.split('-');
                return <option key={k} value={k}>{NUME_LUNI[Number(m) - 1]} {a}</option>;
              })}
            </select>
          )}
          <button className="pill-btn" onClick={() => setTema(tema === 'dark' ? 'light' : 'dark')}>
            {tema === 'dark' ? 'Temă deschisă' : 'Temă închisă'}
          </button>
        </div>
      </header>

      <main className="corp">
        {dateVechiSterse && !program && (
          <div className="banda">
            Regulile de citire s-au schimbat, așa că importul vechi a fost șters.
            Încarcă din nou programul și fișele.
          </div>
        )}
        {pagina !== 'import' && program && legatura.panaLaZi != null && legatura.panaLaZi < program.zile && (
          <div className="banda">
            Fișele acoperă doar zilele {legatura.deLaZi ?? 1}–{legatura.panaLaZi} din {NUME_LUNI[program.luna - 1]}.
            Zilele de după rămân pe 0:00, pentru că nu avem încă informații despre ele.
          </div>
        )}
        {pagina === 'import' && (
          <Import program={program} fi={fi} legatura={legatura} onProgram={primesteProgram} onFI={primesteFI} />
        )}
        {pagina === 'program' && program && (
          <Grila program={program} legatura={legatura} onOm={setOmDeschis} />
        )}
        {pagina === 'oameni' && program && (
          <Oameni legatura={legatura} onOm={setOmDeschis} />
        )}
      </main>

      {omDeschis && program && (
        <Detalii om={omDeschis} zile={program.zile} an={program.an} luna={program.luna} onInchide={() => setOmDeschis(null)} />
      )}
    </div>
  );
}
