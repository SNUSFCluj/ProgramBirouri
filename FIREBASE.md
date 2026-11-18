# Salvarea online (Firebase)

Proiectul e configurat în `src/cloud/config.ts` și e gata de folosit. Ce
urmează e pentru cine trebuie să refacă sau să înțeleagă montajul.

## 1. Proiect nou

În consola Firebase (console.firebase.google.com):

1. **Add project** → nume: `ProgramBirouri` → Google Analytics se poate lăsa pe nu.
2. **Build → Firestore Database → Create database** → regiune `eur3 (europe-west)`
   → pornește în **production mode**.
3. **Project settings → General → Your apps → Web (`</>`)** → nume `programbirouri`
   → **Register app**. Se afișează un bloc `firebaseConfig`. Acele valori intră
   în `src/cloud/config.ts`.

## 2. Regulile bazei de date

Lunile le poate citi și scrie doar un cont conectat și nebloca. Conturile le
poate schimba doar cel care administrează aplicația, iar fiecare își poate
scrie documentul propriu la prima intrare:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function fisa() {
      return get(/databases/$(database)/documents/conturi/$(request.auth.uid)).data;
    }
    function administrez() {
      return request.auth != null && fisa().rol == 'superadmin';
    }
    match /conturi/{uid} {
      allow get: if request.auth != null && (request.auth.uid == uid || administrez());
      allow list, create, update, delete: if administrez();
    }
    match /luni/{luna} {
      allow read, write: if request.auth != null && fisa().activ == true;
    }
  }
}
```

Cheia e colecția `conturi`: un document pe cont, cu identificatorul dat de
Firebase. Documentul acesta e fișa de acces. Fără el nu se intră în aplicație,
oricât de valid ar fi contul în Firebase Authentication. Fișele le scrie doar
cel care administrează aplicația, din fereastra Conturi.

Asta închide o portiță: cheile unei aplicații web sunt în pagină, la vedere,
așa că oricine și-ar putea face cont în Firebase. Un astfel de cont rămâne fără
fișă, deci fără acces. Fiecare admin își poate citi doar propria fișă; lista
întreagă o vede doar cel care administrează.

## 2b. Conturile

**Authentication → Sign-in method** are pornit **Email/Password**. Conturile se
adaugă din **Authentication → Users → Add user**.

Aplicația cere nume de utilizator, nu adresă de e-mail: pune singură domeniul
intern `@programbirouri.ro` în spatele numelui. Așadar contul `simonamartian` se
creează cu adresa `simonamartian@programbirouri.ro`.

Contul `balanadrian` e cel care administrează tot și nu apare nicăieri în
aplicație sub numele lui. Numele celui care administrează e scris în
`src/cloud/auth.ts`, la `SUPERADMIN`.

Conturile noi se fac și din aplicație, din meniul celui care o administrează,
la **Conturi**. Un cont se poate bloca și debloca de acolo; ștergerea de tot se
face doar din consola Firebase. Colecția `conturi` din Firestore ține numele de
utilizator, rolul și dacă are voie să intre — un document pe cont, cu
identificatorul dat de Firebase.

Fiecare își schimbă parola din meniul propriu, din dreapta sus. Firebase cere
parola veche înainte de a o schimba pe cea nouă, care trebuie să aibă cel puțin
șase caractere. Parolele nu stau nici în cod, nici în baza de date.

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
