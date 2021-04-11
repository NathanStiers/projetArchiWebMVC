const db = require('../db');
const toolbox = require('../toolbox')

/**
 * Fetch the data of a user based on his id
 * 
 * @param {Object} req The request Object
 * @param {Object} res The response Object
 * @param {Function} callback The next function
 */
module.exports = (req, res, callback) => {
    let id = req.body.user_id
    if (!toolbox.checkMail(id)) {
        // error msg
        res.redirect('/login')
        return;
    }
    db.db.query("SELECT * FROM users WHERE id = ?;", id, (error, resultSQL) => {
        if (error) {
            res.redirect('/login')
        } else {
            if (resultSQL.length === 0) {
                res.redirect('/login')
            } else {
                toolbox.mapping_label_id_roles().then(result => {
                    mapping_label_id_roles = result
                    resultSQL[0].role = mapping_label_id_roles[resultSQL[0].role]
                    req.body.user = resultSQL[0]
                    callback()
                }).catch(error => {
                    res.redirect('/login')
                })
            }
        }
    });
}