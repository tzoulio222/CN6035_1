const { pool } = require('../config/db');

// Get all orders (with optional filters)
const getAllOrders = async (req, res) => {
    try {
        let query = `
            SELECT o.*, t.table_number, r.name as restaurant_name 
            FROM orders o
            JOIN tables t ON o.table_id = t.id
            JOIN restaurants r ON o.restaurant_id = r.id
        `;
        const params = [];
        
        // Add filters if provided
        if (req.query.status) {
            query += ' WHERE o.status = ?';
            params.push(req.query.status);
        }
        
        query += ' ORDER BY o.created_at DESC';
        
        const [rows] = await pool.query(query, params);
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ success: false, message: 'Error fetching orders', error: error.message });
    }
};

// Get order by ID with items
const getOrderById = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Get order details
        const [orderRows] = await pool.query(`
            SELECT o.*, t.table_number, r.name as restaurant_name 
            FROM orders o
            JOIN tables t ON o.table_id = t.id
            JOIN restaurants r ON o.restaurant_id = r.id
            WHERE o.id = ?
        `, [id]);
        
        if (orderRows.length === 0) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }
        
        // Get order items
        const [itemsRows] = await pool.query(`
            SELECT oi.*, mi.name, mi.category 
            FROM order_items oi
            JOIN menu_items mi ON oi.menu_item_id = mi.id
            WHERE oi.order_id = ?
        `, [id]);
        
        const order = {
            ...orderRows[0],
            items: itemsRows
        };
        
        res.json({ success: true, data: order });
    } catch (error) {
        console.error('Error fetching order:', error);
        res.status(500).json({ success: false, message: 'Error fetching order', error: error.message });
    }
};

// Create new order
const createOrder = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        
        const { table_id, restaurant_id, special_requests, items } = req.body;
        
        if (!table_id || !restaurant_id || !items || items.length === 0) {
            return res.status(400).json({ success: false, message: 'Table ID, restaurant ID, and items are required' });
        }
        
        // Generate order number
        const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        
        // Calculate total amount
        let totalAmount = 0;
        for (const item of items) {
            const [menuItem] = await connection.query(
                'SELECT price FROM menu_items WHERE id = ?',
                [item.menu_item_id]
            );
            if (menuItem.length === 0) {
                throw new Error(`Menu item ${item.menu_item_id} not found`);
            }
            totalAmount += menuItem[0].price * item.quantity;
        }
        
        // Create order
        const [orderResult] = await connection.query(
            `INSERT INTO orders (table_id, restaurant_id, order_number, total_amount, special_requests, status) 
             VALUES (?, ?, ?, ?, ?, 'pending')`,
            [table_id, restaurant_id, orderNumber, totalAmount, special_requests]
        );
        
        const orderId = orderResult.insertId;
        
        // Create order items
        for (const item of items) {
            const [menuItem] = await connection.query(
                'SELECT price FROM menu_items WHERE id = ?',
                [item.menu_item_id]
            );
            const unitPrice = menuItem[0].price;
            const subtotal = unitPrice * item.quantity;
            
            await connection.query(
                `INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price, subtotal, notes) 
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [orderId, item.menu_item_id, item.quantity, unitPrice, subtotal, item.notes || null]
            );
        }
        
        // Update table status to occupied
        await connection.query(
            'UPDATE tables SET status = "occupied" WHERE id = ?',
            [table_id]
        );
        
        await connection.commit();
        
        // Fetch and return the complete order
        const [newOrder] = await pool.query(`
            SELECT o.*, t.table_number, r.name as restaurant_name 
            FROM orders o
            JOIN tables t ON o.table_id = t.id
            JOIN restaurants r ON o.restaurant_id = r.id
            WHERE o.id = ?
        `, [orderId]);
        
        res.status(201).json({ success: true, data: newOrder[0] });
    } catch (error) {
        await connection.rollback();
        console.error('Error creating order:', error);
        res.status(500).json({ success: false, message: 'Error creating order', error: error.message });
    } finally {
        connection.release();
    }
};

// Update order status
const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        const validStatuses = ['pending', 'preparing', 'ready', 'served', 'cancelled'];
        if (!status || !validStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: 'Valid status is required' });
        }
        
        const [result] = await pool.query(
            'UPDATE orders SET status = ? WHERE id = ?',
            [status, id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }
        
        // If order is served, update table status to available
        if (status === 'served') {
            const [order] = await pool.query('SELECT table_id FROM orders WHERE id = ?', [id]);
            if (order.length > 0) {
                await pool.query(
                    'UPDATE tables SET status = "available" WHERE id = ?',
                    [order[0].table_id]
                );
            }
        }
        
        const [updatedOrder] = await pool.query(`
            SELECT o.*, t.table_number, r.name as restaurant_name 
            FROM orders o
            JOIN tables t ON o.table_id = t.id
            JOIN restaurants r ON o.restaurant_id = r.id
            WHERE o.id = ?
        `, [id]);
        
        res.json({ success: true, data: updatedOrder[0] });
    } catch (error) {
        console.error('Error updating order:', error);
        res.status(500).json({ success: false, message: 'Error updating order', error: error.message });
    }
};

// Delete order
const deleteOrder = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Get table_id before deleting
        const [order] = await pool.query('SELECT table_id FROM orders WHERE id = ?', [id]);
        
        const [result] = await pool.query('DELETE FROM orders WHERE id = ?', [id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }
        
        // Update table status if needed
        if (order.length > 0) {
            await pool.query(
                'UPDATE tables SET status = "available" WHERE id = ?',
                [order[0].table_id]
            );
        }
        
        res.json({ success: true, message: 'Order deleted successfully' });
    } catch (error) {
        console.error('Error deleting order:', error);
        res.status(500).json({ success: false, message: 'Error deleting order', error: error.message });
    }
};

module.exports = {
    getAllOrders,
    getOrderById,
    createOrder,
    updateOrderStatus,
    deleteOrder
};