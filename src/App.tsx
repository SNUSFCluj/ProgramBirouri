import { useEffect, useMemo, useState } from 'react';
import type { ImportFI, Luna, Program } from './types';
import { cheieLuna, citesteTema, dateVechiSterse, incarcaTot, salveazaFI, salveazaProgram, salveazaTot, scrieTema } from './store';
import { leaga, type OmLegat } from './lib/legatura';
import { NUME_LUNI } from './lib/timp';
import { Import } from './components/Import';
import { Grila } from './components/Grila';
import { Oameni } from './components/Oameni';
import { Detalii } from './components/Detalii';
import { SelectorLuna } from './components/SelectorLuna';

type Pagina = 'import' | 'program' | 'oameni';

export default function App() {
  const [luni, setLuni] = useState<Record<string, Luna>>(() => incarcaTot());
  // Pornim pe luna curentă; utilizatorul o schimbă din bara de sus.
  const [cheie, setCheie] = useState<string>(() => {
    const acum = new Date();
    return cheieLuna(acum.getFullYear(), acum.getMonth() + 1);
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

  // Importul intră întotdeauna în luna aleasă în bara de sus.
  const [anAles, lunaAleasa] = cheie.split('-').map(Number);

  function primesteProgram(p: Program) {
    setLuni((l) => salveazaProgram(l, p));
  }

  function primesteFI(f: ImportFI) {
    setLuni((l) => salveazaFI(l, f, anAles, lunaAleasa));
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
            <button className={`pill-btn${pagina === 'program' ? ' primary' : ''}`} onClick={() => setPagina('program')}>Program</button>
            <button className={`pill-btn${pagina === 'oameni' ? ' primary' : ''}`} onClick={() => setPagina('oameni')}>Oameni</button>
          </nav>

          <div className="spatiu" />

          <SelectorLuna cheie={cheie} cuDate={cheiLuni} onSchimba={setCheie} />
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
          <Import
            program={program}
            fi={fi}
            legatura={legatura}
            an={anAles}
            luna={lunaAleasa}
            onProgram={primesteProgram}
            onFI={primesteFI}
          />
        )}
        {pagina !== 'import' && !program && (
          <div className="gol-pagina">
            Nu e încărcat niciun program pentru {NUME_LUNI[lunaAleasa - 1]} {anAles}.
            Alege altă lună din bara de sus sau încarcă fișierele la Import.
          </div>
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
