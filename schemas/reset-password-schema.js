const { body } = require('express-validator');

module.exports = [
    body('password').isLength({ min: 5 }).isString(),
    body("repeatPassword").custom(((val,{ req }) => val === req.body.password))
]