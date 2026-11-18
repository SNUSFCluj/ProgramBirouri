/**
 * Păstrarea datelor. Deocamdată totul stă în browser; structura e gândită ca
 * salvarea online (Firebase) să se poată adăuga fără să se schimbe restul.
 */
import type { ImportFI, Luna, Program } from './types';

const CHEIE = 'programBirouri.luni';
const CHEIE_TEMA = 'programBirouri.tema';

export function cheieLuna(an: number, luna: number): string {
  return `${an}-${String(luna).padStart(2, '0')}`;
}

export function incarcaTot(): Record<string, Luna> {
  try {
    const brut = localStorage.getItem(CHEIE);
    if (!brut) return {};
    return JSON.parse(brut) as Record<string, Luna>;
  } catch {
    return {};
  }
}

export function salveazaTot(luni: Record<string, Luna>): void {
  try {
    localStorage.setItem(CHEIE, JSON.stringify(luni));
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

export function citesteTema(): 'dark' | 'light' {
  return localStorage.getItem(CHEIE_TEMA) === 'light' ? 'light' : 'dark';
}

export function scrieTema(t: 'dark' | 'light'): void {
  localStorage.setItem(CHEIE_TEMA, t);
  document.documentElement.dataset.theme = t;
}
