/**
 * Citirea fișelor individuale ale serviciului prestat (P1) din PDF-ul CARES.
 *
 * Fiecare pagină are un tabel cu 37 de coloane numerotate. Coloanele le aflăm
 * din rândul de numere 1…37, iar fiecare valoare ajunge în coloana cu centrul
 * cel mai apropiat. Intră în norma de lucru coloanele 8–29 (timp productiv și
 * timp neproductiv). Rămân pe dinafară T. Simplificat (30), sporurile (31–35),
 * odihna (36) și timpul în serviciu (7), care e doar totalul coloanelor 8–13.
 */
import type { ImportFI, LinieFI, OmFI } from '../types';
import { LUNI_SCURT, citesteDurata } from '../lib/timp';

export const NUME_COLOANE: Record<number, string> = {
  1: 'Zi', 2: 'Foaie parcurs', 3: 'Regim de lucru', 4: 'Locomotivă',
  5: 'Intrare în serviciu', 6: 'Ieșire din serviciu', 7: 'Timp în serviciu',
  8: 'Turnus', 9: 'Tură', 10: 'Recunoaștere', 11: 'Alte activități',
  12: 'Ore alte funcții', 13: 'MSC', 14: 'Regie', 15: 'Rezervă', 16: 'Așteptare',
  17: 'Supraveghere', 18: 'Școală', 19: 'Siguranța circulației', 20: 'Vizită medicală',
  21: 'CO', 22: 'CM', 23: 'Creștere copil', 24: 'CFS', 25: 'Absențe', 26: 'ZLP+DS',
  27: 'Diverse', 28: 'ST+G+R', 29: 'Ore compensare', 30: 'T. Simplificat',
  31: 'Timp noapte', 32: 'Timp festive', 33: 'Nocive', 34: 'Periculoase',
  35: 'Grele', 36: 'Odihnă', 37: 'Denumire funcție',
};

/** Coloanele care intră în norma de lucru. */
export const COLOANE_NORMA: number[] = Array.from({ length: 22 }, (_, i) => i + 8); // 8..29

interface Cuvant { text: string; x: number; y: number; latime: number; }

/** Un item de text din PDF poate conține mai multe cuvinte; le despărțim pe x. */
function desparte(str: string, x: number, latime: number, y: number): Cuvant[] {
  const bucati = str.split(/\s+/).filter((s) => s.length > 0);
  if (bucati.length <= 1) return bucati.length === 1 ? [{ text: bucati[0], x, y, latime }] : [];
  const total = str.length || 1;
  const out: Cuvant[] = [];
  let poz = 0;
  for (const b of bucati) {
    const start = str.indexOf(b, poz);
    poz = start + b.length;
    out.push({
      text: b,
      x: x + (start / total) * latime,
      latime: (b.length / total) * latime,
      y,
    });
  }
  return out;
}

function centre(randuri: Cuvant[][]): Record<number, number> | null {
  for (const rand of randuri) {
    const t = rand.map((c) => c.text);
    if (t[0] === '1' && t[1] === '2' && t[2] === '3' && t[3] === '4' && t[4] === '5') {
      const out: Record<number, number> = {};
      for (const c of rand) {
        if (/^\d{1,2}$/.test(c.text)) {
          const n = Number(c.text);
          if (n >= 1 && n <= 37 && out[n] === undefined) out[n] = c.x + c.latime / 2;
        }
      }
      if (Object.keys(out).length >= 30) return out;
    }
  }
  return null;
}

function limite(cen: Record<number, number>): Array<[number, number, number]> {
  const chei = Object.keys(cen).map(Number).sort((a, b) => a - b);
  return chei.map((k, i) => {
    const jos = i === 0 ? -Infinity : (cen[chei[i - 1]] + cen[k]) / 2;
    const sus = i === chei.length - 1 ? Infinity : (cen[k] + cen[chei[i + 1]]) / 2;
    return [k, jos, sus] as [number, number, number];
  });
}

function coloanaLui(x: number, lim: Array<[number, number, number]>): number | null {
  for (const [k, jos, sus] of lim) if (x >= jos && x < sus) return k;
  return null;
}

const RE_ZI = /^(\d{1,2})(?:-(\d{1,2}))?\.([a-zăâîșţșt]+)\.?$/i;

/** Împarte minutele unei ture de două zile după ora de intrare și de ieșire. */
function imparte(total: number, intrare: number | null, iesire: number | null): [number, number] {
  if (intrare == null || iesire == null || iesire <= 0) return [Math.round(total / 2), total - Math.round(total / 2)];
  const prima = 24 * 60 - intrare;
  const suma = prima + iesire;
  if (suma <= 0) return [total, 0];
  const a = Math.round((total * prima) / suma);
  return [a, total - a];
}

export interface ProgresFI { pagina: number; total: number; }

