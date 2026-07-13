const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

    if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });

    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET || 'essential_mart_secret');
        next();
    } catch {
        res.status(401).json({ error: 'Invalid or expired token.' });
    }
};

const verifyAdmin = (req, res, next) => {
    verifyToken(req, res, () => {
        if ((req.user?.role || '').toLowerCase() !== 'admin') {
            return res.status(403).json({ error: 'Admin access required.' });
        }
        next();
    });
};

module.exports = { verifyToken, verifyAdmin };
