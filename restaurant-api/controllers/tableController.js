const { pool } = require('../config/db');

// Get all tables for a restaurant
const getTablesByRestaurant = async (req, res) => {
    try {
        const { restaurantId } = req.params;
        const [rows] = await pool.query(
            'SELECT * FROM tables WHERE restaurant_id = ? ORDER BY table_number',
            [restaurantId]
        );
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error('Error fetching tables:', error);
        res.status(500).json({ success: false, message: 'Error fetching tables', error: error.message });
    }
};

// Get table by ID
const getTableById = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.query('SELECT * FROM tables WHERE id = ?', [id]);
        
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Table not found' });
        }
        
        res.json({ success: true, data: rows[0] });
    } catch (error) {
        console.error('Error fetching table:', error);
        res.status(500).json({ success: false, message: 'Error fetching table', error: error.message });
    }
};

// Create new table
const createTable = async (req, res) => {
    try {
        const { restaurant_id, table_number, capacity, status } = req.body;
        
        if (!restaurant_id || !table_number || !capacity) {
            return res.status(400).json({ success: false, message: 'Restaurant ID, table number, and capacity are required' });
        }
        
        const [result] = await pool.query(
            'INSERT INTO tables (restaurant_id, table_number, capacity, status) VALUES (?, ?, ?, ?)',
            [restaurant_id, table_number, capacity, status || 'available']
        );
        
        const [newTable] = await pool.query('SELECT * FROM tables WHERE id = ?', [result.insertId]);
        res.status(201).json({ success: true, data: newTable[0] });
    } catch (error) {
        console.error('Error creating table:', error);
        res.status(500).json({ success: false, message: 'Error creating table', error: error.message });
    }
};

// Update table status
const updateTableStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        if (!status || !['available', 'occupied', 'reserved', 'maintenance'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Valid status is required' });
        }
        
        const [result] = await pool.query(
            'UPDATE tables SET status = ? WHERE id = ?',
            [status, id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Table not found' });
        }
        
        const [updatedTable] = await pool.query('SELECT * FROM tables WHERE id = ?', [id]);
        res.json({ success: true, data: updatedTable[0] });
    } catch (error) {
        console.error('Error updating table:', error);
        res.status(500).json({ success: false, message: 'Error updating table', error: error.message });
    }
};

// Delete table
const deleteTable = async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await pool.query('DELETE FROM tables WHERE id = ?', [id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Table not found' });
        }
        
        res.json({ success: true, message: 'Table deleted successfully' });
    } catch (error) {
        console.error('Error deleting table:', error);
        res.status(500).json({ success: false, message: 'Error deleting table', error: error.message });
    }
};

module.exports = {
    getTablesByRestaurant,
    getTableById,
    createTable,
    updateTableStatus,
    deleteTable
};