export async function citesteFI(
  buffer: ArrayBuffer,
  numeFisier: string,
  onProgres?: (p: ProgresFI) => void,
): Promise<ImportFI> {
  const pdfjs = await import('pdfjs-dist');
  if (!pdfjs.GlobalWorkerOptions.workerSrc) {
    const worker = await import('pdfjs-dist/build/pdf.worker.mjs?url');
    pdfjs.GlobalWorkerOptions.workerSrc = (worker as { default: string }).default;
  }

  const doc = await pdfjs.getDocument({ data: buffer }).promise;
  const dupaMarca = new Map<string, OmFI>();
  let luna: number | null = null;
  let an: number | null = null;

  for (let p = 1; p <= doc.numPages; p++) {
    const pagina = await doc.getPage(p);
    const continut = await pagina.getTextContent();
    const cuvinte: Cuvant[] = [];
    for (const item of continut.items as Array<{ str: string; transform: number[]; width: number }>) {
      if (!item.str || !item.str.trim()) continue;
      cuvinte.push(...desparte(item.str, item.transform[4], item.width, item.transform[5]));
    }
    onProgres?.({ pagina: p, total: doc.numPages });
    if (cuvinte.length === 0) continue;

    // grupăm pe rânduri după y
    const grupe = new Map<number, Cuvant[]>();
    for (const c of cuvinte) {
      const k = Math.round(c.y / 3);
      const g = grupe.get(k);
      if (g) g.push(c); else grupe.set(k, [c]);
    }
    const randuri = [...grupe.entries()]
      .sort((a, b) => b[0] - a[0]) // y mare = sus în pagină
      .map(([, v]) => v.sort((a, b) => a.x - b.x));

    const textPagina = randuri.map((r) => r.map((c) => c.text).join(' ')).join('\n');

    const mNume = /de c[aă]tre \S+ (.+?) \[(\d+)\] Pagina/.exec(textPagina);
    if (!mNume) continue;
    const nume = mNume[1].trim();
    const marca = mNume[2];

    let om = dupaMarca.get(marca);
    if (!om) {
      const mFunc = /Func[țţ]ia: (.+?)(?: Perioada:|$)/m.exec(textPagina);
      const mNorma = /Turnus \((\d+) ore/.exec(textPagina);
      om = {
        marca,
        nume,
        functia: mFunc ? mFunc[1].trim() : '',
        norma: mNorma ? Number(mNorma[1]) : null,
        linii: [],
        orePeZi: {},
        total: 0,
      };
      dupaMarca.set(marca, om);
    }

    const mPer = /Luna: (\d{2})\.(\d{2})\.(\d{4})/.exec(textPagina);
    if (mPer && luna == null) { luna = Number(mPer[2]); an = Number(mPer[3]); }

    const cen = centre(randuri);
    if (!cen) continue;
    const lim = limite(cen);

    for (const rand of randuri) {
      const mzi = RE_ZI.exec(rand[0].text);
      if (!mzi) continue;
      const abrev = mzi[3].slice(0, 3).toLowerCase();
      if (!(abrev in LUNI_SCURT)) continue;
      const zi = Number(mzi[1]);
      const ziFinal = mzi[2] ? Number(mzi[2]) : zi;

      const linie: LinieFI = { zi, ziFinal, tren: '', intrare: null, iesire: null, coloane: {}, total: 0 };
      const trenBucati: string[] = [];
      for (const c of rand.slice(1)) {
        const col = coloanaLui(c.x + c.latime / 2, lim);
        if (col == null) continue;
        if (col === 2) trenBucati.push(c.text);
        else if (col === 5) linie.intrare = citesteDurata(c.text);
        else if (col === 6) linie.iesire = citesteDurata(c.text);
        else if (COLOANE_NORMA.includes(col)) {
          const v = citesteDurata(c.text);
          if (v != null) linie.coloane[col] = (linie.coloane[col] ?? 0) + v;
        }
      }
      linie.tren = trenBucati.join(' ');
      linie.total = Object.values(linie.coloane).reduce((a, b) => a + b, 0);
      if (linie.total === 0 && !linie.tren) continue;
      om.linii.push(linie);

      if (linie.total > 0) {
        if (ziFinal !== zi) {
          const [a, b] = imparte(linie.total, linie.intrare, linie.iesire);
          om.orePeZi[zi] = (om.orePeZi[zi] ?? 0) + a;
          om.orePeZi[ziFinal] = (om.orePeZi[ziFinal] ?? 0) + b;
        } else {
          om.orePeZi[zi] = (om.orePeZi[zi] ?? 0) + linie.total;
        }
        om.total += linie.total;
      }
    }
  }

  const oameni = [...dupaMarca.values()].sort((a, b) => a.nume.localeCompare(b.nume, 'ro'));
  return { fisier: numeFisier, luna, an, oameni };
}
