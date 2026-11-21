/**
 * Buton de ștergere cu confirmare din două clicuri.
 *
 * Nu folosim fereastra `confirm()` a browserului: în previzualizarea din AI
 * Studio pagina stă într-un cadru care o blochează fără să spună nimic, așa că
 * ștergerea pare că nu face nimic. Al doilea clic confirmă, iar dacă omul se
 * răzgândește butonul se dezarmează singur după câteva secunde.
 */
import { useEffect, useRef, useState } from 'react';

interface Props {
  /** Ce se șterge, scris scurt: „programul lunii octombrie”. */
  ce: string;
  onSterge: () => void;
  /** Buton mic, pentru rândurile dintr-un tabel. */
  mic?: boolean;
}

export function ButonSterge({ ce, onSterge, mic }: Props) {
  const [armat, setArmat] = useState(false);
  const ceas = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(ceas.current), []);

  function apasa() {
    if (armat) {
      window.clearTimeout(ceas.current);
      setArmat(false);
      onSterge();
      return;
    }
    setArmat(true);
    ceas.current = window.setTimeout(() => setArmat(false), 5000);
  }

  return (
    <button
      className={`pill-btn${mic ? ' mic-btn' : ''} rau-btn${armat ? ' armat' : ''}`}
      onClick={apasa}
      title={armat ? 'Mai apasă o dată ca să ștergi' : `Șterge ${ce}`}
    >
      {armat ? 'Sigur? Mai apasă o dată' : mic ? 'Șterge' : '✕ Șterge'}
    </button>
  );
}
