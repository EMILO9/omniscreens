const { body } = require('express-validator');

module.exports = [
    body('email').isEmail()
]