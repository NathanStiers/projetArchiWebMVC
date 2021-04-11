const db = require('../db');
const toolbox = require('../toolbox')

/**
 * Check if a user has already reached the maximum amount of wallet
 * 
 * @param {Object} req The request Object
 * @param {Object} res The response Object
 * @param {Function} callback The next function
 */
module.exports = (req, res, callback) => {
    db.db.query("SELECT COUNT(id) AS count FROM wallets WHERE user_id = ?;", req.body.user_id, (error, resultSQLCount) => {
        if (error) {
            res.status(500).send(error);
        } else {
            let count = resultSQLCount[0].count;
            let role = req.body.user_role
            req.body.max_reached = ((count >= 3 && role === "basic") || (count >= 10 && role === "premium"))
            callback();
        }
    });
}