const db = require('../db');

/**
 * Check if the wallet belong to the user
 * 
 * @param {Object} req The request Object
 * @param {Object} res The response Object
 * @param {Function} callback The next function
 */
module.exports = (req, res, callback) => {
    db.db.query("SELECT * FROM wallets WHERE user_id = ? AND id = ?;", [req.body.user_id, req.body.wallet_id], (error, resultSQL) => {
        if (error) {
            req.flash('notification', error + '. Please contact the webmaster');
            res.redirect('/')
        } else {
            if(!resultSQL.length){
                req.flash('notification', 'This wallet does not belong to this user');
                res.redirect('/')
            } else {
                callback();
            }
        }
    });
}