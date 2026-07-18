const router = require('express').Router();
const multer = require('multer');
const { verifyAdmin } = require('../middleware/auth');
const { uploadMedia } = require('../controllers/uploadController');

const allowedTypes = new Set([
    'image/jpeg', 'image/png', 'image/webp', 'image/gif',
    'video/mp4', 'video/webm', 'video/quicktime',
]);

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 25 * 1024 * 1024 },
    fileFilter: (_req, file, callback) => {
        const allowed = allowedTypes.has(file.mimetype);
        callback(allowed ? null : new Error('Unsupported file type.'), allowed);
    },
});

router.post('/media', verifyAdmin, (req, res, next) => {
    upload.single('file')(req, res, (error) => {
        if (!error) return next();
        const message = error.code === 'LIMIT_FILE_SIZE'
            ? 'File is too large. Maximum size is 25 MB.'
            : error.message;
        return res.status(400).json({ error: message });
    });
}, uploadMedia);

module.exports = router;
