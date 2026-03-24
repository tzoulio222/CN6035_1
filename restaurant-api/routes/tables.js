const express = require('express');
const router = express.Router();
const {
    getTablesByRestaurant,
    getTableById,
    createTable,
    updateTableStatus,
    deleteTable
} = require('../controllers/tableController');

router.get('/restaurant/:restaurantId', getTablesByRestaurant);
router.get('/:id', getTableById);
router.post('/', createTable);
router.patch('/:id/status', updateTableStatus);
router.delete('/:id', deleteTable);

module.exports = router;