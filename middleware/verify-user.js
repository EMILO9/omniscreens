require('dotenv').config();
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const token = req.headers.token;
    if (!token) res.status(403).send("No token provided");
    else {
        jwt.verify(req.headers.token, process.env.JWT_SECRET_KEY, (err, decoded) => {
            if (err) res.send(err);
            else {
                req.user = decoded;
                next();
            }
        })
    }
}