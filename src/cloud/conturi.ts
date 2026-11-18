/**
 * Conturile aplicației.
 *
 * Parolele le ține Firebase Authentication. În Firestore, colecția `conturi`
 * păstrează doar cine e cine: numele de utilizator, rolul și dacă e lăsat să
 * intre. Un document pe cont, cu identificatorul dat de Firebase (uid).
 *
 * Contul nou se face dintr-o a doua legătură cu Firebase, separată de cea pe
 * care lucrează omul conectat. Altfel Firebase l-ar conecta pe loc pe cel
 * nou-creat, iar cel care administrează ar fi dat afară din propria sesiune.
 */
import type { FirebaseApp } from 'firebase/app';
import { cloudPornit, configFirebase } from './config';
import { DOMENIU, SUPERADMIN, type Rol } from './auth';

export const COLECTIA_CONTURI = 'conturi';

export interface ContSalvat {
  uid: string;
  /** Numele omului, scris în clar: „Simona Marțian”. */
  nume: string;
  /** Numele cu care intră în aplicație. */
  utilizator: string;
  rol: Rol;
  /** Fals = nu mai poate intra, dar contul rămâne în listă. */
  activ: boolean;
  /** Adevărat = scos din listă de tot; nu mai poate intra niciodată. */
  sters?: boolean;
  creat: number;
}

interface Legatura {
  app: FirebaseApp;
  fs: typeof import('firebase/firestore');
  db: import('firebase/firestore').Firestore;
}

let legatura: Promise<Legatura | null> | null = null;

async function porneste(): Promise<Legatura | null> {
  if (!cloudPornit()) return null;
  if (!legatura) {
    legatura = (async () => {
      const [{ initializeApp, getApps }, fs] = await Promise.all([
        import('firebase/app'),
        import('firebase/firestore'),
      ]);
      const app = getApps()[0] ?? initializeApp(configFirebase);
      return { app, fs, db: fs.getFirestore(app) };
    })().catch(() => null);
  }
  return legatura;
}

/**
 * Aduce contul din baza de date. Dacă nu există încă — cazul conturilor făcute
 * direct din consola Firebase — îl scrie acum, ca să apară în listă.
 */
export async function contulMeu(uid: string, utilizator: string): Promise<ContSalvat | null> {
  const c = await porneste();
  if (!c) return null;
  const ref = c.fs.doc(c.db, COLECTIA_CONTURI, uid);
  const snap = await c.fs.getDoc(ref);
  if (snap.exists()) return snap.data() as ContSalvat;

  const nou: ContSalvat = {
    uid,
    nume: utilizator,
    utilizator,
    rol: utilizator === SUPERADMIN ? 'superadmin' : 'admin',
    activ: true,
    creat: Date.now(),
  };
  await c.fs.setDoc(ref, nou);
  return nou;
}

/** Conturile, fără cele șterse. Cel care administrează se vede doar pe sine. */
export async function listaConturi(uidulMeu: string): Promise<ContSalvat[]> {
  const c = await porneste();
  if (!c) return [];
  const snap = await c.fs.getDocs(c.fs.collection(c.db, COLECTIA_CONTURI));
  const out: ContSalvat[] = [];
  snap.forEach((d) => {
    const cont = d.data() as ContSalvat;
    if (cont.sters) return;
    if (cont.rol === 'superadmin' && cont.uid !== uidulMeu) return;
    out.push(cont);
  });
  return out.sort((a, b) => {
    if (a.rol !== b.rol) return a.rol === 'superadmin' ? -1 : 1;
    return (a.nume || a.utilizator).localeCompare(b.nume || b.utilizator, 'ro');
  });
}

/** Face un cont nou, fără să-l scoată din sesiune pe cel care îl creează. */
export async function faceCont(nume: string, utilizator: string, parola: string): Promise<ContSalvat> {
  const c = await porneste();
  if (!c) throw new Error('Salvarea online nu e configurată.');
  const utilizatorul = utilizator.trim().toLowerCase();
  if (!/^[a-z0-9._-]{3,}$/.test(utilizatorul)) {
    throw new Error('Numele de utilizator poate avea doar litere mici, cifre, punct, liniuță sau underscore, cel puțin trei.');
  }
  if (utilizatorul === SUPERADMIN) throw new Error('Numele acesta e deja luat.');
  if (parola.length < 6) throw new Error('Parola trebuie să aibă cel puțin șase caractere.');

  const [{ initializeApp, deleteApp }, a] = await Promise.all([
    import('firebase/app'),
    import('firebase/auth'),
  ]);
  const aparte = initializeApp(configFirebase, `cont-nou-${Date.now()}`);
  try {
    const auth = a.getAuth(aparte);
    const r = await a.createUserWithEmailAndPassword(auth, `${utilizatorul}@${DOMENIU}`, parola);
    const cont: ContSalvat = {
      uid: r.user.uid,
      nume: nume.trim() || utilizatorul,
      utilizator: utilizatorul,
      rol: 'admin',
      activ: true,
      creat: Date.now(),
    };
    await c.fs.setDoc(c.fs.doc(c.db, COLECTIA_CONTURI, cont.uid), cont);
    await a.signOut(auth);
    return cont;
  } catch (e) {
    const cod = (e as { code?: string }).code ?? '';
    if (cod === 'auth/email-already-in-use') throw new Error('Există deja un cont cu numele acesta.');
    if (cod === 'auth/weak-password') throw new Error('Parola e prea scurtă — cel puțin șase caractere.');
    throw new Error((e as Error).message);
  } finally {
    await deleteApp(aparte).catch(() => {});
  }
}

/** Oprește sau repornește accesul unui cont. */
export async function schimbaAccesul(uid: string, activ: boolean): Promise<void> {
  const c = await porneste();
  if (!c) return;
  await c.fs.updateDoc(c.fs.doc(c.db, COLECTIA_CONTURI, uid), { activ });
}

/** Schimbă numele scris în clar al unui cont. */
export async function redenumeste(uid: string, nume: string): Promise<void> {
  const c = await porneste();
  if (!c) return;
  await c.fs.updateDoc(c.fs.doc(c.db, COLECTIA_CONTURI, uid), { nume: nume.trim() });
}

/**
 * Scoate contul din listă și îi taie accesul pentru totdeauna.
 *
 * Documentul rămâne în baza de date, marcat ca șters: dacă l-am șterge de tot,
 * omul ar intra din nou și aplicația i-ar scrie alt document, cu acces bun.
 * Contul din Firebase Authentication se șterge doar din consolă.
 */
export async function stergeCont(uid: string): Promise<void> {
  const c = await porneste();
  if (!c) return;
  await c.fs.updateDoc(c.fs.doc(c.db, COLECTIA_CONTURI, uid), { activ: false, sters: true });
}
