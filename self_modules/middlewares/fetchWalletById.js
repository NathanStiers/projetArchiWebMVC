const db = require('../db');

module.exports = (req, res, callback) => {
    db.db.query("SELECT * FROM wallets WHERE user_id = ? AND id = ?;", [req.body.user_id, req.body.wallet_id], (error, resultSQL) => {
        if (error) {
            res.redirect('/login')
            return;
        } else {
            if(!resultSQL.length){
                res.redirect('/login')
                return;
            } else {
                req.body.wallet = resultSQL[0]
                callback();
                return;
            }
        }
    });
}