/**
 * Alegerea lunii de lucru, ca la programul mecanicilor: un singur buton cu luna
 * și anul, care deschide un calendar cu cele douăsprezece luni. Aceeași lună se
 * folosește și la import, și la afișare.
 */
import { useEffect, useRef, useState } from 'react';
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

export function lunaCurenta(): string {
  const d = new Date();
  return cheieLuna(d.getFullYear(), d.getMonth() + 1);
}

function numeLuna(cheie: string): string {
  const { an, luna } = desparte(cheie);
  return `${NUME_LUNI[luna - 1]} ${an}`;
}

export function SelectorLuna({ cheie, cuDate, onSchimba }: Props) {
  const [deschis, setDeschis] = useState(false);

  function muta(pas: number) {
    const { an, luna } = desparte(cheie);
    const total = an * 12 + (luna - 1) + pas;
    onSchimba(cheieLuna(Math.floor(total / 12), (total % 12) + 1));
  }

  return (
    <div className="luna-zona">
      <button className="pill-btn sageata" onClick={() => muta(-1)} aria-label="Luna anterioară">‹</button>
      <button
        className={`pill-btn luna-btn${deschis ? ' primary' : ''}`}
        onClick={() => setDeschis(!deschis)}
        title="Alege luna din tot anul"
        aria-expanded={deschis}
      >
        {numeLuna(cheie)}
      </button>
      {deschis && (
        <Calendar
          cheie={cheie}
          cuDate={cuDate}
          onAlege={(k) => { onSchimba(k); setDeschis(false); }}
          onInchide={() => setDeschis(false)}
        />
      )}
      <button className="pill-btn sageata" onClick={() => muta(1)} aria-label="Luna următoare">›</button>
    </div>
  );
}

function Calendar({ cheie, cuDate, onAlege, onInchide }: {
  cheie: string;
  cuDate: string[];
  onAlege: (k: string) => void;
  onInchide: () => void;
}) {
  const [an, setAn] = useState(desparte(cheie).an);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const clic = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onInchide();
    };
    const tasta = (e: KeyboardEvent) => { if (e.key === 'Escape') onInchide(); };
    document.addEventListener('mousedown', clic);
    document.addEventListener('keydown', tasta);
    return () => {
      document.removeEventListener('mousedown', clic);
      document.removeEventListener('keydown', tasta);
    };
  }, [onInchide]);

  const azi = lunaCurenta();

  return (
    <div className="luna-pop" ref={ref}>
      <div className="luna-pop-h">
        <button className="pill-btn sageata mic" onClick={() => setAn(an - 1)} aria-label="Anul anterior">‹</button>
        <b className="mono">{an}</b>
        <button className="pill-btn sageata mic" onClick={() => setAn(an + 1)} aria-label="Anul următor">›</button>
      </div>
      <div className="luna-grid">
        {NUME_LUNI.map((nume, i) => {
          const k = cheieLuna(an, i + 1);
          const clase = [k === cheie ? 'on' : '', k === azi ? 'azi' : '', cuDate.includes(k) ? 'cu-date' : ''].filter(Boolean).join(' ');
          return (
            <button key={k} className={clase} onClick={() => onAlege(k)} title={cuDate.includes(k) ? 'Are date încărcate' : undefined}>
              {nume}
            </button>
          );
        })}
      </div>
    </div>
  );
}
