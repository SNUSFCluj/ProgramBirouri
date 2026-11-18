/**
 * Jurnalul de versiuni.
 *
 * La fiecare modificare a aplicației: crește VERSIUNE și adaugă o intrare nouă
 * SUS, în capul listei. Numărul se vede în bară, iar lista se deschide cu un
 * clic pe el.
 */
export const VERSIUNE = '1.7';

export interface Intrare {
  v: string;
  data: string;
  titlu: string;
  schimbari: string[];
}

export const JURNAL: Intrare[] = [
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
