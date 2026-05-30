# StageLine - Theatre Booking System

Το **StageLine** είναι μια ολοκληρωμένη Full-Stack πλατφόρμα κρατήσεων για θεατρικές παραστάσεις. Αναπτύχθηκε στα πλαίσια της κατανόησης κατανεμημένων συστημάτων (**Mobile Client – REST API – Database**), εστιάζοντας στην ασφάλεια, την ακεραιότητα των δεδομένων και την εμπειρία χρήστη (UI/UX).

---

## 🚀 Κύριες Λειτουργίες (Features)

### 📱 Mobile Frontend
- **Smart Search & Filters:** Αναζήτηση παραστάσεων με πολλαπλά κριτήρια (Τίτλος, Θέατρο, Τοποθεσία) και φιλτράρισμα ανά σκηνή.
- **Interactive Booking Flow:** Επιλογή παράστασης, ημερομηνίας/ώρας και θέσης μέσω δυναμικού χάρτη θέσεων.
- **Reservation Management:** 
    - **Modify Slot:** Δυνατότητα αλλαγής θέσης ή ώρας σε ενεργές κρατήσεις.
    - **Cancellation:** Ακύρωση κράτησης με άμεση απελευθέρωση της θέσης στη βάση.
- **Secure Authentication:** Σύνδεση με Access/Refresh Tokens και ασφαλής αποθήκευση στη συσκευή.

### ⚙️ Backend API
- **Distributed Logic:** Διαχωρισμός επιχειρησιακής λογικής από την αποθήκευση δεδομένων.
- **Security Middleware:** Έλεγχος ταυτότητας σε όλα τα προστατευμένα endpoints μέσω JWT.
- **Data Integrity:** Διαχείριση ταυτόχρονων κρατήσεων για την αποφυγή διπλοκρατήσεων (Unique Constraints).
- **Auto-Bootstrapping:** Αυτόματη προετοιμασία της βάσης (Schema creation) και εισαγωγή αρχικών δεδομένων.

---

## 🏗️ Αρχιτεκτονική Συστήματος

Η εφαρμογή ακολουθεί το μοντέλο **Client-Server**:
1.  **Frontend (React Native):** Ο "Κατανεμημένος Πελάτης" που επικοινωνεί ασύγχρονα με το API.
2.  **REST API (Express.js):** Ο κεντρικός κόμβος που διαχειρίζεται τα αιτήματα, το authentication και το business logic.
3.  **Database (MariaDB):** Το επίπεδο μόνιμης αποθήκευσης με σχεσιακή δομή.

---

## 🛠️ Τεχνολογικό Stack

| Επίπεδο | Τεχνολογία | Χρήση |
| :--- | :--- | :--- |
| **Frontend** | React Native (Expo) | Mobile Application |
| **Styling** | NativeWind (Tailwind) | UI/UX Design |
| **State** | Zustand & React Query | Data Management & Caching |
| **Backend** | Node.js (Express) | REST API Server |
| **Database** | MariaDB / MySQL | Relational Storage |
| **Security** | JWT & Bcrypt.js | Auth & Password Hashing |

---

## 📡 API Endpoints

### 🔐 Authentication
- `POST /api/register`: Εγγραφή νέου χρήστη.
- `POST /api/login`: Είσοδος και επιστροφή tokens.
- `POST /api/refresh`: Ανανέωση Access Token μέσω Refresh Token.
- `GET /api/me`: Ανάκτηση στοιχείων τρέχοντος χρήστη (Protected).

### 🎭 Content & Booking
- `GET /api/theatres`: Λίστα όλων των θεάτρων.
- `GET /api/shows`: Λίστα παραστάσεων (υποστηρίζει filters: `theatreId`, `title`).
- `GET /api/showtimes/:showId`: Διαθέσιμα slots για μια παράσταση.
- `GET /api/seats/:showtimeId`: Κατάσταση θέσεων (booked/available).
- `POST /api/reservations`: Δημιουργία νέας κράτησης (Protected).
- `PATCH /api/reservations/:id`: Τροποποίηση υπάρχουσας κράτησης (Protected).
- `DELETE /api/reservations/:id`: Ακύρωση κράτησης (Protected).
- `GET /api/user/reservations`: Ιστορικό κρατήσεων χρήστη (Protected).

---

## 📊 Σχεδιασμός Βάσης Δεδομένων

Η βάση αποτελείται από τους εξής βασικούς πίνακες:
- **`users`**: user_id, name, email, password (hashed).
- **`theatres`**: theatre_id, name, location, description, image_url.
- **`shows`**: show_id, theatre_id (FK), title, duration, age_rating.
- **`showtimes`**: id, show_id (FK), start_time, price.
- **`reservations`**: id, user_id (FK), showtime_id (FK), seat_number, status.

---

## ⚙️ Εγκατάσταση & Ρύθμιση

### 1. Κλωνοποίηση του Repository
```bash
git clone https://github.com/tzoulio222/CN6035_1
cd RestAPI
```

### 2. Ρύθμιση Backend
1. `cd backend`
2. `npm install`
3. Δημιουργήστε ένα αρχείο `.env`:
   ```env
   PORT=3000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=theatre_db
   JWT_SECRET=your_jwt_secret
   ```
4. `npm run dev`

### 3. Ρύθμιση Frontend
1. `cd frontend`
2. `npm install`
3. `npx expo start`

---

## 🔗 Repository Link
[https://github.com/tzoulio222/CN6035_1](https://github.com/tzoulio222/CN6035_1)

## 👤 Demo Λογαριασμός
- **Email:** `demo@stage.local`
- **Password:** `Demo123!`
