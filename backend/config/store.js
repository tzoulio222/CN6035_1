const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const {
  demoPassword,
  theatres: seedTheatres,
  shows: seedShows,
  showtimes: seedShowtimes,
  reservations: seedReservations,
  demoUsers,
} = require('../data/seedData');

dotenv.config();

const DB_NAME = process.env.DB_NAME || 'theatre_db';
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';

const SEAT_ROWS = ['A', 'B', 'C', 'D', 'E'];
const SEAT_COUNT_PER_ROW = 10;

let backend = 'memory';
let pool = null;
let initialized = false;

const memoryState = createMemoryState();

function createMemoryState() {
  const initialReservations = seedReservations.map((reservation) => ({
    ...cloneRow(reservation),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }));

  return {
    theatres: seedTheatres.map(cloneRow),
    shows: seedShows.map(cloneRow),
    showtimes: seedShowtimes.map(cloneRow),
    users: demoUsers.map(cloneRow),
    reservations: initialReservations,
    nextIds: {
      user: Math.max(...demoUsers.map((item) => item.id)) + 1,
      reservation: 16,
    },
  };
}

function cloneRow(row) {
  return JSON.parse(JSON.stringify(row));
}

function parseDateTime(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function isFutureDateTime(value) {
  const date = parseDateTime(value);
  return date ? date.getTime() > Date.now() : false;
}

function makeHttpError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function createPool(withDatabase) {
  return mysql.createPool({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    database: withDatabase ? DB_NAME : undefined,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });
}

async function ensureDatabaseExists() {
  const bootstrapPool = createPool(false);
  try {
    await bootstrapPool.query(
      `CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    );
  } finally {
    await bootstrapPool.end().catch(() => {});
  }
}

async function ensureMySqlSchema() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS theatres (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      location VARCHAR(255) NOT NULL,
      description TEXT,
      image_url TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS shows (
      id INT AUTO_INCREMENT PRIMARY KEY,
      theatre_id INT NOT NULL,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      duration INT,
      age_rating VARCHAR(50),
      image_url TEXT,
      FOREIGN KEY (theatre_id) REFERENCES theatres(id) ON DELETE CASCADE
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS showtimes (
      id INT AUTO_INCREMENT PRIMARY KEY,
      show_id INT NOT NULL,
      start_time DATETIME NOT NULL,
      price DECIMAL(10, 2) NOT NULL,
      FOREIGN KEY (show_id) REFERENCES shows(id) ON DELETE CASCADE
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS reservations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      showtime_id INT NOT NULL,
      seat_number VARCHAR(10) NOT NULL,
      status ENUM('pending', 'confirmed', 'cancelled') DEFAULT 'confirmed',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (showtime_id) REFERENCES showtimes(id) ON DELETE CASCADE
    )
  `);

  try {
    await pool.query(
      'ALTER TABLE reservations ADD UNIQUE KEY uniq_showtime_seat (showtime_id, seat_number)'
    );
  } catch (error) {
    if (!['ER_DUP_KEYNAME', 'ER_DUP_ENTRY', 'ER_DUP_KEY'].includes(error.code)) {
      throw error;
    }
  }

  const [theatreRows] = await pool.query('SELECT COUNT(*) AS count FROM theatres');
  if (theatreRows[0].count === 0) {
    for (const theatre of seedTheatres) {
      await pool.query(
        'INSERT INTO theatres (id, name, location, description, image_url) VALUES (?, ?, ?, ?, ?)',
        [theatre.id, theatre.name, theatre.location, theatre.description, theatre.image_url]
      );
    }
  }

  const [showRows] = await pool.query('SELECT COUNT(*) AS count FROM shows');
  if (showRows[0].count === 0) {
    for (const show of seedShows) {
      await pool.query(
        'INSERT INTO shows (id, theatre_id, title, description, duration, age_rating, image_url) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [show.id, show.theatre_id, show.title, show.description, show.duration, show.age_rating, show.image_url]
      );
    }
  }

  const [showtimeRows] = await pool.query('SELECT COUNT(*) AS count FROM showtimes');
  if (showtimeRows[0].count === 0) {
    for (const showtime of seedShowtimes) {
      await pool.query(
        'INSERT INTO showtimes (id, show_id, start_time, price) VALUES (?, ?, ?, ?)',
        [showtime.id, showtime.show_id, showtime.start_time, showtime.price]
      );
    }
  }

  const [demoReservationRows] = await pool.query(
    'SELECT COUNT(*) AS count FROM reservations WHERE user_id = ?',
    [demoUsers[0]?.id || 1]
  );
  if (demoReservationRows[0].count === 0) {
    for (const reservation of seedReservations) {
      await pool.query(
        'INSERT INTO reservations (user_id, showtime_id, seat_number, status) VALUES (?, ?, ?, ?)',
        [reservation.user_id, reservation.showtime_id, reservation.seat_number, reservation.status]
      );
    }
  }

  const [userRows] = await pool.query('SELECT COUNT(*) AS count FROM users');
  if (userRows[0].count === 0) {
    for (const user of demoUsers) {
      await pool.query(
        'INSERT INTO users (id, name, email, password) VALUES (?, ?, ?, ?)',
        [user.id, user.name, user.email, user.password]
      );
    }
  }
}

async function connectMySql() {
  try {
    pool = createPool(true);
    await pool.getConnection().then((connection) => connection.release());
    await ensureMySqlSchema();
    backend = 'mysql';
    return backend;
  } catch (error) {
    if (pool) {
      await pool.end().catch(() => {});
      pool = null;
    }

    if (error.code === 'ER_BAD_DB_ERROR') {
      try {
        await ensureDatabaseExists();
        pool = createPool(true);
        await pool.getConnection().then((connection) => connection.release());
        await ensureMySqlSchema();
        backend = 'mysql';
        return backend;
      } catch (bootstrapError) {
        if (pool) {
          await pool.end().catch(() => {});
          pool = null;
        }
      }
    }

    backend = 'memory';
    return backend;
  }
}

function generateSeatLayout(bookedSeats = []) {
  const booked = new Set(bookedSeats.map((seat) => String(seat).toUpperCase()));
  const seats = [];

  for (const row of SEAT_ROWS) {
    for (let index = 1; index <= SEAT_COUNT_PER_ROW; index += 1) {
      const label = `${row}${index}`;
      seats.push({
        seatNumber: label,
        booked: booked.has(label),
      });
    }
  }

  return seats;
}

function normalizeSeatNumber(value) {
  return String(value || '').trim().toUpperCase();
}

async function getReservationRecord(reservationId) {
  if (backend === 'mysql') {
    const [rows] = await pool.query(
      `
        SELECT
          r.id,
          r.user_id,
          r.showtime_id,
          r.seat_number,
          r.status,
          r.created_at,
          r.updated_at,
          st.start_time,
          st.price,
          s.id AS show_id,
          s.title AS show_title,
          t.name AS theatre_name,
          t.location AS theatre_location
        FROM reservations r
        JOIN showtimes st ON r.showtime_id = st.id
        JOIN shows s ON st.show_id = s.id
        JOIN theatres t ON s.theatre_id = t.id
        WHERE r.id = ?
        LIMIT 1
      `,
      [reservationId]
    );
    return rows[0] || null;
  }

  const reservation = memoryState.reservations.find((item) => item.id === Number(reservationId));
  if (!reservation) {
    return null;
  }

  const showtime = memoryState.showtimes.find((item) => item.id === reservation.showtime_id);
  const show = showtime ? memoryState.shows.find((item) => item.id === showtime.show_id) : null;
  const theatre = show ? memoryState.theatres.find((item) => item.id === show.theatre_id) : null;

    return {
      ...cloneRow(reservation),
      start_time: showtime ? showtime.start_time : null,
      price: showtime ? showtime.price : null,
      show_id: show ? show.id : null,
      show_title: show ? show.title : null,
      theatre_name: theatre ? theatre.name : null,
      theatre_location: theatre ? theatre.location : null,
    };
  }

async function getReservationById(reservationId) {
  return getReservationRecord(reservationId);
}

function mapReservationStatus(record) {
  if (!record) {
    return record;
  }

  const startTime = parseDateTime(record.start_time);
  return {
    ...record,
    can_modify: startTime ? startTime.getTime() > Date.now() && record.status !== 'cancelled' : false,
    is_future: startTime ? startTime.getTime() > Date.now() : false,
  };
}

function ensureShowtimeExists(showtimeId) {
  const showtime = memoryState.showtimes.find((item) => item.id === Number(showtimeId));
  if (!showtime) {
    throw makeHttpError(404, 'Showtime not found');
  }

  return showtime;
}

function getMemoryUserByEmail(email) {
  return memoryState.users.find(
    (user) => user.email.toLowerCase() === String(email).toLowerCase()
  );
}

function getMemoryUserById(userId) {
  return memoryState.users.find((user) => user.id === Number(userId)) || null;
}

function joinMemoryShow(show) {
  const theatre = memoryState.theatres.find((item) => item.id === show.theatre_id);
  return {
    ...cloneRow(show),
    theatre_name: theatre ? theatre.name : null,
    theatre_location: theatre ? theatre.location : null,
  };
}

async function getTheatres() {
  if (backend === 'mysql') {
    const [rows] = await pool.query('SELECT * FROM theatres ORDER BY name ASC');
    return rows;
  }

  return memoryState.theatres.map(cloneRow).sort((a, b) => a.name.localeCompare(b.name));
}

async function getShows({ theatreId, title, date } = {}) {
  if (backend === 'mysql') {
    let query = `
      SELECT s.*, t.name AS theatre_name, t.location AS theatre_location
      FROM shows s
      JOIN theatres t ON s.theatre_id = t.id
      WHERE 1 = 1
    `;
    const params = [];

    if (theatreId) {
      query += ' AND s.theatre_id = ?';
      params.push(theatreId);
    }

    if (title) {
      query += ' AND (s.title LIKE ? OR t.name LIKE ? OR t.location LIKE ?)';
      params.push(`%${title}%`, `%${title}%`, `%${title}%`);
    }

    if (date) {
      query += `
        AND EXISTS (
          SELECT 1
          FROM showtimes st
          WHERE st.show_id = s.id
            AND DATE(st.start_time) = ?
        )
      `;
      params.push(date);
    }

    query += ' ORDER BY s.title ASC';
    const [rows] = await pool.query(query, params);
    return rows;
  }

  return memoryState.shows
    .filter((show) => {
      const theatreMatch = !theatreId || show.theatre_id === Number(theatreId);
      
      let titleMatch = !title;
      if (title) {
        const query = String(title).toLowerCase();
        const theatre = memoryState.theatres.find(t => t.id === show.theatre_id);
        titleMatch = 
          show.title.toLowerCase().includes(query) ||
          (theatre && theatre.name.toLowerCase().includes(query)) ||
          (theatre && theatre.location.toLowerCase().includes(query));
      }

      if (!theatreMatch || !titleMatch) {
        return false;
      }

      if (!date) {
        return true;
      }

      return memoryState.showtimes.some((showtime) => {
        if (showtime.show_id !== show.id) {
          return false;
        }

        const showDate = parseDateTime(showtime.start_time);
        return showDate ? showDate.toISOString().slice(0, 10) === date : false;
      });
    })
    .map(joinMemoryShow)
    .sort((a, b) => a.title.localeCompare(b.title));
}

async function getShowtimes(showId) {
  if (backend === 'mysql') {
    const [showRows] = await pool.query('SELECT id FROM shows WHERE id = ? LIMIT 1', [showId]);
    if (showRows.length === 0) {
      throw makeHttpError(404, 'Show not found');
    }

    const [rows] = await pool.query(
      'SELECT * FROM showtimes WHERE show_id = ? ORDER BY start_time ASC',
      [showId]
    );
    return rows;
  }

  if (!memoryState.shows.some((show) => show.id === Number(showId))) {
    throw makeHttpError(404, 'Show not found');
  }

  return memoryState.showtimes
    .filter((showtime) => showtime.show_id === Number(showId))
    .map(cloneRow)
    .sort((a, b) => new Date(a.start_time) - new Date(b.start_time));
}

async function getShowtimeRecord(showtimeId) {
  if (backend === 'mysql') {
    const [rows] = await pool.query(
      `
        SELECT st.*, s.title AS show_title, s.theatre_id, t.name AS theatre_name
        FROM showtimes st
        JOIN shows s ON st.show_id = s.id
        JOIN theatres t ON s.theatre_id = t.id
        WHERE st.id = ?
        LIMIT 1
      `,
      [showtimeId]
    );
    return rows[0] || null;
  }

  const showtime = memoryState.showtimes.find((item) => item.id === Number(showtimeId));
  if (!showtime) {
    return null;
  }

  const show = memoryState.shows.find((item) => item.id === showtime.show_id);
  const theatre = show ? memoryState.theatres.find((item) => item.id === show.theatre_id) : null;

  return {
    ...cloneRow(showtime),
    show_title: show ? show.title : null,
    theatre_id: show ? show.theatre_id : null,
    theatre_name: theatre ? theatre.name : null,
  };
}

async function getAvailableSeats(showtimeId) {
  const showtime = await getShowtimeRecord(showtimeId);
  if (!showtime) {
    throw makeHttpError(404, 'Showtime not found');
  }

  let bookedSeats = [];

  if (backend === 'mysql') {
    const [rows] = await pool.query(
      'SELECT seat_number FROM reservations WHERE showtime_id = ? AND status != "cancelled"',
      [showtimeId]
    );
    bookedSeats = rows.map((row) => row.seat_number);
  } else {
    bookedSeats = memoryState.reservations
      .filter((reservation) => reservation.showtime_id === Number(showtimeId) && reservation.status !== 'cancelled')
      .map((reservation) => reservation.seat_number);
  }

  const seats = generateSeatLayout(bookedSeats);

  return {
    showtime,
    totalSeats: seats.length,
    bookedSeats,
    availableSeats: seats.filter((seat) => !seat.booked).map((seat) => seat.seatNumber),
    seats,
  };
}

async function getUserByEmail(email) {
  if (backend === 'mysql') {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ? LIMIT 1', [email]);
    return rows[0] || null;
  }

  return getMemoryUserByEmail(email) || null;
}

async function getUserById(userId) {
  if (backend === 'mysql') {
    const [rows] = await pool.query('SELECT id, name, email, created_at FROM users WHERE id = ? LIMIT 1', [userId]);
    return rows[0] || null;
  }

  const user = getMemoryUserById(userId);
  if (!user) {
    return null;
  }

  const { password, ...safeUser } = cloneRow(user);
  return safeUser;
}

async function createUser({ name, email, passwordHash }) {
  if (backend === 'mysql') {
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, passwordHash]
    );
    return {
      id: result.insertId,
      name,
      email,
      password: passwordHash,
    };
  }

  const id = memoryState.nextIds.user;
  memoryState.nextIds.user += 1;
  const user = {
    id,
    name,
    email,
    password: passwordHash,
  };
  memoryState.users.push(user);
  return cloneRow(user);
}

