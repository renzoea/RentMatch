const express = require('express');
const router = express.Router();

const { IncialState, upload, GetAllStatusInitial } = require('../controllers/MobileInicialController');
const { authenticateToken, authorizeTenant } = require('../middleware/authMiddleware');


router.post('/inicialState', upload.array('images',10), authenticateToken, authorizeTenant, IncialState);
router.get('/inicialState', authenticateToken, authorizeTenant, GetAllStatusInitial);
module.exports = router;