const jwt = require('jsonwebtoken');

/**
 * Check if a user is already connected
 * 
 * @param {Object} req The request Object
 * @param {Object} res The response Object
 * @param {Function} callback The next function
 */
module.exports = (req, res, callback) => {
    jwt.verify(req.cookies.Token, process.env.ACCESS_TOKEN_SECRET, (error, payload) => {
        if (error) {
            callback();
        } else {
            res.redirect('/wallets')
        }
    });
}