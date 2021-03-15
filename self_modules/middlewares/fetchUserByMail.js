const db = require('../db');
const toolbox = require('../toolbox')

module.exports = (req, res, callback) => {
    let mail = req.body.mail
    if (!toolbox.checkMail(mail)) {
        req.body.notification = error
        return callback()
    } else {
        db.db.query("SELECT * FROM users WHERE mail = ?;", mail, (error, resultSQL) => {
            if (error) {
                req.body.notification = error.sqlMessage + ". Please contact the webmaster"
                return callback()
            } else {
                if (resultSQL.length === 0) {
                    req.body.notification = "Cet utilisateur n'existe pas"
                    return callback()
                } else {
                    console.log(resultSQL)
                    let mapping_roles = req.body.mapping_roles
                    resultSQL[0].role = mapping_roles[resultSQL[0].role]
                    req.body.user = resultSQL[0]
                    return callback()
                }
            }
        });
    }
}