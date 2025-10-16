const express = require('express');
const router = express.Router();
const { getActiveRentals, getRentalHistory } = require('../controllers/MobileUserController');
const { authenticateToken, authorizeLandlord, authorizeTenant } = require('../middleware/authMiddleware');

router.post('/profile', authenticateToken, authorizeTenant, getActiveRentals);

router.get('/traer-historial', authenticateToken, authorizeTenant, getRentalHistory);
module.exports = router;