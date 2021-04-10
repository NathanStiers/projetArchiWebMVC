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
            res.status(500).send(error);
            return;
        } else {
            if(!resultSQL.length){
                res.status(403).send("Ce portefeuille n'appartient pas à cet utilisateur")
                return;
            } else {
                callback();
                return;
            }
        }
    });
}
