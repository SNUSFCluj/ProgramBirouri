# Program birouri

Compară programul lunar al personalului de locomotivă (Excel, Depoul Cluj) cu
orele reale din fișele individuale ale serviciului prestat (PDF P1, CARES).

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

## Dezvoltare

```
npm install
npm run dev
```

Verificarea importatoarelor pe fișiere reale:

```
npx vite-node scripts/verifica.ts <program.xlsx> <fise.pdf> ["NUME OM"]
```

Datele se păstrează deocamdată în browser (localStorage). Salvarea online în
Firebase se adaugă în pasul următor.
