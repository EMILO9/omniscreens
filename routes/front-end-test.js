module.exports = (app, collections) => {
    app.get("/", (req, res) => {
        res.render('index');
    });
};