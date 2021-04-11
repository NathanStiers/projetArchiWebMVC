const User = require('../models/userModel');
let Wallet = require('../models/walletModel');

const db = require('../self_modules/db');
const toolbox = require("../self_modules/toolbox");

let mapping_label_id_types = {};

/**
 * Allows you to retrieve the various wallets of a user
 * 
 * @param {Object} req The request Object
 * @param {Object} res The response Object
 */
exports.fetchAllWallets = (req, res) => {
    let user = new User(req.body.user_id, req.body.user_role, null, null, null, null, []);
    toolbox.mapping_label_id_types().then(result => {
        mapping_label_id_types = result;
        db.db.query("SELECT * FROM wallets WHERE user_id = ? ORDER BY creation_date ASC, id ASC LIMIT ?;", [user.id, user.role === "premium" ? 10 : 3], (error, resultSQL) => {
            if (error) {
                res.render('walletView.ejs', { user : null, max_reached: true, types : null, notification : error + ". Please contact the webmaster" })
            } else {
                toolbox.fetchAllTypes().then(result => {
                    resultSQL.forEach(w => {
                        user.wallet_list.push(new Wallet(w.id, mapping_label_id_types[w.type], w.label, w.creation_date, [], user.id))
                    });
                    res.render('walletView.ejs', { user, max_reached: req.body.max_reached, types: result, notification : req.body.notification })
                }).catch(error => {
                    res.render('walletView.ejs', { user : null, max_reached: true, types : null, notification : error + ". Please contact the webmaster" })
                });
            }
        });
    }).catch(error => {
        res.render('walletView.ejs', { user : null, max_reached: true, types : null, notification : error + ". Please contact the webmaster" })
    });
}

/**
 * Allows you to search for a wallet based on its label
 * 
 * @param {Object} req The request Object
 * @param {Object} res The response Object
 */
exports.searchWallet = (req, res) => {
    let user = new User(req.body.user_id, req.body.user_role, null, null, null, null, []);
    toolbox.mapping_label_id_types().then(result => {
        mapping_label_id_types = result;
        db.db.query("SELECT * FROM wallets WHERE user_id = ? AND label LIKE ? ORDER BY creation_date ASC, id ASC LIMIT ?;", [user.id, '%' + req.body.searchLike + '%', user.role === "premium" ? 10 : 3], (error, resultSQL) => {
            if (error) {
                res.render('walletView.ejs', { user : null, max_reached: true, types : null, notification : error + ". Please contact the webmaster" })
            } else {
                console.log(resultSQL)
                toolbox.fetchAllTypes().then(result => {
                    resultSQL.forEach(w => {
                        user.wallet_list.push(new Wallet(w.id, mapping_label_id_types[w.type], w.label, w.creation_date, [], user.id))
                    });
                    res.render('walletView.ejs', { user, max_reached: req.body.max_reached, types: result, notification : req.body.notification })
                }).catch(error => {
                    res.render('walletView.ejs', { user : null, max_reached: true, types : null, notification : error + ". Please contact the webmaster" })
                });
            }
        });
    }).catch(error => {
        res.render('walletView.ejs', { user : null, max_reached: true, types : null, notification : error + ". Please contact the webmaster" })
    });
}

/**
 * Creates an empty wallet if the user's limit is not reached
 * 
 * @param {Object} req The request Object
 * @param {Object} res The response Object
 */
exports.createWallet = (req, res) => {
    if(req.body.max_reached){
        req.body.notification = "Vous avez atteint votre nombre maximum de portefeuille"
        this.fetchAllWallets(req, res);
        return;
    }
    if(req.body.label === ""){
        req.body.notification = "Le label ne peut pas être vide"
        this.fetchAllWallets(req, res);
        return;
    }
    toolbox.mapping_label_id_types().then(result => {
        mapping_label_id_types = result
        let date = new Date();
        date = date.getUTCFullYear() + '-' +
            ('00' + (date.getUTCMonth() + 1)).slice(-2) + '-' +
            ('00' + date.getUTCDate()).slice(-2)
        let wallet = new Wallet(null, req.body.type, req.body.label, date, [], req.body.user_id);
        if(wallet.type !== "Stocks" && wallet.type !== "Crypto-assets"){
            req.body.notification = "Ce type n'est pas encore utilisable"
            this.fetchAllWallets(req, res);
            return;
        }
        db.db.query("INSERT INTO wallets (type, user_id, label, creation_date) VALUES (?, ?, ?, ?);", [mapping_label_id_types[wallet.type], wallet.user_id, wallet.label, date], (error, resultSQL) => {
            if (error) {
                req.body.notification = error + ". Please contact the webmaster"
                this.fetchAllWallets(req, res);
            } else {
                req.body.notification = "Ajout effectué"
                wallet.id = resultSQL.insertId;
                this.fetchAllWallets(req, res);
            }
        });
    }).catch(error => {
        req.body.notification = error + ". Please contact the webmaster"
        this.fetchAllWallets(req, res);
    });
}

/**
 * Allows you to delete a wallet based on its id and its id_user
 * 
 * @param {Object} req The request Object
 * @param {Object} res The response Object
 */
exports.deleteWallet = (req, res) => {
    let wallet = new Wallet(req.params.id_wallet, null, null, null, [], req.body.user_id);
    db.db.query("DELETE FROM wallets WHERE id = ? AND user_id = ?;", [wallet.id, wallet.user_id], (error, resultSQL) => {
        if (error) {
            req.body.notification = error + ". Please contact the webmaster"
            this.fetchAllWallets(req, res);
        } else {
            req.body.notification = "Suppression effectuée  "
            this.fetchAllWallets(req, res);
        }
    });
}

/**
 * Allows you to rename a wallet based on its id and its id_user
 * 
 * @param {Object} req The request Object
 * @param {Object} res The response Object
 */
exports.renameWallet = (req, res) => {
    let wallet = new Wallet(req.body.wallet_id, null, req.body.label, null, [], req.body.user_id);
    db.db.query("UPDATE wallets SET label = ? WHERE id = ? AND user_id = ?;", [wallet.label, wallet.id, wallet.user_id], (error, resultSQL) => {
        if (error) {
            res.redirect('/wallets/' + wallet.id)
        } else {
            res.redirect('/wallets/' + wallet.id)
        }
    });
}