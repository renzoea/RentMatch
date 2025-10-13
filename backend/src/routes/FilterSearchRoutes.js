const express = require('express');
const {authenticateToken, authorizeOwner } = require('../middleware/authMiddleware');
const { GetAllSearch, FilterByType, FilterByRoomsRange, FilterByBathrooms, FilterByPriceRange, FilterByLeaseDuration, FilterBychildren,FilterByFurnished, 
    FilterByPets, FilterByAmenities, FilterBySmoking, FilterByBedroomsRange,FilterByCities, FilterByNeighborhood, FilterByBalcony,
    FilterByTerrace, FliterByOccupants, FilterByVerificatedUser, FilterByElevator, FilterBySecurity, FilterByArea, FilterByStudents,
    FilterByParkingNeeded, FilterByLaundry
 } = require('../controllers/filterSearchController');

const router = express.Router();

router.get('/',authenticateToken,authorizeOwner, GetAllSearch);
router.get('/type/:type',authenticateToken,authorizeOwner, FilterByType);
router.get('/rooms/:max/:min',authenticateToken,authorizeOwner, FilterByRoomsRange);
router.get('/bathrooms/:max/:min',authenticateToken,authorizeOwner, FilterByBathrooms);
router.get('/bedrooms/:max/:min',authenticateToken,authorizeOwner, FilterByBedroomsRange);
router.get('/price/:max/:min',authenticateToken,authorizeOwner, FilterByPriceRange);
router.get('/lease/:duration',authenticateToken,authorizeOwner, FilterByLeaseDuration);
router.get('/children/:children',authenticateToken,authorizeOwner, FilterBychildren);
router.get('/furnished/:furnished',authenticateToken,authorizeOwner, FilterByFurnished);
router.get('/pets/:pets',authenticateToken,authorizeOwner, FilterByPets);
router.get('/amenities/:amenities',authenticateToken,authorizeOwner, FilterByAmenities);
router.get('/smoking/:smoking',authenticateToken,authorizeOwner, FilterBySmoking);
router.get('/city/:city',authenticateToken,authorizeOwner, FilterByCities);
router.get('/neighborhood/:neighborhood',authenticateToken,authorizeOwner, FilterByNeighborhood);
router.get('/balcony/:balcony',authenticateToken,authorizeOwner, FilterByBalcony);
router.get('/terrace/:terrace',authenticateToken,authorizeOwner, FilterByTerrace);
router.get('/occupants/:occupants',authenticateToken,authorizeOwner, FliterByOccupants);
router.get('/verificated/:verificated',authenticateToken,authorizeOwner, FilterByVerificatedUser);
router.get('/elevator/:elevator',authenticateToken,authorizeOwner, FilterByElevator);
router.get('/security/:security',authenticateToken,authorizeOwner, FilterBySecurity);
router.get('/area/:max/:min',authenticateToken,authorizeOwner, FilterByArea);
router.get('/students/:students',authenticateToken,authorizeOwner, FilterByStudents);
router.get('/parking/:parking',authenticateToken,authorizeOwner, FilterByParkingNeeded);
router.get('/laundry/:laundry',authenticateToken,authorizeOwner, FilterByLaundry);

module.exports = router;