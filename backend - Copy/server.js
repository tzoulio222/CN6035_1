const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const store = require('./config/store');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/auth');
const theatreRoutes = require('./routes/theatre');
const {
  register,
  login,
  refresh,
  me,
  getUserReservations,
} = require('./controllers/userController');
const auth = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3000;
const publicDir = path.join(__dirname, 'public');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
    express.static(publicDir, {
        index: false,
        etag: false,
        lastModified: false,
        maxAge: 0
    })
);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', theatreRoutes);
app.post('/api/register', register);
app.post('/api/login', login);
app.post('/api/refresh', refresh);
app.get('/api/me', auth, me);
app.get('/api/user/reservations', auth, getUserReservations);

// Health check endpoint
app.get('/health', async (req, res) => {
    const overview = await store.getOverview();
    res.json({
        status: 'OK',
        message: 'Server is running',
        backend: overview.backend,
        counts: overview.counts
    });
});

app.get('/api', async (req, res) => {
    const overview = await store.getOverview();

    res.json({
        success: true,
        message: 'Theatre Booking API',
        version: '2.0.0',
        backend: overview.backend,
        demoPassword: overview.demoPassword,
        counts: overview.counts,
        endpoints: {
            auth: '/api/auth',
            authRegister: '/api/register',
            authLogin: '/api/login',
            authRefresh: '/api/refresh',
            authMe: '/api/me',
            overview: '/api/overview',
            theatres: '/api/theatres',
            shows: '/api/shows',
            showtimes: '/api/showtimes/:showId',
            seats: '/api/seats/:showtimeId',
            reservations: '/api/reservations',
            updateReservation: '/api/reservations/:id',
            userReservations: '/api/user/reservations'
        }
    });
});

app.get('/api/overview', async (req, res) => {
    const overview = await store.getOverview();
    res.json({ success: true, data: overview });
});

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Start server
const startServer = async () => {
    const backend = await store.init();

    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
        console.log(`API available at http://localhost:${PORT}`);
        console.log(`Backend mode: ${backend}`);
        if (backend === 'memory') {
            console.log('MySQL unavailable, using in-memory demo data.');
            console.log('Demo login: demo@stage.local / Demo123!');
        }
    });
};

startServer();
