const router = require('express').Router();
const { getProfile, updateProfile, getUserOrders } = require('../controllers/userController');
const { getAddresses, addAddress, updateAddress, deleteAddress } = require('../controllers/addressController');
const { getWishlist, toggleWishlist, removeFromWishlist } = require('../controllers/wishlistController');
const { verifyToken } = require('../middleware/auth');

// Profile
router.get('/profile', verifyToken, getProfile);
router.put('/profile', verifyToken, updateProfile);

// Orders
router.get('/orders', verifyToken, getUserOrders);

// Addresses
router.get('/addresses', verifyToken, getAddresses);
router.post('/addresses', verifyToken, addAddress);
router.put('/addresses/:id', verifyToken, updateAddress);
router.delete('/addresses/:id', verifyToken, deleteAddress);

// Wishlist
router.get('/wishlist', verifyToken, getWishlist);
router.post('/wishlist', verifyToken, toggleWishlist);
router.delete('/wishlist/:id', verifyToken, removeFromWishlist);

module.exports = router;