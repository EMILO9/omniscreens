require('dotenv').config();
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const schema = require('../schemas/login-schema');
const validate = require('../middleware/validate-req-schema');
const bcrypt = require('bcrypt');
const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 5, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
})

module.exports = (app, collections) => {
    app.post("/login", limiter, schema, validate, (req, res) => {
        const {users} = collections;
        const { email, password } = req.body;
        users.findOne({email})
        .then(user => {
            if (!user) res.send({msg: `the email: ${email} doesn't exist`})
            else {
                if (!user.verified) res.status(403).send({msg: "You need to verify your email address before you can login"});
                else {
                    const {email} = user;
                    bcrypt.compare(password, user.password, (err, result) => {
                        if (err) res.send(err)
                        else {
                            if (!result) res.send({msg: "Wrong password"})
                            else {
                                jwt.sign({email}, process.env.JWT_SECRET_KEY, (err, token) => {
                                    if (err) res.send(err);
                                    else res.send({token})
                                });
                            }
                        }
                    });
                }
            }
        })
        .catch(err => res.send(err))
    });
};