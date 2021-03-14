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
                res.status(403).send("Vous avez atteint votre limite de création de portefeuilles");
                return;
            } else {
                callback();
                return;
            }
        }
    });
}


