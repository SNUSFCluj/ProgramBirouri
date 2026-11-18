/** Lucrul cu durate exprimate în minute. */

/** „07:30” → 450. Acceptă și ore întregi scrise simplu („8” → 480). */
export function citesteDurata(text: string): number | null {
  const t = text.trim().replace(/[’']/g, '');
  if (!t) return null;
  const hm = /^(\d{1,3}):(\d{2})$/.exec(t);
  if (hm) return Number(hm[1]) * 60 + Number(hm[2]);
  if (/^\d{1,2}$/.test(t)) return Number(t) * 60;
  return null;
}

/** 450 → „07:30”. Orele pot trece de 24 (total pe lună). */
export function scrieDurata(minute: number): string {
  const m = Math.round(minute);
  const semn = m < 0 ? '-' : '';
  const a = Math.abs(m);
  return `${semn}${String(Math.floor(a / 60)).padStart(2, '0')}:${String(a % 60).padStart(2, '0')}`;
}

/** Valoarea unei celule Excel cu format de oră → minute. */
export function minuteDinCelula(v: unknown): number {
  if (v == null || v === '') return 0;
  if (typeof v === 'number') {
    // Excel ține orele ca fracțiune de zi.
    if (v > 0 && v < 10) return Math.round(v * 24 * 60);
    return 0;
  }
  if (v instanceof Date) return v.getHours() * 60 + v.getMinutes();
  const d = citesteDurata(String(v));
  return d == null ? 0 : d;
}

/** Numărul de zile ale lunii. */
export function zileInLuna(an: number, luna: number): number {
  return new Date(an, luna, 0).getDate();
}

export const NUME_LUNI = [
  'ianuarie', 'februarie', 'martie', 'aprilie', 'mai', 'iunie',
  'iulie', 'august', 'septembrie', 'octombrie', 'noiembrie', 'decembrie',
];

/** Abrevierile de lună folosite în fișele P1 („oct.”, „noi.”). */
export const LUNI_SCURT: Record<string, number> = {
  ian: 1, feb: 2, mar: 3, apr: 4, mai: 5, iun: 6,
  iul: 7, aug: 8, sep: 9, oct: 10, noi: 11, nov: 11, dec: 12,
};
