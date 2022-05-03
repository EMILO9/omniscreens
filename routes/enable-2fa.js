const verifyUser = require('../middleware/verify-user');
const speakeasy = require('speakeasy');

module.exports = (app, collections) => {
    app.post("/enable-2fa", verifyUser, (req, res) => {
        const {users} = collections;
        const {email} = req.user;
        users.findOne({email, twoFactor:{$exists:true}})
        .then(user => {
            if (user) res.send("User has already enabled 2FA")
            else {
                const tempSecret = speakeasy.generateSecret();
                res.send(tempSecret)
            }
        })
        .catch(err => res.send(err))
    });
};