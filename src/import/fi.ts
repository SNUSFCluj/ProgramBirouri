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

/**
 * Totalul unui rând, când fișa nu scrie „Timp în serviciu”.
 *
 * Coloana 12, „Ore alte funcții”, arată că omul a lucrat în altă funcție, iar
 * orele acelea sunt trecute și la Turnus sau la Tură. Le numărăm o singură
 * dată: coloana 12 intră la socoteală doar când rândul nu are alte ore
 * productive — cazul turanților, care au totul acolo.
 */
export function totalDinColoane(coloane: Record<number, number>): number {
  let productiv = 0;
  for (const c of [8, 9, 10, 11, 13]) productiv += coloane[c] ?? 0;
  if (productiv === 0) productiv = coloane[12] ?? 0;
  let neproductiv = 0;
  for (let c = 14; c <= 29; c++) neproductiv += coloane[c] ?? 0;
  return productiv + neproductiv;
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
  let deLaZi: number | null = null;
  let panaLaZi: number | null = null;

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
      // Funcția stă în stânga paginii. În dreapta, pe aceeași linie, fișa are o
      // legendă („CM”, „CM în zi Liberă”), care nu face parte din funcție.
      let functia = '';
      for (const rand of randuri) {
        if (/^Func[țţ]ia:?$/.test(rand[0].text)) {
          functia = rand.slice(1).filter((c) => c.x < 500).map((c) => c.text).join(' ').trim();
          break;
        }
      }
      const mNorma = /Turnus \((\d+) ore/.exec(textPagina);
      // Cifra stă de obicei după etichetă, dar uneori cade pe rândul de
      // deasupra, cum se întâmplă la „Ore suplimentare plătite”. O căutăm în
      // ambele părți.
      const cifra = (eticheta: string): number | null => {
        const dupa = new RegExp(`${eticheta}\\s+(-?\\d+)`).exec(textPagina);
        if (dupa) return Number(dupa[1]);
        const inainte = new RegExp(`(-?\\d+)\\s+${eticheta}`).exec(textPagina);
        return inainte ? Number(inainte[1]) : null;
      };
      om = {
        marca,
        nume,
        functia,
        norma: mNorma ? Number(mNorma[1]) : null,
        festiveInNorma: cifra('Festive în normă'),
        festivePesteNorma: cifra('Festive peste normă'),
        suplimentareFinale: cifra('Ore suplimentare finale'),
        suplimentarePlatite: cifra('Ore suplimentare plătite'),
        linii: [],
        orePeZi: {},
        total: 0,
      };
      dupaMarca.set(marca, om);
    }

    const mPer = /Luna: (\d{2})\.(\d{2})\.(\d{4})\s*-\s*(\d{2})\.(\d{2})\.(\d{4})/.exec(textPagina);
    if (mPer && luna == null) {
      luna = Number(mPer[2]);
      an = Number(mPer[3]);
      deLaZi = Number(mPer[1]);
      panaLaZi = Number(mPer[4]);
    }

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

      const linie: LinieFI = { zi, ziFinal, tren: '', intrare: null, iesire: null, coloane: {}, timpInServiciu: null, total: 0 };
      const trenBucati: string[] = [];
      for (const c of rand.slice(1)) {
        const col = coloanaLui(c.x + c.latime / 2, lim);
        if (col == null) continue;
        if (col === 2) trenBucati.push(c.text);
        else if (col === 5) linie.intrare = citesteDurata(c.text);
        else if (col === 6) linie.iesire = citesteDurata(c.text);
        else if (col === 7) linie.timpInServiciu = citesteDurata(c.text);
        else if (COLOANE_NORMA.includes(col)) {
          const v = citesteDurata(c.text);
          if (v != null) linie.coloane[col] = (linie.coloane[col] ?? 0) + v;
        }
      }
      linie.tren = trenBucati.join(' ');
      // „Timp în serviciu” e totalul rândului scris chiar de fișă. Îl folosim
      // când există, pentru că unele ore apar de două ori pe rând: o dată la
      // Turnus și încă o dată la „Ore alte funcții”, când omul a lucrat în
      // altă funcție. Adunarea coloanelor le-ar socoti de două ori.
      linie.total = linie.timpInServiciu ?? totalDinColoane(linie.coloane);
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
  // dacă antetul nu dă perioada, o deducem din ultima zi care apare în fișe
  if (panaLaZi == null) {
    let max = 0;
    for (const o of oameni) for (const l of o.linii) max = Math.max(max, l.ziFinal);
    panaLaZi = max > 0 ? max : null;
    if (deLaZi == null) deLaZi = 1;
  }
  return { fisier: numeFisier, luna, an, deLaZi, panaLaZi, oameni };
}
