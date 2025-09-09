const express = require('express');
const { GetAllSearch, FilterByType } = require('../controllers/filterSearchController');

const router = express.Router();

router.get('/', GetAllSearch);
router.get('/:type', FilterByType);

module.exports = router;