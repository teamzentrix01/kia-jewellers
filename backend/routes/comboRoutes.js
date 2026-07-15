const router = require('express').Router();
const { verifyAdmin } = require('../middleware/auth');
const { getCombos, getComboCandidates, createCombo } = require('../controllers/comboController');

router.get('/combos', getCombos);
router.get('/combo-candidates', verifyAdmin, getComboCandidates);
router.post('/combos', verifyAdmin, createCombo);

module.exports = router;
