module.exports = (app, collections) => {
    app.get("/front-end-register", (req, res) => {
        res.render('register');
    });
};