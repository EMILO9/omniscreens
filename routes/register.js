require('dotenv').config();
const schema = require('../schemas/register-schema');
const validate = require('../middleware/validate-req-schema');
const bcrypt = require('bcrypt');
const { nanoid } = require('nanoid');
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
    app.post("/register", limiter, schema, validate, (req, res) => {
        const {users} = collections;
        const {email, password} = req.body;
        users.findOne({email})
        .then(r => {
            if (r) res.send({err: `There is already an account with the email address: ${email}`});
            else {
                const verificationString = nanoid(50);
                bcrypt.hash(password, 10, (err, hash) => {
                    if (err) res.send(err);
                    else {
                        users.insertOne({email, password: hash, verified: false, verificationString, createdAt: new Date()})
                        .then(r => {
                            transporter.sendMail({
                                from: 'OmniScreens', // sender address
                                to: email, // list of receivers
                                subject: "Account verification", // Subject line
                                text: verificationString, // plain text body
                              })
                              .then(() => res.send({msg: `Your account with the email: ${email} is created, remember to verify your account to prevent account deletion.`}))
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