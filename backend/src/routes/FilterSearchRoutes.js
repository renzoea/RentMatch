const express = require('express');
const {authenticateToken, authorizeLandlord } = require('../middleware/authMiddleware');
const { GetAllSearch, FilterByType, FilterByRoomsRange, FilterByBathrooms, FilterByPriceRange, FilterByLeaseDuration, FilterBychildren,FilterByFurnished, 
    FilterByPets, FilterByAmenities, FilterBySmoking, FilterByBedroomsRange,FilterByCities, FilterByNeighborhood, FilterByBalcony,
    FilterByTerrace, FliterByOccupants, FilterByVerificatedUser, FilterByElevator, FilterBySecurity, FilterByArea, FilterByStudents,
    FilterByParkingNeeded, FilterByLaundry, AdvancedSearch
 } = require('../controllers/filterSearchController');

const router = express.Router();

router.get('/',authenticateToken,authorizeLandlord, GetAllSearch);
router.get('/type/:type',authenticateToken,authorizeLandlord, FilterByType);
router.get('/rooms/:max/:min',authenticateToken,authorizeLandlord, FilterByRoomsRange);
router.get('/bathrooms/:max/:min',authenticateToken,authorizeLandlord, FilterByBathrooms);
router.get('/bedrooms/:max/:min',authenticateToken,authorizeLandlord, FilterByBedroomsRange);
router.get('/price/:max/:min',authenticateToken,authorizeLandlord, FilterByPriceRange);
router.get('/lease/:duration',authenticateToken,authorizeLandlord, FilterByLeaseDuration);
router.get('/children/:children',authenticateToken,authorizeLandlord, FilterBychildren);
router.get('/furnished/:furnished',authenticateToken,authorizeLandlord, FilterByFurnished);
router.get('/pets/:pets',authenticateToken,authorizeLandlord, FilterByPets);
router.get('/amenities/:amenities',authenticateToken,authorizeLandlord, FilterByAmenities);
router.get('/smoking/:smoking',authenticateToken,authorizeLandlord, FilterBySmoking);
router.get('/city/:city',authenticateToken,authorizeLandlord, FilterByCities);
router.get('/neighborhood/:neighborhood',authenticateToken,authorizeLandlord, FilterByNeighborhood);
router.get('/balcony/:balcony',authenticateToken,authorizeLandlord, FilterByBalcony);
router.get('/terrace/:terrace',authenticateToken,authorizeLandlord, FilterByTerrace);
router.get('/occupants/:occupants',authenticateToken,authorizeLandlord, FliterByOccupants);
router.get('/verificated/:verificated',authenticateToken,authorizeLandlord, FilterByVerificatedUser);
router.get('/elevator/:elevator',authenticateToken,authorizeLandlord, FilterByElevator);
router.get('/security/:security',authenticateToken,authorizeLandlord, FilterBySecurity);
router.get('/area/:max/:min',authenticateToken,authorizeLandlord, FilterByArea);
router.get('/students/:students',authenticateToken,authorizeLandlord, FilterByStudents);
router.get('/parking/:parking',authenticateToken,authorizeLandlord, FilterByParkingNeeded);
router.get('/laundry/:laundry',authenticateToken,authorizeLandlord, FilterByLaundry);
router.get('/advanced', authenticateToken, authorizeLandlord, AdvancedSearch);

module.exports = router;