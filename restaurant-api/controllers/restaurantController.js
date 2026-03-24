const { pool } = require('../config/db');

// Get all restaurants
const getAllRestaurants = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM restaurants ORDER BY created_at DESC');
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error('Error fetching restaurants:', error);
        res.status(500).json({ success: false, message: 'Error fetching restaurants', error: error.message });
    }
};

// Get single restaurant by ID
const getRestaurantById = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.query('SELECT * FROM restaurants WHERE id = ?', [id]);
        
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Restaurant not found' });
        }
        
        res.json({ success: true, data: rows[0] });
    } catch (error) {
        console.error('Error fetching restaurant:', error);
        res.status(500).json({ success: false, message: 'Error fetching restaurant', error: error.message });
    }
};

// Create new restaurant
const createRestaurant = async (req, res) => {
    try {
        const { name, address, phone, email, cuisine_type, opening_hours } = req.body;
        
        if (!name || !address || !phone) {
            return res.status(400).json({ success: false, message: 'Name, address, and phone are required' });
        }
        
        const [result] = await pool.query(
            'INSERT INTO restaurants (name, address, phone, email, cuisine_type, opening_hours) VALUES (?, ?, ?, ?, ?, ?)',
            [name, address, phone, email, cuisine_type, opening_hours]
        );
        
        const [newRestaurant] = await pool.query('SELECT * FROM restaurants WHERE id = ?', [result.insertId]);
        res.status(201).json({ success: true, data: newRestaurant[0] });
    } catch (error) {
        console.error('Error creating restaurant:', error);
        res.status(500).json({ success: false, message: 'Error creating restaurant', error: error.message });
    }
};

// Update restaurant
const updateRestaurant = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, address, phone, email, cuisine_type, opening_hours } = req.body;
        
        const [result] = await pool.query(
            'UPDATE restaurants SET name = ?, address = ?, phone = ?, email = ?, cuisine_type = ?, opening_hours = ? WHERE id = ?',
            [name, address, phone, email, cuisine_type, opening_hours, id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Restaurant not found' });
        }
        
        const [updatedRestaurant] = await pool.query('SELECT * FROM restaurants WHERE id = ?', [id]);
        res.json({ success: true, data: updatedRestaurant[0] });
    } catch (error) {
        console.error('Error updating restaurant:', error);
        res.status(500).json({ success: false, message: 'Error updating restaurant', error: error.message });
    }
};

// Delete restaurant
const deleteRestaurant = async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await pool.query('DELETE FROM restaurants WHERE id = ?', [id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Restaurant not found' });
        }
        
        res.json({ success: true, message: 'Restaurant deleted successfully' });
    } catch (error) {
        console.error('Error deleting restaurant:', error);
        res.status(500).json({ success: false, message: 'Error deleting restaurant', error: error.message });
    }
};

// Get restaurant tables
const getRestaurantTables = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.query('SELECT * FROM tables WHERE restaurant_id = ? ORDER BY table_number', [id]);
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error('Error fetching restaurant tables:', error);
        res.status(500).json({ success: false, message: 'Error fetching tables', error: error.message });
    }
};

module.exports = {
    getAllRestaurants,
    getRestaurantById,
    createRestaurant,
    updateRestaurant,
    deleteRestaurant,
    getRestaurantTables
};