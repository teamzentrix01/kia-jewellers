const router = require('express').Router();
const {
    getCategories,
    getAllCategories,
    addCategory,
    updateCategory,
    deleteCategory,
} = require('../controllers/categoryController');
const { verifyAdmin } = require('../middleware/auth');

// Public
router.get('/', getCategories);

// Admin
router.get('/all', verifyAdmin, getAllCategories);
router.post('/', verifyAdmin, addCategory);
router.put('/:id', verifyAdmin, updateCategory);
router.delete('/:id', verifyAdmin, deleteCategory);

module.exports = router;