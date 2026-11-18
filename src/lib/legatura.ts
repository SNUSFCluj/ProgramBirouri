/** Legarea oamenilor din program de fișele lor individuale. */
import type { ImportFI, OmFI, OmProgram, Program } from '../types';
import { potriveste, type Candidat } from './nume';

export interface OmLegat {
  foaie: string;
  program: OmProgram;
  fi: OmFI | null;
  programMinute: number;
  realMinute: number;
}

export interface Legatura {
  oameni: OmLegat[];
  /** Oameni din program care nu au fișă (de obicei cei de la alt depou). */
  faraFisa: OmLegat[];
  /** Fișe care nu apar în programul încărcat. */
  faraProgram: OmFI[];
  /** Norma lunii, în ore, așa cum o scriu fișele. */
  norma: number | null;
}

export function leaga(program: Program | null, fi: ImportFI | null): Legatura {
  const candidati: Array<Candidat<OmFI>> = (fi?.oameni ?? []).map((o) => ({
    cheie: o.marca,
    nume: o.nume,
    date: o,
  }));
  const folosite = new Set<string>();
  const oameni: OmLegat[] = [];

  for (const foaie of program?.foi ?? []) {
    for (const om of foaie.oameni) {
      const disponibili = candidati.filter((c) => !folosite.has(c.cheie));
      const gasit = potriveste(om.nume, disponibili);
      if (gasit) folosite.add(gasit.cheie);
      oameni.push({
        foaie: foaie.nume,
        program: om,
        fi: gasit ? gasit.date : null,
        programMinute: Object.values(om.orePeZi).reduce((a, b) => a + b, 0),
        realMinute: gasit ? gasit.date.total : 0,
      });
    }
  }

  const norme = (fi?.oameni ?? []).map((o) => o.norma).filter((n): n is number => n != null);
  const norma = norme.length > 0 ? norme.sort((a, b) => norme.filter((x) => x === a).length - norme.filter((x) => x === b).length).pop()! : null;

  return {
    oameni,
    faraFisa: oameni.filter((o) => !o.fi),
    faraProgram: (fi?.oameni ?? []).filter((o) => !folosite.has(o.marca)),
    norma,
  };
}
