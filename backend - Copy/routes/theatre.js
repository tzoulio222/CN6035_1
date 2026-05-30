const express = require('express');
const router = express.Router();
const {
    getAllTheatres,
    getAllShows,
    getShowtimes,
    getAvailableSeats,
    createReservation,
    cancelReservation,
    updateReservation
} = require('../controllers/theatreController');
const auth = require('../middleware/auth');

router.get('/theatres', getAllTheatres);
router.get('/shows', getAllShows);
router.get('/showtimes/:showId', getShowtimes);
router.get('/seats/:showtimeId', getAvailableSeats);

// Protected routes
router.post('/reservations', auth, createReservation);
router.patch('/reservations/:id', auth, updateReservation);
router.delete('/reservations/:id', auth, cancelReservation);

module.exports = router;
