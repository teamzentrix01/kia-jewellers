const router = require('express').Router();
const { verifyAdmin } = require('../middleware/auth');
const {
    getAdminProfile,
    updateAdminProfile,
    getAdminStats,
    getAdminCustomers,
    getAdminOrders,
} = require('../controllers/adminController');

router.use(verifyAdmin);

router.get('/profile', getAdminProfile);
router.put('/profile', updateAdminProfile);
router.get('/stats', getAdminStats);
router.get('/customers', getAdminCustomers);
router.get('/orders', getAdminOrders);

module.exports = router;
