const express = require('express');
const { GetAllSearch, FilterByType, FilterByRoomsRange, FilterByBathrooms, FilterByPriceRange, FilterByLeaseDuration } = require('../controllers/filterSearchController');

const router = express.Router();

router.get('/', GetAllSearch);
router.get('/type/:type', FilterByType);
router.get('/rooms/:max/:min', FilterByRoomsRange);
router.get('/bathrooms/:bathrooms', FilterByBathrooms);
router.get('/price/:max/:min', FilterByPriceRange);
router.get('/lease/:duration', FilterByLeaseDuration);


module.exports = router;