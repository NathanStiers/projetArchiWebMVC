const cookieParser = require('cookie-parser');
const User = require('../models/userModel');
let Wallet = require('../models/walletModel');

const db = require('../self_modules/db');
const toolbox = require("../self_modules/toolbox");

let mapping_label_id_types = {};

// Permet de récupérer les différents portefeuilles d'un utilisateur
// Method : POST 
// Body : user_id (from jwt)
exports.fetchAllWallets = (req, res) => {
    let user = new User(req.body.user_id, req.body.user_role, null, null, null, null, []);
    toolbox.mapping_label_id_types().then(result => {
        mapping_label_id_types = result;
        db.db.query("SELECT * FROM wallets WHERE user_id = ? ORDER BY creation_date ASC, id ASC LIMIT ?;", [user.id, user.role === "premium" ? 10 : 3], (error, resultSQL) => {
            if (error) {
                res.render('walletView.ejs', { user : null, max_reached: true, types : null, notification : error + ". Please contact the webmaster" })
                return;
            } else {
                toolbox.fetchAllTypes().then(result => {
                    resultSQL.forEach(w => {
                        user.wallet_list.push(new Wallet(w.id, mapping_label_id_types[w.type], w.label, w.creation_date, [], user.id))
                    });
                    res.render('walletView.ejs', { user, max_reached: req.body.max_reached, types: result, notification : req.body.notification })
                    return;
                }).catch(error => {
                    res.render('walletView.ejs', { user : null, max_reached: true, types : null, notification : error + ". Please contact the webmaster" })
                });
            }
        });
    }).catch(error => {
        res.render('walletView.ejs', { user : null, max_reached: true, types : null, notification : error + ". Please contact the webmaster" })
        return;
    });
}

exports.searchWallet = (req, res) => {
    let user = new User(req.body.user_id, req.body.user_role, null, null, null, null, []);
    toolbox.mapping_label_id_types().then(result => {
        mapping_label_id_types = result;
        db.db.query("SELECT * FROM wallets WHERE user_id = ? AND label LIKE ? ORDER BY creation_date ASC, id ASC LIMIT ?;", [user.id, '%' + req.body.searchLike + '%', user.role === "premium" ? 10 : 3], (error, resultSQL) => {
            if (error) {
                res.render('walletView.ejs', { user : null, max_reached: true, types : null, notification : error + ". Please contact the webmaster" })
                return;
            } else {
                console.log(resultSQL)
                toolbox.fetchAllTypes().then(result => {
                    resultSQL.forEach(w => {
                        user.wallet_list.push(new Wallet(w.id, mapping_label_id_types[w.type], w.label, w.creation_date, [], user.id))
                    });
                    res.render('walletView.ejs', { user, max_reached: req.body.max_reached, types: result, notification : req.body.notification })
                    return;
                }).catch(error => {
                    res.render('walletView.ejs', { user : null, max_reached: true, types : null, notification : error + ". Please contact the webmaster" })
                });
            }
        });
    }).catch(error => {
        res.render('walletView.ejs', { user : null, max_reached: true, types : null, notification : error + ". Please contact the webmaster" })
        return;
    });
}

// Permet de créer un portefeuille vide si la limite de l'utilisateur n'est pas atteinte
// Method : POST 
// Body : user_id, type, label
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
        if(wallet.type !== "Actions" && wallet.type !== "Crypto-actifs"){
            req.body.notification = "Ce type n'est pas encore utilisable"
            this.fetchAllWallets(req, res);
            return;
        }
        db.db.query("INSERT INTO wallets (type, user_id, label, creation_date) VALUES (?, ?, ?, ?);", [mapping_label_id_types[wallet.type], wallet.user_id, wallet.label, date], (error, resultSQL) => {
            if (error) {
                req.body.notification = error + ". Please contact the webmaster"
                this.fetchAllWallets(req, res);
                return;
            } else {
                req.body.notification = "Ajout effectué"
                wallet.id = resultSQL.insertId;
                this.fetchAllWallets(req, res);
                return;
            }
        });
    }).catch(error => {
        req.body.notification = error + ". Please contact the webmaster"
        this.fetchAllWallets(req, res);
        return;
    });
}

// Permet de supprimer un portefeuille sur base de son id et de son id_user
// Method : POST 
// Body : id, user_id (from jwt)
exports.deleteWallet = (req, res) => {
    let wallet = new Wallet(req.params.id_wallet, null, null, null, [], req.body.user_id);
    db.db.query("DELETE FROM wallets WHERE id = ? AND user_id = ?;", [wallet.id, wallet.user_id], (error, resultSQL) => {
        if (error) {
            req.body.notification = error + ". Please contact the webmaster"
            this.fetchAllWallets(req, res);
            return;
        } else {
            req.body.notification = "Suppression effectuée  "
            this.fetchAllWallets(req, res);
            return;
        }
    });
}

// Permet de renommer un portefeuille sur base de son id et de son id_user
// Method : POST 
// Body : id, user_id, label
exports.renameWallet = (req, res) => {
    let wallet = new Wallet(req.body.wallet_id, null, req.body.label, null, [], req.body.user_id);
    db.db.query("UPDATE wallets SET label = ? WHERE id = ? AND user_id = ?;", [wallet.label, wallet.id, wallet.user_id], (error, resultSQL) => {
        if (error) {
            res.redirect('/wallets/' + wallet.id)
            return;
        } else {
            res.redirect('/wallets/' + wallet.id)
            return;
        }
    });
}
