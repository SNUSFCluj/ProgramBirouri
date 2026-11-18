/**
 * Potrivirea numelor dintre programul lunar și fișele individuale.
 *
 * În program numele sunt scrise prescurtat („ROSCA LUCIAN”), în fișe complet
 * („ROSCA PETRU LUCIAN”). Regula stabilită: se potrivesc dacă au cel puțin două
 * nume comune. Când rămân mai mulți candidați, câștigă cel cu cea mai mică
 * diferență de nume — așa se despart POP OVIDIU și POP PAVEL OVIDIU.
 */

/** Scoate diacriticele, semnele și sufixul de dezambiguizare („POP OVIDIU 2”). */
export function cuvinteNume(nume: string): string[] {
  return nume
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[șşŞȘ]/g, 's')
    .replace(/[țţŢȚ]/g, 't')
    .replace(/[-–_.]/g, ' ')
    .toUpperCase()
    .split(/\s+/)
    .filter((c) => c.length > 0 && !/^\d+$/.test(c));
}

export function numeNormalizat(nume: string): string {
  return cuvinteNume(nume).join(' ');
}

export interface Candidat<T> {
  cheie: string;
  nume: string;
  date: T;
}

/** Caută fișa unei persoane din program printre fișele disponibile. */
export function potriveste<T>(numeProgram: string, candidati: Array<Candidat<T>>): Candidat<T> | null {
  const a = new Set(cuvinteNume(numeProgram));
  if (a.size === 0) return null;
  let best: Candidat<T> | null = null;
  let bestScor = Infinity;
  for (const c of candidati) {
    const b = new Set(cuvinteNume(c.nume));
    let comune = 0;
    for (const w of a) if (b.has(w)) comune++;
    if (comune < 2) continue;
    // diferența simetrică: cu cât mai mică, cu atât potrivirea e mai exactă
    let dif = 0;
    for (const w of a) if (!b.has(w)) dif++;
    for (const w of b) if (!a.has(w)) dif++;
    if (dif < bestScor) {
      bestScor = dif;
      best = c;
    }
  }
  return best;
}
