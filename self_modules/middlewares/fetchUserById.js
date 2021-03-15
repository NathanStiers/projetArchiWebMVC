const db = require('../db');
const toolbox = require('../toolbox')

module.exports = (req, res, callback) => {
    let id = req.body.user_id
    if (!toolbox.checkMail(id)) {
        res.redirect('/login')
        return;
    }
    db.db.query("SELECT * FROM users WHERE id = ?;", id, (error, resultSQL) => {
        if (error) {
            res.redirect('/login')
            return;
        } else {
            if (resultSQL.length === 0) {
                res.redirect('/login')
                return;
            } else {
                toolbox.mapping_label_id_roles().then(result => {
                    mapping_label_id_roles = result
                    resultSQL[0].role = mapping_label_id_roles[resultSQL[0].role]
                    req.body.user = resultSQL[0]
                    callback()
                    return;
                }).catch(error => {
                    res.redirect('/login')
                    return;
                })
            }
        }
    });
}