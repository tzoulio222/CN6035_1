const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { testConnection } = require('./config/db');

// Load environment variables
dotenv.config();

// Import routes
const restaurantRoutes = require('./routes/restaurants');
const tableRoutes = require('./routes/tables');
const orderRoutes = require('./routes/orders');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/tables', tableRoutes);
app.use('/api/orders', orderRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'Server is running' });
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({ 
        message: 'Restaurant API', 
        version: '1.0.0',
        endpoints: {
            restaurants: '/api/restaurants',
            tables: '/api/tables',
            orders: '/api/orders'
        }
    });
});

// Start server
const startServer = async () => {
    const dbConnected = await testConnection();
    if (dbConnected) {
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
            console.log(`API available at http://localhost:${PORT}`);
        });
    } else {
        console.error('Server not started due to database connection failure');
        process.exit(1);
    }
};

startServer();