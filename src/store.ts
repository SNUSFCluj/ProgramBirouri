/**
 * Păstrarea datelor. Deocamdată totul stă în browser; structura e gândită ca
 * salvarea online (Firebase) să se poată adăuga fără să se schimbe restul.
 */
import type { ImportFI, Luna, Program } from './types';

const CHEIE = 'programBirouri.luni';
const CHEIE_TEMA = 'programBirouri.tema';
const CHEIE_VERSIUNE = 'programBirouri.versiuneDate';

/**
 * Se schimbă ori de câte ori se modifică felul în care se citesc fișierele.
 * Datele salvate mai demult se șterg atunci, ca să nu rămână pe ecran cifre
 * calculate cu regulile vechi; fișierele trebuie încărcate din nou.
 */
export const VERSIUNE_DATE = '6';

export function cheieLuna(an: number, luna: number): string {
  return `${an}-${String(luna).padStart(2, '0')}`;
}

/** Adevărat dacă la pornire am găsit date salvate cu regulile vechi. */
export let dateVechiSterse = false;

export function incarcaTot(): Record<string, Luna> {
  try {
    const brut = localStorage.getItem(CHEIE);
    if (!brut) return {};
    if (localStorage.getItem(CHEIE_VERSIUNE) !== VERSIUNE_DATE) {
      localStorage.removeItem(CHEIE);
      localStorage.setItem(CHEIE_VERSIUNE, VERSIUNE_DATE);
      dateVechiSterse = true;
      return {};
    }
    return JSON.parse(brut) as Record<string, Luna>;
  } catch {
    return {};
  }
}

export function salveazaTot(luni: Record<string, Luna>): void {
  try {
    localStorage.setItem(CHEIE, JSON.stringify(luni));
    localStorage.setItem(CHEIE_VERSIUNE, VERSIUNE_DATE);
  } catch (e) {
    console.warn('Nu am putut salva în browser', e);
  }
}

export function salveazaProgram(luni: Record<string, Luna>, program: Program): Record<string, Luna> {
  const cheie = cheieLuna(program.an, program.luna);
  const veche = luni[cheie] ?? { cheie, program: null, fi: null };
  return { ...luni, [cheie]: { ...veche, cheie, program } };
}

export function salveazaFI(luni: Record<string, Luna>, fi: ImportFI, an: number, luna: number): Record<string, Luna> {
  const cheie = cheieLuna(an, luna);
  const veche = luni[cheie] ?? { cheie, program: null, fi: null };
  return { ...luni, [cheie]: { ...veche, cheie, fi } };
}

const CHEIE_ULTIMA_LUNA = 'programBirouri.ultimaLuna';

/** Luna deschisă ultima dată; dacă nu există, luna curentă. */
export function citesteUltimaLuna(): string {
  try {
    const v = localStorage.getItem(CHEIE_ULTIMA_LUNA);
    if (v && /^\d{4}-\d{2}$/.test(v)) return v;
  } catch { /* fără browser sau fără drept de scriere */ }
  const d = new Date();
  return cheieLuna(d.getFullYear(), d.getMonth() + 1);
}

export function scrieUltimaLuna(cheie: string): void {
  try { localStorage.setItem(CHEIE_ULTIMA_LUNA, cheie); } catch { /* ignorăm */ }
}

/** Tema implicită e cea deschisă, în roz. */
/**
 * Scoate programul sau fișele dintr-o lună. Dacă luna rămâne goală de tot, o
 * ștergem cu totul, ca să nu mai apară marcată ca având date.
 */
export function stergeDinLuna(
  luni: Record<string, Luna>,
  cheie: string,
  ce: 'program' | 'fi',
): Record<string, Luna> {
  const veche = luni[cheie];
  if (!veche) return luni;
  const noua: Luna = { ...veche, [ce]: null };
  const out = { ...luni };
  if (!noua.program && !noua.fi) delete out[cheie];
  else out[cheie] = noua;
  return out;
}

export function citesteTema(): 'dark' | 'light' {
  return localStorage.getItem(CHEIE_TEMA) === 'dark' ? 'dark' : 'light';
}

export function scrieTema(t: 'dark' | 'light'): void {
  localStorage.setItem(CHEIE_TEMA, t);
  document.documentElement.dataset.theme = t;
}
