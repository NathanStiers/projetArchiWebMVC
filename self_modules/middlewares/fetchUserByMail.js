const db = require('../db');
const toolbox = require('../toolbox')

/**
 * Fetch the data of a user based on his mail
 * 
 * @param {Object} req The request Object
 * @param {Object} res The response Object
 * @param {Function} callback The next function
 */
module.exports = (req, res, callback) => {
    let mail = req.body.mail
    if (!toolbox.checkMail(mail)) {
        req.flash('notification', error + '. Please contact the webmaster');
        res.redirect('/')
    } else {
        db.db.query("SELECT * FROM users WHERE mail = ?;", mail, (error, resultSQL) => {
            if (error) {
                req.flash('notification', error.sqlMessage + '. Please contact the webmaster');
                res.redirect('/')
            } else {
                if (resultSQL.length === 0) {
                    req.flash('notification', 'This user does not exist');
                    res.redirect('/')
                } else {
                    let mapping_roles = req.body.mapping_roles
                    resultSQL[0].role = mapping_roles[resultSQL[0].role]
                    req.body.user = resultSQL[0]
                    callback()
                }
            }
        });
    }
}