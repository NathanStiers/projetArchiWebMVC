const db = require('../db');

module.exports = (req, res, callback) => {
    db.db.query("SELECT * FROM types;", (error, resultSQL) => {
        if (error) {
            res.redirect('/login')
            return;
        }
        else {
            let mapping = {}
            resultSQL.forEach(r => {
                mapping[r.id] = r.label;
                mapping[r.label] = r.id;
            });
            req.body.mapping_types = mapping
            callback()
            return;
        }
    });
}