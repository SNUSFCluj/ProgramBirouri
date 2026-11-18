/**
 * Logarea cu nume de utilizator și parolă.
 *
 * Parolele stau în Firebase Authentication, criptate, nu în codul aplicației și
 * nici în baza de date. Firebase lucrează cu adrese de e-mail, așa că numelui
 * de utilizator i se adaugă un domeniu intern: „simonamartian” devine
 * „simonamartian@programbirouri.ro”. Omul nu vede niciodată adresa.
 *
 * Conturile se fac din consola Firebase, de către cel care administrează
 * aplicația. Din aplicație nu se poate crea un cont nou.
 */
import { cloudPornit, configFirebase } from './config';

/** Domeniul intern, adăugat în spatele numelui de utilizator. */
export const DOMENIU = 'programbirouri.ro';

/** Contul care administrează tot și nu apare nicăieri în aplicație. */
export const SUPERADMIN = 'balanadrian';

export type Rol = 'superadmin' | 'admin';

export interface Cont {
  uid: string;
  /** Numele omului, scris în clar: „Balan Adrian”. */
  nume: string;
  utilizator: string;
  rol: Rol;
}

interface Auth {
  auth: import('firebase/auth').Auth;
  a: typeof import('firebase/auth');
}

let pornire: Promise<Auth | null> | null = null;

async function porneste(): Promise<Auth | null> {
  if (!cloudPornit()) return null;
  if (!pornire) {
    pornire = (async () => {
      const [{ initializeApp, getApps }, a] = await Promise.all([
        import('firebase/app'),
        import('firebase/auth'),
      ]);
      const app = getApps()[0] ?? initializeApp(configFirebase);
      return { auth: a.getAuth(app), a };
    })().catch((e) => {
      console.error('Autentificarea nu a pornit', e);
      return null;
    });
  }
  return pornire;
}

function contDinUtilizator(uid: string, email: string | null): Cont | null {
  if (!email) return null;
  const utilizator = email.split('@')[0].toLowerCase();
  return { uid, nume: utilizator, utilizator, rol: utilizator === SUPERADMIN ? 'superadmin' : 'admin' };
}

/**
 * Citește fișa de acces și oprește pe cine n-are voie.
 *
 * Fără fișă nu se intră: așa rămân pe dinafară conturile făcute pe altă cale
 * decât din fereastra Conturi.
 */
async function completeaza(cont: Cont): Promise<Cont> {
  const { contulMeu } = await import('./conturi');
  const salvat = await contulMeu(cont.uid);
  if (!salvat) {
    await iesi();
    throw new Error('Contul acesta n-are acces la aplicație.');
  }
  if (!salvat.activ) {
    await iesi();
    throw new Error('Contul acesta nu mai are voie să intre.');
  }
  return { ...cont, rol: salvat.rol, nume: salvat.nume || cont.utilizator };
}

/** Anunță cine e conectat. Prima dată trimite și contul ținut minte de browser. */
export async function urmaresteContul(cand: (cont: Cont | null) => void): Promise<void> {
  const c = await porneste();
  if (!c) { cand(null); return; }
  c.a.onAuthStateChanged(c.auth, (u) => {
    const cont = u ? contDinUtilizator(u.uid, u.email) : null;
    if (!cont) { cand(null); return; }
    completeaza(cont).then(cand).catch(() => cand(null));
  });
}

export async function intra(utilizator: string, parola: string): Promise<Cont> {
  const c = await porneste();
  if (!c) throw new Error('Salvarea online nu e configurată.');
  const email = `${utilizator.trim().toLowerCase()}@${DOMENIU}`;
  try {
    const r = await c.a.signInWithEmailAndPassword(c.auth, email, parola);
    const cont = contDinUtilizator(r.user.uid, r.user.email);
    if (!cont) throw new Error('Cont fără nume.');
    return await completeaza(cont);
  } catch (e) {
    throw new Error(mesajEroare(e));
  }
}

export async function iesi(): Promise<void> {
  const c = await porneste();
  if (c) await c.a.signOut(c.auth);
}

/** Schimbă parola contului conectat. Firebase cere parola veche înainte. */
export async function schimbaParola(parolaVeche: string, parolaNoua: string): Promise<void> {
  const c = await porneste();
  if (!c || !c.auth.currentUser || !c.auth.currentUser.email) {
    throw new Error('Nu ești conectat.');
  }
  try {
    const cred = c.a.EmailAuthProvider.credential(c.auth.currentUser.email, parolaVeche);
    await c.a.reauthenticateWithCredential(c.auth.currentUser, cred);
    await c.a.updatePassword(c.auth.currentUser, parolaNoua);
  } catch (e) {
    throw new Error(mesajEroare(e));
  }
}

function mesajEroare(e: unknown): string {
  const cod = (e as { code?: string }).code ?? '';
  switch (cod) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Numele de utilizator sau parola nu sunt bune.';
    case 'auth/too-many-requests':
      return 'Prea multe încercări. Mai așteaptă câteva minute.';
    case 'auth/weak-password':
      return 'Parola nouă e prea scurtă — trebuie cel puțin 6 caractere.';
    case 'auth/network-request-failed':
      return 'Nu am putut ajunge la server. Verifică legătura la internet.';
    default:
      return (e as Error).message || 'Ceva n-a mers.';
  }
}
