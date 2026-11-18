/**
 * Învelișul comun al ferestrelor care se deschid peste pagină.
 *
 * Conținutul se scrie în rădăcina paginii, nu acolo unde e chemat în cod.
 * Altfel, o fereastră pornită dintr-un buton din bara de sus ar rămâne prinsă
 * în ea: bara are `backdrop-filter`, iar un astfel de element devine punctul de
 * referință pentru tot ce e `position: fixed` înăuntrul lui, așa că fereastra
 * s-ar așeza față de bară, nu față de ecran, și ar intra sub restul paginii.
 */
import { useEffect } from 'react';
import { createPortal } from 'react-dom';

export function Fereastra({ onInchide, children }: { onInchide: () => void; children: React.ReactNode }) {
  useEffect(() => {
    const tasta = (e: KeyboardEvent) => { if (e.key === 'Escape') onInchide(); };
    document.addEventListener('keydown', tasta);
    return () => document.removeEventListener('keydown', tasta);
  }, [onInchide]);

  return createPortal(
    <div className="modal-fundal" onClick={onInchide}>{children}</div>,
    document.body,
  );
}