async function getUserReservations(userId) {
  if (backend === 'mysql') {
    const [rows] = await pool.query(
      `
        SELECT
          r.id,
          r.user_id,
          r.showtime_id,
          r.seat_number,
          r.status,
          r.created_at,
          r.updated_at,
          st.start_time,
          st.price,
          s.id AS show_id,
          s.title AS show_title,
          t.name AS theatre_name,
          t.location AS theatre_location
        FROM reservations r
        JOIN showtimes st ON r.showtime_id = st.id
        JOIN shows s ON st.show_id = s.id
        JOIN theatres t ON s.theatre_id = t.id
        WHERE r.user_id = ?
        ORDER BY r.created_at DESC
      `,
      [userId]
    );
    return rows.map(mapReservationStatus);
  }

  return memoryState.reservations
    .filter((reservation) => reservation.user_id === Number(userId))
    .map((reservation) => {
      const showtime = memoryState.showtimes.find((item) => item.id === reservation.showtime_id);
      const show = showtime
        ? memoryState.shows.find((item) => item.id === showtime.show_id)
        : null;
      const theatre = show ? memoryState.theatres.find((item) => item.id === show.theatre_id) : null;

        return {
        ...cloneRow(reservation),
        start_time: showtime ? showtime.start_time : null,
        price: showtime ? showtime.price : null,
        show_id: show ? show.id : null,
        show_title: show ? show.title : null,
        theatre_name: theatre ? theatre.name : null,
        theatre_location: theatre ? theatre.location : null,
      };
    })
    .map(mapReservationStatus)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

async function createReservation({ userId, showtimeId, seatNumber }) {
  const normalizedSeat = normalizeSeatNumber(seatNumber);
  if (!normalizedSeat) {
    throw makeHttpError(400, 'Seat number is required');
  }

  const showtime = await getShowtimeRecord(showtimeId);
  if (!showtime) {
    throw makeHttpError(404, 'Showtime not found');
  }

  if (!/^[A-E](10|[1-9])$/.test(normalizedSeat)) {
    throw makeHttpError(400, 'Seat number must be between A1 and E10');
  }

  if (backend === 'mysql') {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      const [existing] = await connection.query(
        'SELECT id FROM reservations WHERE showtime_id = ? AND seat_number = ? AND status != "cancelled" LIMIT 1',
        [showtimeId, normalizedSeat]
      );

      if (existing.length > 0) {
        throw makeHttpError(409, 'Seat is already booked');
      }

      const [result] = await connection.query(
        'INSERT INTO reservations (user_id, showtime_id, seat_number, status) VALUES (?, ?, ?, "confirmed")',
        [userId, showtimeId, normalizedSeat]
      );

      await connection.commit();
      return {
        id: result.insertId,
        userId,
        showtimeId,
        seatNumber: normalizedSeat,
        status: 'confirmed',
        showtime,
      };
    } catch (error) {
      await connection.rollback().catch(() => {});
      if (error.code === 'ER_DUP_ENTRY') {
        throw makeHttpError(409, 'Seat is already booked');
      }
      throw error;
    } finally {
      connection.release();
    }
  }

  const alreadyBooked = memoryState.reservations.some(
    (reservation) =>
      reservation.showtime_id === Number(showtimeId) &&
      reservation.seat_number === normalizedSeat &&
      reservation.status !== 'cancelled'
  );

  if (alreadyBooked) {
    throw makeHttpError(409, 'Seat is already booked');
  }

  const reservation = {
    id: memoryState.nextIds.reservation,
    user_id: Number(userId),
    showtime_id: Number(showtimeId),
    seat_number: normalizedSeat,
    status: 'confirmed',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  memoryState.nextIds.reservation += 1;
  memoryState.reservations.push(reservation);

  return {
    id: reservation.id,
    userId: reservation.user_id,
    showtimeId: reservation.showtime_id,
    seatNumber: reservation.seat_number,
    status: reservation.status,
    showtime,
  };
}

async function updateReservation({ userId, reservationId, showtimeId, seatNumber }) {
  const normalizedSeat = seatNumber ? normalizeSeatNumber(seatNumber) : null;

  if (backend === 'mysql') {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const [reservationRows] = await connection.query(
        `
          SELECT r.id, r.user_id, r.showtime_id, r.seat_number, r.status, st.start_time
          FROM reservations r
          JOIN showtimes st ON r.showtime_id = st.id
          WHERE r.id = ? AND r.user_id = ?
          LIMIT 1
        `,
        [reservationId, userId]
      );

      const reservation = reservationRows[0];
      if (!reservation || reservation.status === 'cancelled') {
        throw makeHttpError(404, 'Reservation not found or not yours');
      }

      if (!isFutureDateTime(reservation.start_time)) {
        throw makeHttpError(403, 'Only future reservations can be modified');
      }

      const targetShowtimeId = Number(showtimeId || reservation.showtime_id);
      const targetSeat = normalizedSeat || reservation.seat_number;

      const [showtimeRows] = await connection.query('SELECT id, start_time FROM showtimes WHERE id = ? LIMIT 1', [
        targetShowtimeId,
      ]);
      const targetShowtime = showtimeRows[0];

      if (!targetShowtime) {
        throw makeHttpError(404, 'Showtime not found');
      }

      if (!isFutureDateTime(targetShowtime.start_time)) {
        throw makeHttpError(403, 'Only future showtimes can be rebooked');
      }

      const [conflicts] = await connection.query(
        `
          SELECT id
          FROM reservations
          WHERE showtime_id = ?
            AND seat_number = ?
            AND status != 'cancelled'
            AND id != ?
          LIMIT 1
        `,
        [targetShowtimeId, targetSeat, reservationId]
      );

      if (conflicts.length > 0) {
        throw makeHttpError(409, 'Seat is already booked');
      }

      await connection.query(
        'UPDATE reservations SET showtime_id = ?, seat_number = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?',
        [targetShowtimeId, targetSeat, reservationId, userId]
      );

      await connection.commit();
      return getReservationRecord(reservationId);
    } catch (error) {
      await connection.rollback().catch(() => {});
      if (error.code === 'ER_DUP_ENTRY') {
        throw makeHttpError(409, 'Seat is already booked');
      }
      throw error;
    } finally {
      connection.release();
    }
  }

  const reservation = memoryState.reservations.find(
    (item) => item.id === Number(reservationId) && item.user_id === Number(userId)
  );

  if (!reservation || reservation.status === 'cancelled') {
    throw makeHttpError(404, 'Reservation not found or not yours');
  }

  const currentShowtime = memoryState.showtimes.find((item) => item.id === reservation.showtime_id);
  if (!currentShowtime || !isFutureDateTime(currentShowtime.start_time)) {
    throw makeHttpError(403, 'Only future reservations can be modified');
  }

  const targetShowtimeId = Number(showtimeId || reservation.showtime_id);
  const targetShowtime = ensureShowtimeExists(targetShowtimeId);
  if (!isFutureDateTime(targetShowtime.start_time)) {
    throw makeHttpError(403, 'Only future showtimes can be rebooked');
  }

  const targetSeat = normalizedSeat || reservation.seat_number;
  const conflict = memoryState.reservations.some(
    (item) =>
      item.id !== reservation.id &&
      item.showtime_id === targetShowtimeId &&
      item.seat_number === targetSeat &&
      item.status !== 'cancelled'
  );

  if (conflict) {
    throw makeHttpError(409, 'Seat is already booked');
  }

  reservation.showtime_id = targetShowtimeId;
  reservation.seat_number = targetSeat;
  reservation.updated_at = new Date().toISOString();

  return getReservationRecord(reservationId);
}

