const db = require('../db');

module.exports = (req, res, callback) => {
    db.db.query("SELECT * FROM roles;", (error, resultSQL) => {
        if (error) {
            req.body.notification = error.sqlMessage + ". Please contact the webmaster"
            return callback();
        }
        else {
            let mapping = {}
            resultSQL.forEach(r => {
                mapping[r.id] = r.label;
                mapping[r.label] = r.id;
            });
            req.body.mapping_roles = mapping
            return callback();
        }
    });
}