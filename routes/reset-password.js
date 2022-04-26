const schema = require('../schemas/reset-password-schema');
const validate = require('../middleware/validate-req-schema');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 5, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
})

module.exports = (app, collections) => {
    app.post("/reset-password/:resetPasswordToken", limiter, schema, validate, (req, res) => {
        const {users} = collections;
        const {password} = req.body;
        const token = req.params.resetPasswordToken;
        if (!token) res.status(403).send({msg: "Invalid token"});
        else {
            jwt.verify(token, process.env.RESET_PASSWORD_KEY, (err, decoded) => {
                if (err) res.status(403).send(err);
                else {
                    bcrypt.hash(password, 10, (err, hash) => {
                        if (err) res.send(err);
                        else {
                            users.findOne({resetPasswordToken: token})
                            .then(r => {
                                if (!r) res.status(403).send({msg: "There is no user with that password token"});
                                else {
                                    users.updateOne({resetPasswordToken: token}, { $unset: {resetPasswordToken: ""}, $set: {password: hash} })
                                    .then(r => {
                                        res.send({msg: "Password successfully changed"})
                                    })
                                    .catch(err => res.send(err))
                                }
                            })
                            .catch(err => res.status(403).send(err));
                        }
                    });
                }
            })
        }
    });
};