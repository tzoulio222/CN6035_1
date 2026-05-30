# StageLine - Theatre Booking System

StageLine is a comprehensive theatre booking platform featuring a robust Node.js backend and a modern React Native mobile application.

## 🚀 Features

- **User Authentication:** Secure login and registration using JWT.
- **Theatre Exploration:** Browse available theatres and their show schedules.
- **Seat Reservation:** Real-time seat selection and booking management.
- **Responsive UI:** A polished mobile experience built with Expo and NativeWind.
- **Database Fallback:** Automatic in-memory fallback if MySQL is not available.

## 📁 Project Structure

- `backend/`: Express.js API with MySQL integration.
- `frontend/`: Expo (React Native) mobile application.

## 🛠️ Installation & Setup

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Expo Go](https://expo.dev/client) app on your mobile device (to test the frontend)

### 1. Clone the Repository

```bash
git clone https://github.com/tzoulio222/CN6035_1
cd RestAPI
```

### 2. Backend Configuration

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables:
   Create a `.env` file in the `backend/` directory:
   ```env
   PORT=3000
   DB_HOST=localhost
   DB_USER=your_user
   DB_PASSWORD=your_password
   DB_NAME=theatre_db
   JWT_SECRET=your_jwt_secret
   ```
4. Start the server:
   ```bash
   npm run dev
   ```

### 3. Frontend Configuration

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Expo development server:
   ```bash
   npx expo start
   ```
4. Scan the QR code with the Expo Go app to view the application.

## 📖 Functionality Description

### Backend
The backend is built with **Express.js** and provides a RESTful API for managing users, theatres, shows, and reservations. It uses **MySQL** for data persistence but includes a robust in-memory data store as a fallback for demonstration purposes. Security is handled via **bcryptjs** for password hashing and **JSON Web Tokens (JWT)** for session management.

### Frontend
The mobile client is developed using **Expo** and **React Native**. It utilizes **Zustand** for state management and **React Query** for efficient data fetching and caching. The styling is powered by **NativeWind (Tailwind CSS)**, providing a clean and modern user interface across both iOS and Android.

## 📄 License

This project is licensed under the ISC License.
