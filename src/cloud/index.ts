/**
 * Salvarea online în Firestore.
 *
 * O lună = un document, cu datele puse ca text JSON. Luna întreagă are în jur
 * de 300 KB, deci intră lejer în limita de 1 MB a unui document, iar textul
 * ocolește regulile Firestore despre ce tipuri de date se pot păstra.
 *
 * Dacă proiectul Firebase nu e configurat, toate funcțiile de aici se poartă
 * ca și cum nu ar exista: aplicația rămâne pe datele din browser.
 */
import type { Luna } from '../types';
import { VERSIUNE_DATE } from '../store';
import { COLECTIA_LUNI, cloudPornit, configFirebase } from './config';

export type StareCloud = 'oprit' | 'pornit' | 'citeste' | 'scrie' | 'eroare';

interface Firestore {
  db: import('firebase/firestore').Firestore;
  fs: typeof import('firebase/firestore');
}

let pornire: Promise<Firestore | null> | null = null;

async function porneste(): Promise<Firestore | null> {
  if (!cloudPornit()) return null;
  if (!pornire) {
    pornire = (async () => {
      const [{ initializeApp, getApps }, fs] = await Promise.all([
        import('firebase/app'),
        import('firebase/firestore'),
      ]);
      const app = getApps()[0] ?? initializeApp(configFirebase);
      return { db: fs.getFirestore(app), fs };
    })().catch((e) => {
      console.error('Firebase nu a pornit', e);
      return null;
    });
  }
  return pornire;
}

/** O lună, așa cum stă în Firestore. */
interface DocLuna {
  cheie: string;
  versiune: string;
  actualizat: number;
  date: string;
}

function impacheteaza(luna: Luna): DocLuna {
  return {
    cheie: luna.cheie,
    versiune: VERSIUNE_DATE,
    actualizat: Date.now(),
    date: JSON.stringify({ program: luna.program, fi: luna.fi }),
  };
}

function despacheteaza(d: DocLuna): Luna | null {
  if (d.versiune !== VERSIUNE_DATE) return null; // citit cu reguli vechi
  try {
    const { program, fi } = JSON.parse(d.date) as Pick<Luna, 'program' | 'fi'>;
    return { cheie: d.cheie, program: program ?? null, fi: fi ?? null };
  } catch {
    return null;
  }
}

/** Aduce toate lunile salvate online. */
export async function incarcaLuni(): Promise<Record<string, Luna> | null> {
  const c = await porneste();
  if (!c) return null;
  const snap = await c.fs.getDocs(c.fs.collection(c.db, COLECTIA_LUNI));
  const out: Record<string, Luna> = {};
  snap.forEach((doc) => {
    const luna = despacheteaza(doc.data() as DocLuna);
    if (luna) out[luna.cheie] = luna;
  });
  return out;
}

/** Salvează o lună online. Întoarce fals dacă salvarea nu s-a putut face. */
export async function salveazaLuna(luna: Luna): Promise<boolean> {
  const c = await porneste();
  if (!c) return false;
  const pachet = impacheteaza(luna);
  if (pachet.date.length > 950_000) {
    throw new Error('Luna e prea mare pentru un document Firestore.');
  }
  await c.fs.setDoc(c.fs.doc(c.db, COLECTIA_LUNI, luna.cheie), pachet);
  return true;
}

/** Șterge o lună din baza de date. */
export async function stergeLuna(cheie: string): Promise<boolean> {
  const c = await porneste();
  if (!c) return false;
  await c.fs.deleteDoc(c.fs.doc(c.db, COLECTIA_LUNI, cheie));
  return true;
}

export { cloudPornit };
