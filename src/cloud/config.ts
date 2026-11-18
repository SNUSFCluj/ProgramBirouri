/**
 * Datele proiectului Firebase.
 *
 * Se iau din consola Firebase: Project settings → General → Your apps →
 * aplicația web → SDK setup and configuration → Config.
 *
 * Cât timp apiKey e gol, aplicația lucrează doar în browser, fără salvare
 * online, și nimic nu se strică.
 */
export const configFirebase = {
  apiKey: '',
  authDomain: '',
  projectId: '',
  storageBucket: '',
  messagingSenderId: '',
  appId: '',
};

/** Colecția în care stau lunile, câte un document pe lună („2026-10”). */
export const COLECTIA_LUNI = 'luni';

export const cloudPornit = (): boolean => configFirebase.apiKey.length > 0 && configFirebase.projectId.length > 0;
