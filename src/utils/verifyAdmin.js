const jwt = require('jsonwebtoken');

const verifyAdmin = async (req, res, next) => {
    const authHeader = req.headers.authorization || req.headers.Authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.sendStatus(401);
    }

    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.sendStatus(401);
        }
        req.user = decoded.user;
        if (req.user.is_admin) {
            return next();
        }
        return res.sendStatus(401);
    });
};

module.exports = verifyAdmin;