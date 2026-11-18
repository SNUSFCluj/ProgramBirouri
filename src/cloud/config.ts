/**
 * Datele proiectului Firebase „ProgramBirouri”.
 *
 * Nu sunt secrete: cheia web a Firebase e publică prin fire, iar ce se poate
 * citi sau scrie îl hotărăsc regulile bazei de date, nu cheia.
 *
 * Cât timp apiKey e gol, aplicația lucrează doar în browser, fără salvare
 * online, și nimic nu se strică.
 */
export const configFirebase = {
  apiKey: 'AIzaSyAnVdF4CJ6NHXlqpaBWBxtJvDdva-O6oJc',
  authDomain: 'programbirouri.firebaseapp.com',
  projectId: 'programbirouri',
  storageBucket: 'programbirouri.firebasestorage.app',
  messagingSenderId: '374870431990',
  appId: '1:374870431990:web:9568dbe7c9db116f16b4d7',
};

/** Colecția în care stau lunile, câte un document pe lună („2026-10”). */
export const COLECTIA_LUNI = 'luni';

export const cloudPornit = (): boolean => configFirebase.apiKey.length > 0 && configFirebase.projectId.length > 0;
