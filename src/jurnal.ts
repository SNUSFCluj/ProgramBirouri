/**
 * Jurnalul de versiuni.
 *
 * La fiecare modificare a aplicației: crește VERSIUNE și adaugă o intrare nouă
 * SUS, în capul listei. Numărul se vede în bară, iar lista se deschide cu un
 * clic pe el.
 */
export const VERSIUNE = '2.1';

export interface Intrare {
  v: string;
  data: string;
  titlu: string;
  schimbari: string[];
}

export const JURNAL: Intrare[] = [
  {
    v: '2.1',
    data: '2026-11-22',
    titlu: 'Citește și programul exportat din ProgramDepoulCluj',
    schimbari: [
      'Cititorul nu mai presupune nimic despre așezarea fișierului: caută singur rândul cu zilele, află de unde încep coloanele și câte zile are luna.',
      'Rândul cu orele îl recunoaște după ce scrie în el — durate, nu numere de tren — așa că nu mai contează dacă numele stă pe primul rând al blocului, ca la export, sau pe al doilea, ca la fișierul scris de mână.',
      'Merge și pe foile unde fiecare om are un singur rând, cu orele lângă nume: turanți, revizori, acari, pompagii, manevră.',
      'Prinde și foile fără coloanele „Ore școală” și „Ore report”, unde zilele încep imediat după nume.',
      'Verificat pe amândouă fișierele: cel scris de mână pe octombrie (4 foi, 59 de oameni) și exportul pe noiembrie (6 foi, 79 de oameni).',
    ],
  },
  {
    v: '2.0',
    data: '2026-11-22',
    titlu: 'Cap secție și sortare pe coloane',
    schimbari: [
      'Coloana Cap secție: totalul orelor de odihnă pe lună, adunat din coloana „Odihnă” a fișei. Odihna nu intră în norma de lucru, se arată doar ca s-o ai la îndemână.',
      'Coloana Diferență s-a întors: real minus programat.',
      'Un clic pe capul oricărei coloane cu cifre sortează de la mare la mic, al doilea de la mic la mare, al treilea revine la ordinea alfabetică. O săgeată arată starea.',
      'Cine n-are cifra — de pildă omul fără fișă — rămâne la coada listei, în ambele sensuri.',
    ],
  },
  {
    v: '1.9',
    data: '2026-11-22',
    titlu: 'Festive și ore suplimentare, luate din fișe',
    schimbari: [
      'Pagina Oameni are patru coloane noi, citite din caseta „Totaluri lunare” a fișei: Festive, Festive peste normă, Rămân (ore suplimentare finale) și Plătite.',
      'Cifrele se iau ca atare din fișă, nu se recalculează. Fișa socotește altfel decât o simplă scădere din normă — la BALAN ADRIAN, de pildă, real minus normă dă 31:45, iar fișa scrie 18 ore suplimentare finale. Astea sunt cifrele oficiale, cele după care se face plata.',
      'Vechea coloană Diferență a fost înlocuită: ce rămâne pe luna următoare se citește acum din fișă, nu din scăderea noastră.',
      'Aceleași cifre apar și în fereastra cu detaliile unui om.',
    ],
  },
  {
    v: '1.8',
    data: '2026-11-18',
    titlu: 'Datele Firebase rezistă la rescrierea din AI Studio',
    schimbari: [
      'AI Studio rescrie codul la import: scoate datele Firebase din fișier și le pune ca variabile de mediu, care rămân goale. Aplicația pornea atunci fără bază de date — fără logare, fără conturi, fără salvare online — și intra oricine direct.',
      'Acum variabilele de mediu sunt doar o posibilitate. Când lipsesc, se folosesc valorile scrise în cod, așa că aplicația merge la fel indiferent unde e compilată.',
      'Dacă totuși rămâne fără bază de date, nu mai lasă pe nimeni înăuntru: arată un mesaj că lipsește configurarea.',
    ],
  },
  {
    v: '1.7',
    data: '2026-11-18',
    titlu: 'Jurnal de versiuni',
    schimbari: [
      'Numărul versiunii apare în bară, lângă numele aplicației. Un clic pe el deschide jurnalul.',
      'Când aplicația e actualizată, la prima deschidere apare o înștiințare care trimite la jurnal.',
      'Așa se vede dintr-o privire dacă pagina publicată are ultimele modificări sau a rămas la un build vechi.',
    ],
  },
  {
    v: '1.6',
    data: '2026-11-18',
    titlu: 'Bara nu mai taie butonul contului',
    schimbari: [
      'Butonul cu numele contului dispărea: bara avea trei coloane de lățime 1fr, care nu coboară sub lățimea minimă a conținutului. Când butoanele nu mai încăpeau, bara se lățea peste marginea ecranului, iar zona din dreapta ieșea din pagină.',
      'Coloanele sunt acum minmax(0, 1fr), deci au voie să se strângă, iar butoanele trec pe rândul următor în loc să fie împinse afară.',
      'Butonul contului a fost mutat înaintea celui de temă, ca el să fie ultimul care s-ar strânge.',
    ],
  },
  {
    v: '1.5',
    data: '2026-11-18',
    titlu: 'Ferestrele ies în față; fără fișă de acces nu se intră',
    schimbari: [
      'Ferestrele se scriu acum direct în pagină, nu în bara de sus. Bara are backdrop-filter, iar un astfel de element devine punctul de referință pentru tot ce e position: fixed înăuntrul lui — de aceea fereastra Conturi rămânea prinsă în bară și intra sub restul paginii.',
      'Fiecare cont are în baza de date o fișă de acces. Fără ea nu se intră, oricât de valid ar fi contul în Firebase. Așa rămâne pe dinafară cine și-ar face cont pe altă cale.',
      'Lista conturilor o vede doar cel care administrează aplicația; un admin își poate citi doar propria fișă.',
    ],
  },
  {
    v: '1.3',
    data: '2026-11-18',
    titlu: 'Conturi',
    schimbari: [
      'Fereastra Conturi: cont nou cu nume, nume de utilizator și parolă inițială; tabel cu rol, acces și ștergere.',
      'În bară apare numele scris în clar al contului, nu numele de logare.',
      'Numele se schimbă cu un clic pe el, în tabelul de conturi.',
    ],
  },
  {
    v: '1.1',
    data: '2026-11-18',
    titlu: 'Logare',
    schimbari: [
      'Intrarea se face cu nume de utilizator și parolă. Parolele stau criptate în Firebase Authentication, nu în cod și nici în baza de date.',
      'Fiecare își schimbă parola din meniul propriu.',
      'Tema roz a devenit cea implicită.',
    ],
  },
  {
    v: '1.0',
    data: '2026-11-18',
    titlu: 'Salvare online',
    schimbari: [
      'Lunile se salvează în Cloud Firestore, una per document, și se văd de pe orice calculator sau telefon.',
      'Starea salvării apare în dreapta sus.',
    ],
  },
  {
    v: '0.7',
    data: '2026-11-18',
    titlu: 'Luni',
    schimbari: [
      'Un singur buton cu luna și anul, care deschide un calendar cu cele douăsprezece luni.',
      'Luna rămâne reținută între vizite; prima dată pornește pe luna curentă.',
      'Tot ce se importă intră în luna aleasă.',
    ],
  },
  {
    v: '0.5',
    data: '2026-11-18',
    titlu: 'Orele reale, corectate',
    schimbari: [
      'Orele din altă funcție erau numărate de două ori: fișa le trece și la Turnus, și la „Ore alte funcții”. Acum se folosește „Timp în serviciu”, totalul scris chiar de fișă.',
      'Foaia MAN scrie orele ca număr simplu (12, 5, 7), nu ca oră Excel — erau citite ca zile.',
      'Funcția se citește fără legenda din colțul fișei, care se lipea de ea.',
    ],
  },
  {
    v: '0.1',
    data: '2026-11-18',
    titlu: 'Prima versiune',
    schimbari: [
      'Import din Excelul depoului și din PDF-ul cu fișele P1.',
      'Grila lunii, reprodusă ca în Excel, cu un rând nou dedesubt: orele reale.',
      'Pagina Oameni, alfabetică, cu căutare, filtre și detalii zi cu zi.',
    ],
  },
];
