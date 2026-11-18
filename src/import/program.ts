/**
 * Citirea programului lunar din fișierul Excel al depoului.
 *
 * Structura fiecărei foi: rândul 6 are zilele 1..31 în coloanele E..AI.
 * Fiecare om ocupă patru rânduri — rândul cu numele, rândul dinaintea lui și
 * încă două după, ultimul fiind „Nr. Ore”. Unele foi au două tabele una sub
 * alta (foaia MAN), de aceea nu ne bazăm pe un singur antet.
 */
import * as XLSX from 'xlsx';
import type { FoaieProgram, OmProgram, Program } from '../types';
import { minuteDinCelula, zileInLuna } from '../lib/timp';

type Matrice = unknown[][];

const COL_NR = 0;      // A
const COL_NUME = 1;    // B
const COL_SCOALA = 2;  // C
const COL_REPORT = 3;  // D
const COL_ZI1 = 4;     // E
const COL_MENTIUNI = 37; // AL

const ETICHETE = ['nr. ore', 'nr.ore', 'numele si prenumele personalului de', 'locomotiva / automotor', 'crt.', 'nr.', 'depoul cluj', 'intocmit', 'nota:'];

function text(v: unknown): string {
  if (v == null) return '';
  return String(v).trim();
}

function esteEticheta(s: string): boolean {
  const t = s.toLowerCase();
  return ETICHETE.some((e) => t.startsWith(e));
}

/** Rândul cu numele: coloana A are un număr, coloana B un nume adevărat. */
function esteRandCuNume(rand: unknown[]): boolean {
  const nr = rand[COL_NR];
  const nume = text(rand[COL_NUME]);
  const areNumar = typeof nr === 'number' || /^\d+$/.test(text(nr));
  return areNumar && nume.length > 2 && !esteEticheta(nume);
}

function trenuriDinRand(rand: unknown[], zile: number): Record<number, string> {
  const out: Record<number, string> = {};
  for (let zi = 1; zi <= zile; zi++) {
    const v = text(rand[COL_ZI1 + zi - 1]);
    if (v) out[zi] = v;
  }
  return out;
}

function oreDinRand(rand: unknown[], zile: number): Record<number, number> {
  const out: Record<number, number> = {};
  for (let zi = 1; zi <= zile; zi++) {
    const m = minuteDinCelula(rand[COL_ZI1 + zi - 1]);
    if (m > 0) out[zi] = m;
  }
  return out;
}

/** Deduce luna și anul din numele fișierului: „…_01.10.2026_1.xlsx”. */
export function lunaDinNumeFisier(nume: string): { luna: number; an: number } | null {
  const m = /(\d{2})\.(\d{2})\.(\d{4})/.exec(nume);
  if (m) return { luna: Number(m[2]), an: Number(m[3]) };
  return null;
}

export function citesteProgram(
  buffer: ArrayBuffer,
  numeFisier: string,
  lunaAleasa?: { luna: number; an: number },
): Program {
  const wb = XLSX.read(buffer, { type: 'array' });
  const dedus = lunaAleasa ?? lunaDinNumeFisier(numeFisier) ?? {
    luna: new Date().getMonth() + 1,
    an: new Date().getFullYear(),
  };
  const zile = zileInLuna(dedus.an, dedus.luna);

  const foi: FoaieProgram[] = [];
  for (const numeFoaie of wb.SheetNames) {
    const ws = wb.Sheets[numeFoaie];
    if (!ws || !ws['!ref']) continue;
    const m = XLSX.utils.sheet_to_json<unknown[]>(ws, {
      header: 1,
      raw: true,
      blankrows: true,
      defval: null,
    }) as Matrice;
    if (m.length < 8) continue;

    const oameni: OmProgram[] = [];
    for (let i = 0; i < m.length; i++) {
      const rand = m[i] ?? [];
      if (!esteRandCuNume(rand)) continue;
      const sus = m[i - 1] ?? [];
      const jos = m[i + 1] ?? [];
      const randOre = m[i + 2] ?? [];
      // rândul de ore trebuie să conțină durate, altfel nu e un bloc valid
      const ore = oreDinRand(randOre, zile);
      const trenuri = [sus, rand, jos].map((r) => trenuriDinRand(r, zile));
      const areTrenuri = trenuri.some((t) => Object.keys(t).length > 0);
      if (Object.keys(ore).length === 0 && !areTrenuri) continue;

      const subtitlu = text(jos[COL_NUME]);
      oameni.push({
        nr: typeof rand[COL_NR] === 'number' ? (rand[COL_NR] as number) : Number(text(rand[COL_NR])) || null,
        nume: text(rand[COL_NUME]),
        subtitlu: esteEticheta(subtitlu) ? '' : subtitlu,
        randuriTrenuri: trenuri,
        orePeZi: ore,
        oreScoala: minuteDinCelula(randOre[COL_SCOALA]),
        oreReport: minuteDinCelula(randOre[COL_REPORT]),
        mentiuni: text(randOre[COL_MENTIUNI]),
      });
      i += 2; // sărim peste rândurile blocului
    }
    if (oameni.length > 0) foi.push({ nume: numeFoaie, oameni });
  }

  return { fisier: numeFisier, luna: dedus.luna, an: dedus.an, zile, foi };
}

/** Totalul de ore programate pentru un om, în minute. */
export function totalProgramat(om: OmProgram): number {
  return Object.values(om.orePeZi).reduce((a, b) => a + b, 0);
}
