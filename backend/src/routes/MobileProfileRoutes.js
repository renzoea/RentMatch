const express = require('express');
const router = express.Router();
const { getActiveRentals } = require('../controllers/MobileUserController');

router.post('/profile/:id', getActiveRentals);

module.exports = router;