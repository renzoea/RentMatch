const express = require('express');
const { GetAllSearch, FilterByType, FilterByRoomsRange, FilterByBathrooms, FilterByPriceRange, FilterByLeaseDuration, FilterBychildren,FilterByFurnished, 
    FilterByPets, FilterByAmenities, FilterBySmoking, FilterByBedroomsRange,FilterByCities, FilterByNeighborhood, FilterByBalcony,
    FilterByTerrace, FliterByOccupants, FilterByVerificatedUser, FilterByElevator, FilterBySecurity, FilterByArea
 } = require('../controllers/filterSearchController');

const router = express.Router();

router.get('/', GetAllSearch);
router.get('/type/:type', FilterByType);
router.get('/rooms/:max/:min', FilterByRoomsRange);
router.get('/bathrooms/:max/:min', FilterByBathrooms);
router.get('/bedrooms/:max/:min', FilterByBedroomsRange);
router.get('/price/:max/:min', FilterByPriceRange);
router.get('/lease/:duration', FilterByLeaseDuration);
router.get('/children/:children', FilterBychildren);
router.get('/furnished/:furnished', FilterByFurnished);
router.get('/pets/:pets', FilterByPets);
router.get('/amenities/:amenities', FilterByAmenities);
router.get('/smoking/:smoking', FilterBySmoking);
router.get('/city/:city', FilterByCities);
router.get('/neighborhood/:neighborhood', FilterByNeighborhood);
router.get('/balcony/:balcony', FilterByBalcony);
router.get('/terrace/:terrace', FilterByTerrace);
router.get('/occupants/:occupants', FliterByOccupants);
router.get('/verificated/:verificated', FilterByVerificatedUser);
router.get('/elevator/:elevator', FilterByElevator);
router.get('/security/:security', FilterBySecurity);
router.get('/area/:max/:min', FilterByArea);

module.exports = router;