async function cancelReservation({ userId, reservationId }) {
  // Η διαγραφή αφορά μόνο την κράτηση που ανήκει στον χρήστη.
  if (backend === 'mysql') {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      const [reservationRows] = await connection.query(
        `
          SELECT r.id, r.user_id, r.status, st.start_time
          FROM reservations r
          JOIN showtimes st ON r.showtime_id = st.id
          WHERE r.id = ? AND r.user_id = ?
          LIMIT 1
        `,
        [reservationId, userId]
      );

      const reservation = reservationRows[0];
      if (!reservation || reservation.status === 'cancelled') {
        throw makeHttpError(404, 'Reservation not found or not yours');
      }

      const [result] = await connection.query(
        'UPDATE reservations SET status = "cancelled", updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ? AND status != "cancelled"',
        [reservationId, userId]
      );

      if (result.affectedRows === 0) {
        throw makeHttpError(404, 'Reservation not found or not yours');
      }

      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback().catch(() => {});
      throw error;
    } finally {
      connection.release();
    }
  }

  const reservation = memoryState.reservations.find(
    (item) => item.id === Number(reservationId) && item.user_id === Number(userId)
  );

  if (!reservation || reservation.status === 'cancelled') {
    throw makeHttpError(404, 'Reservation not found or not yours');
  }

  reservation.status = 'cancelled';
  reservation.updated_at = new Date().toISOString();
  return true;
}

