const schema = require('../schemas/forgot-password-schema');
const validate = require('../middleware/validate-req-schema');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 5, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
})
const nodemailer = require("nodemailer");
let transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // use SSL
    auth: {
      user: process.env.AUTH_EMAIL,
      pass: process.env.AUTH_PASSWORD,
    },
  });

module.exports = (app, collections) => {
    app.post("/forgot-password", limiter, schema, validate, (req, res) => {
        const {users} = collections;
        const {email} = req.body;
        users.findOne({email})
        .then((r) => { 
            if (!r) res.send({msg: "There is no account with that email"});
            else {
                jwt.sign({ _id: r._id }, process.env.RESET_PASSWORD_KEY, { expiresIn: '1h' }, (err, token) => {
                    if (err) res.status(403).send(err);
                    else {
                        users.updateOne({email}, { $set: { resetPasswordToken: token} })
                        .then(r => {
                            transporter.sendMail({
                        from: 'OmniScreens', // sender address
                        to: email, // list of receivers
                        subject: "Reset password", // Subject line
                        text: token, // plain text body
                      })
                      .then(r => {
                          res.send({msg: `Reset password link sent to ${email}`})
                      })
                      .catch(err => res.send(err))
                })
                .catch(err => res.send(err))
                    }
                });
            }
         })
        .catch(err => res.send(err))
    });
};