const router = require('express').Router();
const { getCart, addToCart, updateCartItem, removeFromCart, clearCart } = require('../controllers/cartController');
const { verifyToken } = require('../middleware/auth');

router.get('/', verifyToken, getCart);
router.post('/', verifyToken, addToCart);
router.put('/:id', verifyToken, updateCartItem);
router.delete('/clear', verifyToken, clearCart);
router.delete('/:id', verifyToken, removeFromCart);

module.exports = router;