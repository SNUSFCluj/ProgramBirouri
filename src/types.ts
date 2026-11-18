/** Tipurile de date ale aplicației Program birouri. */

/** O persoană așa cum apare într-o foaie din programul lunar. */
export interface OmProgram {
  /** Numărul curent din foaie (coloana A). */
  nr: number | null;
  /** Numele exact cum e scris în Excel. */
  nume: string;
  /** Eticheta de sub nume, dacă există: „Ajutor”, „Mec Aj.” etc. */
  subtitlu: string;
  /** Cele trei rânduri de trenuri/coduri, pe zile: randuriTrenuri[rand][zi] (zi = 1..31). */
  randuriTrenuri: Array<Record<number, string>>;
  /** Rândul „Nr. Ore”: minute pe fiecare zi. */
  orePeZi: Record<number, number>;
  /** Ore școală (coloana C) și ore report (coloana D), în minute. */
  oreScoala: number;
  oreReport: number;
  /** Mențiuni (coloana AL). */
  mentiuni: string;
}

/** O foaie din programul lunar (EA LP, EA SP, EGM + DSR, MAN …). */
export interface FoaieProgram {
  nume: string;
  oameni: OmProgram[];
}

/** Programul lunar importat din Excel. */
export interface Program {
  /** Numele fișierului din care s-a importat. */
  fisier: string;
  /** Luna, 1..12, dedusă din fișier sau aleasă de utilizator. */
  luna: number;
  an: number;
  /** Numărul de zile ale lunii. */
  zile: number;
  foi: FoaieProgram[];
}

/** Detaliul unei linii din fișa individuală (FI / P1). */
export interface LinieFI {
  /** Ziua de început (1..31). */
  zi: number;
  /** Ziua de sfârșit, pentru turele pe două zile. */
  ziFinal: number;
  /** Foaia de parcurs / trenul, cum apare în FI. */
  tren: string;
  /** Intrare și ieșire din serviciu, în minute de la miezul nopții (null dacă lipsesc). */
  intrare: number | null;
  iesire: number | null;
  /** Minutele pe fiecare coloană care intră în normă, pe numărul coloanei (8..29). */
  coloane: Record<number, number>;
  /** Totalul liniei, în minute. */
  total: number;
}

/** Fișa individuală a unei persoane pe luna importată. */
export interface OmFI {
  marca: string;
  nume: string;
  functia: string;
  /** Norma lunii, în ore, așa cum o scrie FI („Turnus (176 ore în această lună)”). */
  norma: number | null;
  linii: LinieFI[];
  /** Minutele care intră în normă, repartizate pe zile (turele de 2 zile sunt împărțite). */
  orePeZi: Record<number, number>;
  /** Totalul lunii, în minute. */
  total: number;
}

/** Fișele individuale importate din PDF. */
export interface ImportFI {
  fisier: string;
  luna: number | null;
  an: number | null;
  /** Perioada acoperită de fișe, citită din antet („Luna: 01.10.2026 - 10.10.2026”). */
  deLaZi: number | null;
  panaLaZi: number | null;
  oameni: OmFI[];
}

/** Legătura dintre o persoană din program și fișa ei. */
export interface Potrivire {
  foaie: string;
  numeProgram: string;
  marca: string | null;
  numeFI: string | null;
}

/** Tot ce ține de o lună de lucru. */
export interface Luna {
  cheie: string; // „2026-10”
  program: Program | null;
  fi: ImportFI | null;
}
