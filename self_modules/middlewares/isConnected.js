const jwt = require('jsonwebtoken');

module.exports = (req, res, callback) => {
    jwt.verify(req.cookies.Token, process.env.ACCESS_TOKEN_SECRET, (error, payload) => {
        if (error) {
            callback();
            return;
        } else {
            res.redirect('/wallets')
            return;
        }
    });
}