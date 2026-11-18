# Program birouri

Aplicație pentru biroul de mișcare al Depoului Cluj Călători. Pune programul
lunar al personalului de locomotivă lângă orele lucrate în realitate și arată,
zi de zi și om cu om, unde se abat unele de la altele.

Programul lunii se încarcă din fișierul Excel al depoului, iar orele reale din
PDF-ul cu fișele individuale ale serviciului prestat (P1), scos din CARES.
Aplicația le potrivește singură pe nume, adaugă sub fiecare om un rând cu orele
reale și ține totul online, pe luni, ca să fie la îndemână de pe orice
calculator sau telefon.

## Ce face

- **Import** — se încarcă fișierul Excel cu programul lunii și PDF-ul cu fișele P1.
  După import se arată două liste de verificat: oamenii din program care nu au
  fișă și fișele care nu apar în program.
- **Program** — grila lunii, reprodusă ca în Excel (trei rânduri de trenuri și
  rândul „Nr. Ore”), cu un rând nou dedesubt: orele reale din fișă, pe fiecare zi.
- **Oameni** — toți oamenii în ordine alfabetică, cu căutare după nume și filtre
  pe foaie și funcție. Pentru fiecare: normă, ore programate, ore reale și
  diferența. Click pe nume deschide detaliul zi cu zi.

## Reguli de calcul

- **Orele reale** = coloanele 8–29 din fișa P1 (timp productiv și timp
  neproductiv). Nu se adună T. Simplificat (30), sporurile (31–35, timp noapte,
  festive, nocive, periculoase, grele), odihna (36) și nici coloana 7, care e
  doar totalul coloanelor 8–13.
- **Turele pe două zile** (ex. „16-17.oct”) se împart între cele două zile după
  ora de intrare și cea de ieșire din serviciu.
- **Potrivirea numelor** se face pe cel puțin două nume comune, iar când rămân
  mai mulți candidați câștigă potrivirea cea mai exactă. Așa se despart POP
  OVIDIU și POP PAVEL OVIDIU.
- Cine nu are fișă în PDF (de obicei personalul de la alt depou) apare în grilă
  cu avertizarea „fără fișă”.

## Conturi

Intrarea se face cu nume de utilizator și parolă. Conturile se fac din consola
Firebase, nu din aplicație; fiecare își poate schimba parola din meniul propriu.
Parolele stau criptate în Firebase Authentication, nu în cod și nici în baza de
date.

## Dezvoltare

```
npm install
npm run dev
```

Verificarea importatoarelor pe fișiere reale:

```
npx vite-node scripts/verifica.ts <program.xlsx> <fise.pdf> ["NUME OM"]
```

Datele se păstrează în Cloud Firestore, o lună per document, și în browser ca
rezervă. Vezi `FIREBASE.md`.
