const db = require('../db');

/**
 * Allows to map types between label and id
 * 
 * @param {Object} req The request Object
 * @param {Object} res The response Object
 * @param {Function} callback The next function
 */
module.exports = (req, res, callback) => {
    db.db.query("SELECT * FROM types;", (error, resultSQL) => {
        if (error) {
            req.flash('notification', error.sqlMessage + '. Please contact the webmaster');
            res.redirect('/')
        } else {
            let mapping = {}
            resultSQL.forEach(r => {
                mapping[r.id] = r.label;
                mapping[r.label] = r.id;
            });
            req.body.mapping_types = mapping
            callback()
        }
    });
}