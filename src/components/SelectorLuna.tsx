/** Alegerea lunii de lucru. Aceeași lună se folosește și la import, și la afișare. */
import { NUME_LUNI } from '../lib/timp';
import { cheieLuna } from '../store';

interface Props {
  cheie: string;
  /** Lunile care au deja date, ca să le putem marca. */
  cuDate: string[];
  onSchimba: (cheie: string) => void;
}

function desparte(cheie: string): { an: number; luna: number } {
  const [a, l] = cheie.split('-');
  return { an: Number(a), luna: Number(l) };
}

export function SelectorLuna({ cheie, cuDate, onSchimba }: Props) {
  const { an, luna } = desparte(cheie);
  const aniDinJur = new Set<number>([an, new Date().getFullYear()]);
  for (const k of cuDate) aniDinJur.add(desparte(k).an);
  const ani = [...aniDinJur].sort((a, b) => a - b);
  if (!ani.includes(an - 1)) ani.unshift(an - 1);
  if (!ani.includes(an + 1)) ani.push(an + 1);

  function muta(pas: number) {
    const total = (an * 12 + (luna - 1)) + pas;
    onSchimba(cheieLuna(Math.floor(total / 12), (total % 12) + 1));
  }

  return (
    <div className="selector-luna" title="Luna în care lucrăm">
      <button className="pill-btn sageata" onClick={() => muta(-1)} aria-label="Luna anterioară">‹</button>
      <select
        className="sel"
        value={luna}
        onChange={(e) => onSchimba(cheieLuna(an, Number(e.target.value)))}
        aria-label="Luna"
      >
        {NUME_LUNI.map((n, i) => (
          <option key={n} value={i + 1}>
            {n}
            {cuDate.includes(cheieLuna(an, i + 1)) ? ' •' : ''}
          </option>
        ))}
      </select>
      <select
        className="sel an"
        value={an}
        onChange={(e) => onSchimba(cheieLuna(Number(e.target.value), luna))}
        aria-label="Anul"
      >
        {ani.map((a) => <option key={a} value={a}>{a}</option>)}
      </select>
      <button className="pill-btn sageata" onClick={() => muta(1)} aria-label="Luna următoare">›</button>
    </div>
  );
}
