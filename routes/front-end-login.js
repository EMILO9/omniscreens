module.exports = (app, collections) => {
    app.get("/front-end-login", (req, res) => {
        res.render('login');
    });
};