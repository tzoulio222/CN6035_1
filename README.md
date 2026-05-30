# StageLine - Theatre Booking System

Το StageLine είναι μια ολοκληρωμένη πλατφόρμα κρατήσεων για θεατρικές παραστάσεις, η οποία αποτελείται από μια modern **React Native** εφαρμογή κινητού και ένα ισχυρό **Node.js** REST API.

## 🚀 Λειτουργίες (Features)

- **Ταυτοποίηση Χρηστών (Authentication):** Ασφαλής εγγραφή και σύνδεση με χρήση **JWT (Access & Refresh Tokens)**. Τα tokens αποθηκεύονται με ασφάλεια στη συσκευή (Secure Storage).
- **Αναζήτηση Παραστάσεων (Smart Search):** Δυναμική αναζήτηση παραστάσεων με βάση τον **τίτλο**, το **όνομα του θεάτρου** ή την **τοποθεσία**.
- **Διαχείριση Κρατήσεων (Booking Management):** 
    - Επιλογή θέσης μέσω διαδραστικού Seat Map.
    - Δημιουργία νέας κράτησης.
    - **Τροποποίηση (Modify Slot):** Αλλαγή θέσης ή ώρας σε μελλοντικές κρατήσεις.
    - **Ακύρωση (Cancellation):** Διαγραφή κράτησης και απελευθέρωση θέσης.
- **Ιστορικό Χρήστη:** Προβολή όλων των κρατήσεων και της συνολικής αξίας του "χαρτοφυλακίου" εισιτηρίων στο προφίλ.
- **Database Auto-Bootstrap:** Αυτόματη δημιουργία πινάκων και εισαγωγή δοκιμαστικών δεδομένων (seeding) κατά την πρώτη εκκίνηση.

## 🛠️ Τεχνολογίες που χρησιμοποιήθηκαν

### Frontend (Mobile App)
- **React Native & Expo:** Cross-platform ανάπτυξη για iOS και Android.
- **NativeWind (Tailwind CSS):** Σχεδιασμός UI με modern dark mode αισθητική.
- **React Query (TanStack):** Αποδοτική διαχείριση data fetching και caching.
- **Zustand:** Ελαφρύ state management για τη συνεδρία του χρήστη.
- **Lucide React Native:** Σύστημα εικονιδίων.

### Backend (REST API)
- **Node.js & Express:** Ανάπτυξη του server και των API endpoints.
- **MariaDB / MySQL:** Σχεσιακή βάση δεδομένων για την αποθήκευση χρηστών, παραστάσεων και κρατήσεων.
- **Bcrypt.js:** Κρυπτογράφηση κωδικών πρόσβασης (hashing).
- **JSON Web Tokens (JWT):** Ασφάλεια και διαχείριση συνεδριών.

---

## 📁 Δομή Project

- `backend/`: Ο κώδικας του API και οι ρυθμίσεις της βάσης δεδομένων.
- `frontend/`: Η εφαρμογή React Native (Expo).

---

## ⚙️ Εγκατάσταση & Ρύθμιση

### 1. Κλωνοποίηση του Repository
```bash
git clone https://github.com/tzoulio222/CN6035_1
cd RestAPI
```

### 2. Ρύθμιση Backend
1. Μεταβείτε στο φάκελο: `cd backend`
2. Εγκαταστήστε τις βιβλιοθήκες: `npm install`
3. Δημιουργήστε ένα αρχείο `.env` με τις εξής μεταβλητές:
   ```env
   PORT=3000
   DB_HOST=localhost
   DB_USER=το_username_σας
   DB_PASSWORD=ο_κωδικός_σας
   DB_NAME=theatre_db
   JWT_SECRET=ένα_τυχαίο_κλειδί
   ```
4. Εκκινήστε τον server: `npm run dev`

### 3. Ρύθμιση Frontend
1. Μεταβείτε στο φάκελο: `cd frontend`
2. Εγκαταστήστε τις βιβλιοθήκες: `npm install`
3. Εκκινήστε την Expo: `npx expo start`

---

## 🔗 Repository Link
Μπορείτε να βρείτε τον κώδικα εδώ: [https://github.com/tzoulio222/CN6035_1](https://github.com/tzoulio222/CN6035_1)

## 👤 Demo Λογαριασμός
- **Email:** `demo@stage.local`
- **Password:** `Demo123!`
