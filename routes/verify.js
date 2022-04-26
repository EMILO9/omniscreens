require('dotenv').config();
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 5, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
})

module.exports = (app, collections) => {
    app.post("/verify/:verificationString", limiter, (req, res) => {
        const {users} = collections;
        const { verificationString } = req.params;
        users.findOne({verificationString}).then(user => {
            if (!user) res.send({msg: "You have already verified your account or the verification string is wrong."})
            else users.updateOne({verificationString}, {$unset: {verificationString: ""}, $set: { verified: true }})
            .then(r => res.send({msg: `${user.email} is now verified`}))
            .catch(err => res.send(err))
        })
    });
};