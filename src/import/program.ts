/**
 * Citirea programului lunar din Excelul depoului.
 *
 * Trebuie să meargă pe două feluri de fișiere: cel scris de mână și cel scos
 * din ProgramDepoulCluj. Nu se potrivesc între ele:
 *
 * - rândul cu zilele e pe 6 la unul, pe 7 la celălalt;
 * - zilele încep în coloana E la foile cu mecanici, dar în C la foile de
 *   turanți, care n-au „Ore școală” și „Ore report”;
 * - numărul de zile e al lunii, nu mereu 31;
 * - la fișierul scris de mână numele stă pe al doilea rând din patru, iar
 *   orele pe al patrulea; la export numele e pe primul, orele tot pe al
 *   patrulea;
 * - pe foile de turanți și de manevră fiecare om are un singur rând, cu orele
 *   trecute direct lângă nume.
 *
 * De aceea nu presupunem nimic: căutăm rândul cu zilele, aflăm de unde încep
 * coloanele, iar rândul cu orele îl recunoaștem după ce scrie în el — durate,
 * nu numere de tren.
 */
import * as XLSX from 'xlsx';
import type { FoaieProgram, OmProgram, Program } from '../types';
import { minuteDinCelula, zileInLuna } from '../lib/timp';

type Matrice = unknown[][];

const COL_NR = 0;   // A
const COL_NUME = 1; // B

const ETICHETE = [
  'nr. ore', 'nr.ore', 'numele si prenumele', 'numele și prenumele', 'nr. crt',
  'locomotiva', 'depoul cluj', 'intocmit', 'întocmit', 'nota:', 'aprobat',
  'program de lucru', 'grafic de serviciu', 'valabil din', 'luna ',
];

function text(v: unknown): string {
  return v == null ? '' : String(v).trim();
}

function esteEticheta(s: string): boolean {
  const t = s.toLowerCase();
  return ETICHETE.some((e) => t.startsWith(e));
}

function numar(v: unknown): number | null {
  if (typeof v === 'number') return Number.isInteger(v) ? v : null;
  const t = text(v);
  return /^\d+$/.test(t) ? Number(t) : null;
}

/** Rândul cu zilele: 1, 2, 3… pe coloane alăturate. Întoarce unde încep și câte sunt. */
function gasesteZilele(m: Matrice): { rand: number; col: number; zile: number } | null {
  for (let r = 0; r < Math.min(m.length, 20); r++) {
    const rand = m[r] ?? [];
    for (let c = 1; c < Math.min(rand.length, 12); c++) {
      if (numar(rand[c]) !== 1) continue;
      let zile = 1;
      while (numar(rand[c + zile]) === zile + 1) zile++;
      if (zile >= 28) return { rand: r, col: c, zile };
    }
  }
  return null;
}

/** Cât de mult seamănă rândul cu unul de ore: durate, nu numere de tren. */
function scorDurate(rand: unknown[], col: number, zile: number): number {
  let scor = 0;
  for (let i = 0; i < zile; i++) {
    const v = rand[col + i];
    if (v == null || v === '') continue;
    if (typeof v === 'number') {
      // Ora Excel e o fracțiune de zi; orele scrise simplu sunt 1…24;
      // numerele de tren sunt mult mai mari.
      if (v > 0 && v <= 24) scor++; else scor--;
    } else if (v instanceof Date) {
      scor++;
    } else {
      const t = text(v);
      if (/^\d{1,3}:\d{2}/.test(t)) scor++;
      else if (/^\d{3,}$/.test(t)) scor--;
    }
  }
  return scor;
}

function trenuriDinRand(rand: unknown[], col: number, zile: number): Record<number, string> {
  const out: Record<number, string> = {};
  for (let zi = 1; zi <= zile; zi++) {
    const v = text(rand[col + zi - 1]);
    if (v) out[zi] = v;
  }
  return out;
}

function oreDinRand(rand: unknown[], col: number, zile: number): Record<number, number> {
  const out: Record<number, number> = {};
  for (let zi = 1; zi <= zile; zi++) {
    const minute = minuteDinCelula(rand[col + zi - 1]);
    if (minute > 0) out[zi] = minute;
  }
  return out;
}

