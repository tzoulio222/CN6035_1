const store = require('../config/store');

const sendError = (res, error) => {
    const statusCode = error.statusCode || 500;
    const message = statusCode === 500 ? 'Server error' : error.message;
    return res.status(statusCode).json({ success: false, message });
};

// Get all theatres
const getAllTheatres = async (req, res) => {
    try {
        const rows = await store.getTheatres();
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error('Error fetching theatres:', error);
        sendError(res, error);
    }
};

// Get all shows (with optional filters)
const getAllShows = async (req, res) => {
    try {
        const { theatreId, title, date } = req.query;
        const rows = await store.getShows({ theatreId, title, date });
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error('Error fetching shows:', error);
        sendError(res, error);
    }
};

// Get showtimes for a specific show
const getShowtimes = async (req, res) => {
    try {
        const { showId } = req.params;
        const rows = await store.getShowtimes(showId);
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error('Error fetching showtimes:', error);
        sendError(res, error);
    }
};

// Get available seats for a showtime
const getAvailableSeats = async (req, res) => {
    try {
        const { showtimeId } = req.params;
        const seatMap = await store.getAvailableSeats(showtimeId);

        res.json({ 
            success: true, 
            data: seatMap
        });
    } catch (error) {
        console.error('Error fetching seats:', error);
        sendError(res, error);
    }
};

// Create a reservation
const createReservation = async (req, res) => {
    try {
        const userId = req.user.id;
        const { showtimeId, seatNumber } = req.body;

        if (!showtimeId || !seatNumber) {
            return res.status(400).json({ success: false, message: 'Please provide showtimeId and seatNumber' });
        }

        const reservation = await store.createReservation({ userId, showtimeId, seatNumber });

        res.status(201).json({
            success: true,
            data: reservation
        });
    } catch (error) {
        console.error('Error creating reservation:', error);
        sendError(res, error);
    }
};

// Cancel a reservation
const cancelReservation = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        await store.cancelReservation({ userId, reservationId: id });

        res.json({ success: true, message: 'Reservation cancelled' });
    } catch (error) {
        console.error('Error cancelling reservation:', error);
        sendError(res, error);
    }
};

// Update a reservation
const updateReservation = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const { showtimeId, seatNumber } = req.body;

        if (!showtimeId && !seatNumber) {
            return res.status(400).json({ success: false, message: 'Please provide seatNumber and/or showtimeId' });
        }

        const reservation = await store.updateReservation({
            userId,
            reservationId: id,
            showtimeId,
            seatNumber
        });

        res.json({
            success: true,
            data: reservation
        });
    } catch (error) {
        console.error('Error updating reservation:', error);
        sendError(res, error);
    }
};

module.exports = {
    getAllTheatres,
    getAllShows,
    getShowtimes,
    getAvailableSeats,
    createReservation,
    cancelReservation,
    updateReservation
};
