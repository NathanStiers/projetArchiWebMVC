const db = require('../db');
const toolbox = require('../toolbox')

module.exports = (req, res, callback) => {
    db.db.query("SELECT COUNT(id) AS count FROM wallets WHERE user_id = ?;", req.body.user_id, (error, resultSQLCount) => {
        if (error) {
            res.status(500).send(error);
            return;
        } else {
            let count = resultSQLCount[0].count;
            let role = req.body.user_role
            if ((count >= 3 && role === "basic") || (count >= 10 && role === "premium")) {
                req.body.max_reached = true
                callback();
                return;
            } else {
                req.body.max_reached = false
                callback();
                return;
            }
        }
    });
}


