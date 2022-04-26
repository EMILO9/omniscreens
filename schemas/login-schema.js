const { body } = require('express-validator');

module.exports = [
    body('email').exists({checkFalsy: true}),
    body('password').exists({checkFalsy: true}),
]