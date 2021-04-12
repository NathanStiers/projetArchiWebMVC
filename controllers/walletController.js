const User = require('../models/userModel');
let Wallet = require('../models/walletModel');

const db = require('../self_modules/db');
const toolbox = require("../self_modules/toolbox");

/**
 * Allows you to retrieve the various wallets of a user
 * 
 * @param {Object} req The request Object
 * @param {Object} res The response Object
 */
exports.fetchAllWallets = (req, res) => {
    let user = new User(req.body.user_id, req.body.user_role, null, null, null, null, []);
    let mapping_types = req.body.mapping_types
    db.db.query("SELECT * FROM wallets WHERE user_id = ? ORDER BY creation_date ASC, id ASC LIMIT ?;", [user.id, user.role === "premium" ? 10 : 3], (error, resultSQL) => {
        if (error) {
            res.render('walletView.ejs', { user : null, max_reached: true, types : null, notification : error + ". Please contact the webmaster" })
        } else {
            toolbox.fetchAllTypes().then(result => {
                resultSQL.forEach(w => {
                    user.wallet_list.push(new Wallet(w.id, mapping_types[w.type], w.label, w.creation_date, [], user.id))
                });
                res.render('walletView.ejs', { user, max_reached: req.body.max_reached, types: result, notification : req.flash().notification })
            }).catch(error => {
                res.render('walletView.ejs', { user : null, max_reached: true, types : null, notification : error + ". Please contact the webmaster" })
            });
        }
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
    let mapping_types = req.body.mapping_types
    db.db.query("SELECT * FROM wallets WHERE user_id = ? AND label LIKE ? ORDER BY creation_date ASC, id ASC LIMIT ?;", [user.id, '%' + req.body.searchLike + '%', user.role === "premium" ? 10 : 3], (error, resultSQL) => {
        if (error) {
            req.flash('notification', error + '. Please contact the webmaster');
            res.redirect('/wallets')
            return;
        } else {
            toolbox.fetchAllTypes().then(result => {
                resultSQL.forEach(w => {
                    user.wallet_list.push(new Wallet(w.id, mapping_types[w.type], w.label, w.creation_date, [], user.id))
                });
                res.render('walletView.ejs', { user, max_reached: req.body.max_reached, types: result, notification : req.flash().notification })
            }).catch(error => {
                req.flash('notification', error + '. Please contact the webmaster');
                res.redirect('/wallets')
            });
        }
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
        req.flash('notification', 'You have reached your maximum number of wallets');
        res.redirect('/wallets')
        return;
    }
    if(req.body.label === ""){
        req.flash('notification', 'The label cannot be empty');
        res.redirect('/wallets')
        return;
    }
    let mapping_types = req.body.mapping_types
    let date = new Date();
    date = date.getUTCFullYear() + '-' +
        ('00' + (date.getUTCMonth() + 1)).slice(-2) + '-' +
        ('00' + date.getUTCDate()).slice(-2)
    let wallet = new Wallet(null, req.body.type, req.body.label, date, [], req.body.user_id);
    if(wallet.type !== "Stocks" && wallet.type !== "Crypto-assets"){
        req.flash('notification', 'This type is not yet available');
        res.redirect('/wallets')
        return;
    }
    db.db.query("INSERT INTO wallets (type, user_id, label, creation_date) VALUES (?, ?, ?, ?);", [mapping_types[wallet.type], wallet.user_id, wallet.label, date], (error, resultSQL) => {
        if (error) {
            req.flash('notification', error + '. Please contact the webmaster');
            res.redirect('/wallets')
        } else {
            req.flash('notification', 'Correctly added');
            res.redirect('/wallets')
        }
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
            req.flash('notification', error + '. Please contact the webmaster');
            res.redirect('/wallets')
        } else {
            req.flash('notification', 'Correctly deleted');
            res.redirect('/wallets')
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
    if(wallet.label === ""){
        req.flash('notification', 'The label cannot be empty');
        res.redirect('/wallets/' + wallet.id)
        return;
    }
    db.db.query("UPDATE wallets SET label = ? WHERE id = ? AND user_id = ?;", [wallet.label, wallet.id, wallet.user_id], (error, resultSQL) => {
        if (error) {
            req.flash('notification', error + '. Please contact the webmaster');
            res.redirect('/wallets/' + wallet.id)
        } else {
            req.flash('notification', 'Successful change of label');
            res.redirect('/wallets/' + wallet.id)
        }
    });
}