/** Deduce luna și anul din numele fișierului: „…_01.10.2026_1.xlsx”. */
export function lunaDinNumeFisier(nume: string): { luna: number; an: number } | null {
  const m = /(\d{2})\.(\d{2})\.(\d{4})/.exec(nume);
  return m ? { luna: Number(m[2]), an: Number(m[3]) } : null;
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
  const zileLuna = zileInLuna(dedus.an, dedus.luna);

  const foi: FoaieProgram[] = [];
  for (const numeFoaie of wb.SheetNames) {
    const ws = wb.Sheets[numeFoaie];
    if (!ws || !ws['!ref']) continue;
    const m = XLSX.utils.sheet_to_json<unknown[]>(ws, {
      header: 1, raw: true, blankrows: true, defval: null,
    }) as Matrice;
    if (m.length < 8) continue;

    const cap = gasesteZilele(m);
    if (!cap) continue;
    const { col: colZi1, zile: zileFoaie } = cap;
    const zile = Math.min(zileFoaie, zileLuna);
    // „Ore școală” și „Ore report” stau înaintea zilelor, dar numai pe foile
    // care le au: la turanți zilele încep imediat după nume.
    const colScoala = colZi1 >= 4 ? colZi1 - 2 : -1;
    const colReport = colZi1 >= 4 ? colZi1 - 1 : -1;
    const colMentiuni = colZi1 + zileFoaie + 3;

    const randuriNume: number[] = [];
    for (let r = cap.rand + 1; r < m.length; r++) {
      const rand = m[r] ?? [];
      const nume = text(rand[COL_NUME]);
      if (numar(rand[COL_NR]) == null) continue;
      if (nume.length < 3 || esteEticheta(nume)) continue;
      randuriNume.push(r);
    }

    const oameni: OmProgram[] = [];
    let folositPanaLa = cap.rand + 1; // rândul cu zilele de săptămână
    for (let i = 0; i < randuriNume.length; i++) {
      const rNume = randuriNume[i];
      const rUrmator = randuriNume[i + 1] ?? m.length;
      const rand = m[rNume] ?? [];

      // Rândul cu orele: cel mai „durată” dintre rândurile blocului.
      let rOre = rNume;
      let celMaiBun = -Infinity;
      for (let r = Math.max(rNume - 1, folositPanaLa + 1); r < Math.min(rUrmator, rNume + 4); r++) {
        const scor = scorDurate(m[r] ?? [], colZi1, zile);
        if (scor > celMaiBun) { celMaiBun = scor; rOre = r; }
      }
      if (celMaiBun <= 0) rOre = rNume; // om fără ore trecute

      const randOre = m[rOre] ?? [];
      const trenuri: Array<Record<number, string>> = [];
      if (rOre !== rNume) {
        for (let r = rOre - 3; r < rOre; r++) {
          if (r <= folositPanaLa || r < 0) continue;
          trenuri.push(trenuriDinRand(m[r] ?? [], colZi1, zile));
        }
      }
      while (trenuri.length < 3) trenuri.push({});

      const subtitlu = text((m[rNume + 1] ?? [])[COL_NUME]);
      oameni.push({
        nr: numar(rand[COL_NR]),
        nume: text(rand[COL_NUME]),
        subtitlu: rOre === rNume || esteEticheta(subtitlu) ? '' : subtitlu,
        randuriTrenuri: trenuri,
        orePeZi: oreDinRand(randOre, colZi1, zile),
        oreScoala: colScoala >= 0 ? minuteDinCelula(randOre[colScoala]) : 0,
        oreReport: colReport >= 0 ? minuteDinCelula(randOre[colReport]) : 0,
        mentiuni: text(randOre[colMentiuni]),
      });
      folositPanaLa = Math.max(rOre, rNume);
    }

    if (oameni.length > 0) foi.push({ nume: numeFoaie, oameni });
  }

  return { fisier: numeFisier, luna: dedus.luna, an: dedus.an, zile: zileLuna, foi };
}

/** Totalul de ore programate pentru un om, în minute. */
export function totalProgramat(om: OmProgram): number {
  return Object.values(om.orePeZi).reduce((a, b) => a + b, 0);
}
