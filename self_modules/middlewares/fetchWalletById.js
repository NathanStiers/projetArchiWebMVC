const db = require('../db');

/**
 * Fetch the data of a wallet based on its id
 * 
 * @param {Object} req The request Object
 * @param {Object} res The response Object
 * @param {Function} callback The next function
 */
module.exports = (req, res, callback) => {
    db.db.query("SELECT * FROM wallets WHERE user_id = ? AND id = ?;", [req.body.user_id, req.body.wallet_id], (error, resultSQL) => {
        if (error) {
            res.redirect('/login')
        } else {
            if(!resultSQL.length){
                res.redirect('/login')
            } else {
                req.body.wallet = resultSQL[0]
                callback();
            }
        }
    });
}