const router = require('express').Router();
const { placeOrder, getAllOrders, getMyOrders, updateOrderStatus } = require('../controllers/orderController');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

router.post('/place', verifyToken, placeOrder);
router.get('/my', verifyToken, getMyOrders);
router.get('/all', verifyAdmin, getAllOrders);
router.put('/:id/status', verifyAdmin, updateOrderStatus);

module.exports = router;