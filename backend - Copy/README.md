# StageLine Theatre Booking API

The repository has two parts:

- `.`: the Express backend and MySQL/MariaDB data layer
- `route/`: the Expo Router mobile app

## Project Layout

```text
Theater_API/
  server.js
  config/
  controllers/
  data/
  routes/
  route/
    app/
    src/
    global.css
    metro.config.js
```

## What it does

- Browsing theatres, shows, showtimes, and seats
- Registration, login, and token refresh with JWT
- Secure token storage on the mobile client
- Seat reservation, modification, and cancellation
- MySQL/MariaDB backend when available
- Automatic in-memory demo fallback when MySQL is unavailable

## Quick Start

1. Install backend dependencies from the repo root:

```bash
npm install
```

2. Install the Expo app dependencies:

```bash
cd route
npm install
```

3. Configure the backend `.env` in the repo root:

```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=theatre_db
JWT_SECRET=your_super_secret_jwt_key_here
```

4. Start the backend:

```bash
npm run backend:dev
```

5. Start the mobile app from the root:

```bash
npm run mobile:start
```

Useful app variants:

- `npm run mobile:android`
- `npm run mobile:ios`
- `npm run mobile:web`

If the app cannot reach the backend, set `EXPO_PUBLIC_API_BASE_URL` to your server URL. On the Android emulator, `http://10.0.2.2:3000` is the usual fallback.

## Demo Login

- Email: `demo@stage.local`
- Password: `Demo123!`

## API Summary

- `GET /health`
- `GET /route`
- `GET /route/overview`
- `POST /route/register`
- `POST /route/login`
- `POST /route/refresh`
- `GET /route/me`
- `POST /route/auth/register`
- `POST /route/auth/login`
- `POST /route/auth/refresh`
- `GET /route/auth/me`
- `GET /route/theatres`
- `GET /route/shows`
- `GET /route/showtimes/:showId`
- `GET /route/seats/:showtimeId`
- `POST /route/reservations`
- `PATCH /route/reservations/:id`
- `DELETE /route/reservations/:id`
- `GET /route/user/reservations`
- `GET /route/auth/user/reservations`

## Notes

- The MySQL schema is in `schema.sql`.
- Sample theatre and show data is in `seed.sql`.
- The mobile app stores auth tokens in secure storage and refreshes them when needed.
- The app seeds a demo account automatically when MariaDB is empty.
