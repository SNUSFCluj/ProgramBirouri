/**
 * Datele proiectului Firebase „ProgramBirouri”.
 *
 * Nu sunt secrete: cheia web a Firebase e publică prin fire, la orice aplicație
 * web. Ce se poate citi sau scrie hotărăsc regulile bazei de date și contul cu
 * care intri, nu cheia.
 *
 * Se pot pune și ca variabile de mediu (VITE_FIREBASE_*), dacă mediul în care
 * se compilează aplicația ține la asta. Când lipsesc — și lipsesc aproape
 * întotdeauna, fiindcă nimeni nu le completează — se folosesc valorile scrise
 * aici. Altfel aplicația ar porni fără bază de date: fără logare, fără conturi
 * și fără salvare online, lăsând pe oricine să intre.
 */
const dinMediu = import.meta.env as unknown as Record<string, string | undefined>;

function ia(cheie: string, implicit: string): string {
  const v = dinMediu[cheie];
  return v && v.trim().length > 0 ? v : implicit;
}

export const configFirebase = {
  apiKey: ia('VITE_FIREBASE_API_KEY', 'AIzaSyAnVdF4CJ6NHXlqpaBWBxtJvDdva-O6oJc'),
  authDomain: ia('VITE_FIREBASE_AUTH_DOMAIN', 'programbirouri.firebaseapp.com'),
  projectId: ia('VITE_FIREBASE_PROJECT_ID', 'programbirouri'),
  storageBucket: ia('VITE_FIREBASE_STORAGE_BUCKET', 'programbirouri.firebasestorage.app'),
  messagingSenderId: ia('VITE_FIREBASE_MESSAGING_SENDER_ID', '374870431990'),
  appId: ia('VITE_FIREBASE_APP_ID', '1:374870431990:web:9568dbe7c9db116f16b4d7'),
};

/** Colecția în care stau lunile, câte un document pe lună („2026-10”). */
export const COLECTIA_LUNI = 'luni';

export const cloudPornit = (): boolean => configFirebase.apiKey.length > 0 && configFirebase.projectId.length > 0;
