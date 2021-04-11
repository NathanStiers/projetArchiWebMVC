const db = require('../db');

/**
 * Allows to map roles between label and id
 * 
 * @param {Object} req The request Object
 * @param {Object} res The response Object
 * @param {Function} callback The next function
 */
module.exports = (req, res, callback) => {
    db.db.query("SELECT * FROM roles;", (error, resultSQL) => {
        if (error) {
            req.body.notification = error.sqlMessage + ". Please contact the webmaster"
            callback();
        }
        else {
            let mapping = {}
            resultSQL.forEach(r => {
                mapping[r.id] = r.label;
                mapping[r.label] = r.id;
            });
            req.body.mapping_roles = mapping
            callback();
        }
    });
}