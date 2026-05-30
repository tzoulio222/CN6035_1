const express = require('express');
const router = express.Router();
const {
  register,
  login,
  refresh,
  me,
  getUserReservations,
} = require('../controllers/userController');
const auth = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refresh);
router.get('/me', auth, me);
router.get('/user/reservations', auth, getUserReservations);

module.exports = router;
