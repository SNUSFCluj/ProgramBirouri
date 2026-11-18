# Salvarea online (Firebase)

Aplicația merge și fără Firebase — atunci datele rămân doar în browser. Ca să
salveze online, trebuie completat `src/cloud/config.ts`.

## 1. Proiect nou

În consola Firebase (console.firebase.google.com):

1. **Add project** → nume: `ProgramBirouri` → Google Analytics se poate lăsa pe nu.
2. **Build → Firestore Database → Create database** → regiune `eur3 (europe-west)`
   → pornește în **production mode**.
3. **Project settings → General → Your apps → Web (`</>`)** → nume `programbirouri`
   → **Register app**. Se afișează un bloc `firebaseConfig`. Acele valori intră
   în `src/cloud/config.ts`.

## 2. Regulile bazei de date

Cât timp aplicația nu are logare, oricine are adresa poate citi și scrie.
Pentru testare, în **Firestore → Rules**:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /luni/{luna} {
      allow read, write: if true;
    }
  }
}
```

Când se adaugă logarea, regula devine `if request.auth != null;`.

## 3. Cum sunt păstrate datele

O lună = un document în colecția `luni`, cu numele lunii drept identificator
(`2026-10`). Documentul are patru câmpuri:

- `cheie` — luna, ca text
- `versiune` — versiunea regulilor de citire; dacă nu se potrivește cu cea din
  aplicație, luna e ignorată și fișierele trebuie importate din nou
- `actualizat` — când s-a scris ultima dată
- `date` — programul și fișele, ca text JSON (în jur de 300 KB pe lună, sub
  limita de 1 MB a unui document)

La pornire, aplicația aduce toate lunile din Firestore și le pune peste cele din
browser. La fiecare import, luna se scrie și online, iar în dreapta sus se vede
starea: „se salvează…”, „salvat în baza de date” sau „eroare la salvare”.
