const verifyUser = require('../middleware/verify-user');

module.exports = (app, collections) => {
    app.get("/account", verifyUser, (req, res) => {
        const {users} = collections;
        res.send(req.user)
    });
};