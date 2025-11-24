const express = require('express');
const router = express.Router();

const { IncialState, upload } = require('../controllers/MobileInicialController');
const { authenticateToken, authorizeTenant } = require('../middleware/authMiddleware');


router.post('/inicialState', upload.array('images',10), authenticateToken, authorizeTenant, IncialState);

module.exports = router;