const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken, requireAdmin } = require('../middleware/authMiddleware');

// Todas las rutas del admin requieren autenticación y rol de admin
router.use(authenticateToken);
router.use(requireAdmin);

// Dashboard
router.get('/dashboard/stats', adminController.getDashboardStats);
router.get('/dashboard/recent-activity', adminController.getRecentActivity);
router.get('/dashboard/charts', adminController.getDashboardCharts);

// User Management
router.get('/users', adminController.getUsers);
router.get('/users/:id', adminController.getUserById);
router.patch('/users/:id/ban', adminController.banUser);
router.patch('/users/:id/unban', adminController.unbanUser);
router.patch('/users/:id/role', adminController.changeUserRole);
router.delete('/users/:id', adminController.deleteUser);

// Contract Management
router.get('/contracts', adminController.getContracts);
router.get('/contracts/:id', adminController.getContractById);
router.patch('/contracts/:id/status', adminController.updateContractStatus);
router.delete('/contracts/:id', adminController.deleteContract);

// Deposit Management
router.get('/deposits', adminController.getDeposits);
router.get('/deposits/:id', adminController.getDepositById);
router.patch('/deposits/:id/status', adminController.updateDepositStatus);
router.patch('/deposits/:id/verify', adminController.verifyDeposit);
router.patch('/deposits/:id/release', adminController.releaseDeposit);
router.patch('/deposits/:id/notes', adminController.updateDepositNotes);

// Search Profiles Management
router.get('/search-profiles', adminController.getSearchProfiles);
router.get('/search-profiles/:id', adminController.getSearchProfileById);
router.patch('/search-profiles/:id/status', adminController.updateSearchProfileStatus);
router.patch('/search-profiles/:id/visibility', adminController.updateSearchProfileVisibility);
router.delete('/search-profiles/:id', adminController.deleteSearchProfile);

module.exports = router;
