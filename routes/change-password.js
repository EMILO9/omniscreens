const verifyUser = require('../middleware/verify-user');
const schema = require('../schemas/change-password-schema');
const validate = require('../middleware/validate-req-schema');
const bcrypt = require('bcrypt');

module.exports = (app, collections) => {
    app.post("/change-password", verifyUser, schema, validate, (req, res) => {
        const {users} = collections;
        const {password} = req.body;
        const {email} = req.user
        bcrypt.hash(password, 10, (err, hash) => {
            if (err) res.status(403).send(err);
            else {
                users.updateOne({email}, {$set: {password: hash}})
                .then(r => res.send({msg: "Password changed"}))
                .catch(err => res.status(403).send(err))
            }
        });
    });
};