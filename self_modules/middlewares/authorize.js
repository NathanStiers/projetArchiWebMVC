const jwt = require('jsonwebtoken');
const toolbox = require('../toolbox')

module.exports = (req, res, callback) => {
    jwt.verify(req.cookies.Token, process.env.ACCESS_TOKEN_SECRET, (error, payload) => {
        if (error) {
            res.redirect('/login')
            return;
        } else {
            req.body.user_id = payload.user_id
            req.body.user_role = payload.user_role
            callback();
            return;
        }
    });
}