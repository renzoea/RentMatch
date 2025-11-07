const express = require('express');
const router = express.Router();

const { getAllEcpertise, NewExpertise } = require('../controllers/MobileExpertiseController');
const { authenticateToken, authorizeTenant } = require('../middleware/authMiddleware');


router.post('/expertice', authenticateToken, authorizeTenant, NewExpertise);


router.get('/GetAllEcpertice', authenticateToken, authorizeTenant, getAllEcpertise);

module.exports = router;