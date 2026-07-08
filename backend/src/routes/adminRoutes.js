const express = require('express');
const router = express.Router();
const { getDashboardStats, getAllOrders, updateOrderStatus } = require('../controllers/adminController');
const { protect, isAdmin } = require('../middleware/auth');

// Protect all routes in this router with JWT + Admin checks
router.use(protect);
router.use(isAdmin);

router.get('/stats', getDashboardStats);
router.get('/orders', getAllOrders);
router.put('/orders/:id/status', updateOrderStatus);

module.exports = router;