async function getOverview() {
  if (backend === 'mysql') {
    const [theatresCount] = await pool.query('SELECT COUNT(*) AS count FROM theatres');
    const [showsCount] = await pool.query('SELECT COUNT(*) AS count FROM shows');
    const [showtimesCount] = await pool.query('SELECT COUNT(*) AS count FROM showtimes');
    const [reservationsCount] = await pool.query('SELECT COUNT(*) AS count FROM reservations');
    const [usersCount] = await pool.query('SELECT COUNT(*) AS count FROM users');

    return {
      backend,
      demoPassword,
      counts: {
        theatres: theatresCount[0].count,
        shows: showsCount[0].count,
        showtimes: showtimesCount[0].count,
        reservations: reservationsCount[0].count,
        users: usersCount[0].count,
      },
    };
  }

  return {
    backend,
    demoPassword,
    counts: {
      theatres: memoryState.theatres.length,
      shows: memoryState.shows.length,
      showtimes: memoryState.showtimes.length,
      reservations: memoryState.reservations.length,
      users: memoryState.users.length,
    },
  };
}

async function init() {
  if (initialized) {
    return backend;
  }

  try {
    backend = await connectMySql();
  } catch (error) {
    backend = 'memory';
  }

  initialized = true;
  return backend;
}

async function getMode() {
  if (!initialized) {
    await init();
  }

  return backend;
}

async function isReady() {
  if (!initialized) {
    await init();
  }

  return true;
}

module.exports = {
  init,
  isReady,
  getMode,
  getTheatres,
  getShows,
  getShowtimes,
  getAvailableSeats,
  getUserByEmail,
  getUserById,
  createUser,
  getUserReservations,
  createReservation,
  updateReservation,
  cancelReservation,
  getOverview,
  makeHttpError,
  getReservationById,
};
