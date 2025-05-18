import jwt from 'jsonwebtoken';
export const authenticateToken = (req, res, next) => {
    var _a;
    const ACCESS_TOKEN = process.env.ACCESS_TOKEN_SECRET;
    const token = (_a = req.headers['authorization']) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
    if (!token) {
        return res.sendStatus(401); // Unauthorized if not have token
    }
    if (!ACCESS_TOKEN) {
        console.error('ACCESS_TOKEN_SECRET is not set');
        return res.sendStatus(500);
    }
    jwt.verify(token, ACCESS_TOKEN, (err, user) => {
        if (err) {
            console.error('Error verifying token:', err);
            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({ message: 'Token expired' });
            }
            else if (err.name === 'JsonWebTokenError') {
                return res.status(403).json({ message: 'Invalid token' });
            }
            else if (err.name === 'NotBeforeError') {
                return res.status(401).json({ message: 'Token not yet active' });
            }
            return res.status(403).json({ message: 'Token verification failed' });
        }
        req.user =
            user;
        next();
    });
};
