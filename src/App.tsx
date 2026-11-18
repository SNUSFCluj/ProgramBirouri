import { useEffect, useMemo, useState } from 'react';
import type { ImportFI, Luna, Program } from './types';
import { citesteTema, citesteUltimaLuna, dateVechiSterse, incarcaTot, salveazaFI, salveazaProgram, salveazaTot, scrieTema, scrieUltimaLuna } from './store';
import { leaga, type OmLegat } from './lib/legatura';
import { NUME_LUNI } from './lib/timp';
import { Import } from './components/Import';
import { Grila } from './components/Grila';
import { Oameni } from './components/Oameni';
import { Detalii } from './components/Detalii';
import { SelectorLuna } from './components/SelectorLuna';
import { Jurnal } from './components/Jurnal';
import { VERSIUNE } from './jurnal';
import { cloudPornit, incarcaLuni, salveazaLuna, type StareCloud } from './cloud';
import { urmaresteContul, type Cont } from './cloud/auth';
import { Logare } from './components/Logare';
import { Meniu } from './components/Meniu';

type Pagina = 'import' | 'program' | 'oameni';

export default function App() {
  const [luni, setLuni] = useState<Record<string, Luna>>(() => incarcaTot());
  // Ținem minte luna deschisă ultima dată; prima oară pornim pe luna curentă.
  const [cheie, setCheie] = useState<string>(() => citesteUltimaLuna());
  const [pagina, setPagina] = useState<Pagina>('import');
  const [tema, setTema] = useState<'dark' | 'light'>(() => citesteTema());
  const [omDeschis, setOmDeschis] = useState<OmLegat | null>(null);
  const [jurnalD, setJurnalD] = useState(false);
  const [actualizat, setActualizat] = useState(false);

  // La prima deschidere după o actualizare, spunem că s-a schimbat ceva.
  useEffect(() => {
    try {
      const vazuta = localStorage.getItem('programBirouri.versiuneVazuta');
      if (vazuta && vazuta !== VERSIUNE) setActualizat(true);
      localStorage.setItem('programBirouri.versiuneVazuta', VERSIUNE);
    } catch { /* fără browser sau fără drept de scriere */ }
  }, []);
  const [stareCloud, setStareCloud] = useState<StareCloud>(cloudPornit() ? 'citeste' : 'oprit');
  const [eroareCloud, setEroareCloud] = useState('');
  const [cont, setCont] = useState<Cont | null>(null);
  const [verificaCont, setVerificaCont] = useState(cloudPornit());

  // Aflăm dacă browserul ține minte un cont conectat.
  useEffect(() => {
    if (!cloudPornit()) return;
    void urmaresteContul((c) => { setCont(c); setVerificaCont(false); });
  }, []);

  // La pornire aducem lunile salvate online și le punem peste cele din browser.
  useEffect(() => {
    if (!cloudPornit() || !cont) return;
    let valabil = true;
    incarcaLuni()
      .then((dinCloud) => {
        if (!valabil || !dinCloud) return;
        setLuni((l) => ({ ...l, ...dinCloud }));
        setStareCloud('pornit');
      })
      .catch((e: Error) => {
        if (!valabil) return;
        setStareCloud('eroare');
        setEroareCloud(e.message);
      });
    return () => { valabil = false; };
  }, [cont]);

  /** Salvează o lună și în browser, și online. */
  function pastreaza(schimba: (l: Record<string, Luna>) => Record<string, Luna>, cheieLunii: string) {
    setLuni((l) => {
      const nou = schimba(l);
      const lunaNoua = nou[cheieLunii];
      if (lunaNoua && cloudPornit()) {
        setStareCloud('scrie');
        salveazaLuna(lunaNoua)
          .then(() => { setStareCloud('pornit'); setEroareCloud(''); })
          .catch((e: Error) => { setStareCloud('eroare'); setEroareCloud(e.message); });
      }
      return nou;
    });
  }

  useEffect(() => { salveazaTot(luni); }, [luni]);
  useEffect(() => { scrieTema(tema); }, [tema]);
  useEffect(() => { scrieUltimaLuna(cheie); }, [cheie]);

  const luna = cheie ? luni[cheie] : undefined;
  const program = luna?.program ?? null;
  const fi = luna?.fi ?? null;
  const legatura = useMemo(() => leaga(program, fi), [program, fi]);

  // Importul intră întotdeauna în luna aleasă în bara de sus.
  const [anAles, lunaAleasa] = cheie.split('-').map(Number);

  function primesteProgram(p: Program) {
    pastreaza((l) => salveazaProgram(l, p), cheie);
  }

  function primesteFI(f: ImportFI) {
    pastreaza((l) => salveazaFI(l, f, anAles, lunaAleasa), cheie);
  }

  const cheiLuni = Object.keys(luni).sort();

  if (cloudPornit() && verificaCont) {
    return <div className="gol-pagina">Se verifică contul…</div>;
  }
  if (cloudPornit() && !cont) {
    return <Logare onIntrat={setCont} />;
  }

  return (
    <div className="app">
      <header className="top">
        <div className="top-row">
          <div className="top-stanga">
            <div className="brand">
              <img src="./icon-192.png" alt="" className="logo" />
              Program <i>birouri</i>
              <button className="versiune" onClick={() => setJurnalD(true)} title="Jurnal de versiuni">
                v{VERSIUNE}
              </button>
            </div>
            <nav className="nav">
              <button className={`pill-btn${pagina === 'import' ? ' primary' : ''}`} onClick={() => setPagina('import')}>Import</button>
              <button className={`pill-btn${pagina === 'program' ? ' primary' : ''}`} onClick={() => setPagina('program')}>Program</button>
              <button className={`pill-btn${pagina === 'oameni' ? ' primary' : ''}`} onClick={() => setPagina('oameni')}>Oameni</button>
            </nav>
          </div>

          <div className="top-mijloc">
            <SelectorLuna cheie={cheie} cuDate={cheiLuni} onSchimba={setCheie} />
          </div>

          <div className="top-dreapta">
            {stareCloud !== 'oprit' && (
              <span className={`stare-cloud ${stareCloud}`} title={eroareCloud || undefined}>
                {stareCloud === 'citeste' ? 'se încarcă…'
                  : stareCloud === 'scrie' ? 'se salvează…'
                  : stareCloud === 'eroare' ? 'eroare la salvare'
                  : 'salvat în baza de date'}
              </span>
            )}
            {cont && <Meniu cont={cont} onIesit={() => setCont(null)} onCont={setCont} />}
            <button className="pill-btn" onClick={() => setTema(tema === 'dark' ? 'light' : 'dark')}>
              {tema === 'dark' ? 'Temă deschisă' : 'Temă închisă'}
            </button>
          </div>
        </div>
      </header>

      <main className="corp">
        {actualizat && (
          <div className="banda clic" onClick={() => { setActualizat(false); setJurnalD(true); }}>
            Aplicația a fost actualizată la v{VERSIUNE}. Apasă aici ca să vezi ce s-a schimbat.
          </div>
        )}
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

      {jurnalD && <Jurnal onInchide={() => setJurnalD(false)} />}

      {omDeschis && program && (
        <Detalii om={omDeschis} zile={program.zile} an={program.an} luna={program.luna} onInchide={() => setOmDeschis(null)} />
      )}
    </div>
  );
}
