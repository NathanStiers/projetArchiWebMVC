let Asset = require('../models/assetModel');

const db = require('../self_modules/db');
const toolbox = require("../self_modules/toolbox");

exports.fetchAllAssets = (req, res) => {
    db.db.query("SELECT * FROM assets;", (error, resultSQL) => {
        if (error) {
            res.status(500).send(error)
            return;
        } else {
            resultSQL.forEach(r => {
                delete r.id
            });
            res.status(200).json(resultSQL)
            return;
        }
    });
}


exports.fetchWalletAllAssets = (req, res) => {
    toolbox.fetchAssetsBasedOnType(req.params.id_wallet).then(assetsFromType => {
        db.db.query("SELECT DISTINCT a.ticker, a.label, aw.id_wallet, aw.id, aw.quantity, aw.invested_amount, aw.price_alert, w.type FROM assets AS a, wallets AS w, assets_wallets AS aw WHERE aw.id_wallet = ? AND aw.id_asset = a.id AND w.user_id = ? AND w.id = aw.id_wallet;", [req.params.id_wallet, req.body.user_id], (error, resultSQL) => {
            if (error) {
                res.redirect('/wallets')
                return;
            } else {
                toolbox.mapping_label_id_types().then(mapping => {
                    if (mapping[resultSQL[0].type] === "Crypto-actifsss") {
                        toolbox.cyptoValuesCall().then(cryptoAPI => {
                            console.log(cryptoAPI)
                            res.render("assetView.ejs", {resultSQL, cryptoAPI, assetsFromType})
                            return;
                        }).catch(error => {
                            console.log(error)
                            res.redirect('/wallets')
                            return;
                        })
                    } else {
                        res.render("assetView.ejs", {resultSQL, assetsFromType})
                        return;
                    }
                }).catch(error => {
                    console.log(error)
                    res.redirect('/wallets')
                    return;
                })
            }
        });
    }).catch(err => {
        res.redirect('/wallets')
    })
    
}

exports.addAsset = (req, res) => {
    if (req.body.wallet_type !== req.body.asset_type) {
        res.status(403).send("Le type de l'asset ne correspond pas à celui du portefeuille")
        return;
    }
    db.db.query("INSERT INTO assets_wallets (id_wallet, id_asset, quantity, invested_amount) VALUES(?,?,?,?,?);", [req.body.wallet_id, req.body.asset_id, req.body.quantity, req.body.invested_amount], (error, resultSQL) => {
        if (error) {
            res.status(500).send(error)
            return;
        } else {
            res.status(201).send("Ajout effectué")
            return;
        }
    });
}

exports.removeAsset = (req, res) => {
    db.db.query("DELETE FROM assets_wallets WHERE id_wallet = ? AND id_asset = ?;", [req.body.wallet_id, req.body.asset_id], (error, resultSQL) => {
        if (error) {
            res.status(500).send(error)
            return;
        } else {
            res.status(200).send("Suppression effectuée")
            return;
        }
    });
}

exports.changeQtyAsset = (req, res) => {
    if (req.body.quantity <= 0) {
        res.status(403).send("Le montant est incorrect")
        return;
    }
    db.db.query("UPDATE assets_wallets SET quantity = ? WHERE id = ?;", [req.body.quantity, req.body.aw_id], (error, resultSQL) => {
        if (error) {
            res.status(500).send(error)
            return;
        } else {
            res.status(200).send("Mise à jour effectuée")
            return;
        }
    });
}

exports.setPriceAlert = (req, res) => {
    if (req.body.price_alert <= 0) {
        res.status(403).send("Le montant est incorrect")
        return;
    }
    toolbox.mapping_label_id_roles().then(mapping => {
        db.db.query("SELECT * FROM users WHERE id = ? AND role = ?;", [req.body.user_id, mapping["premium"]], (error, resultSQL) => {
            if (error) {
                res.status(500).send(error)
                return;
            } else if (resultSQL.length) {
                res.status(403).send("Il s'agit d'une fonctionnalité premium")
                return;
            } else {
                db.db.query("UPDATE assets_wallets SET price_alert = ? WHERE id_wallet = ? AND id_asset = ?;", [req.body.price_alert, req.body.wallet_id, req.body.asset_id], (error, resultSQL) => {
                    if (error) {
                        res.status(500).send(error)
                        return;
                    } else {
                        res.status(200).send("Mise à jour effectuée")
                        return;
                    }
                });
            }
        });
    }).catch(err => {
        res.status(500).send(err);
        return;
    })
}

exports.changeInitialInvestment = (req, res) => {
    if (req.body.invested_amount <= 0) {
        res.status(403).send("Le montant est incorrect")
        return;
    }
    db.db.query("UPDATE assets_wallets SET invested_amount = ? WHERE id = ?;", [req.body.invested_amount, req.body.aw_id], (error, resultSQL) => {
        if (error) {
            res.status(500).send(error)
            return;
        } else {
            res.status(200).send("Mise à jour effectuée")
            return;
        }
    })
}

__fetchTypeAssets = (type) => {
    //permet de récupérer les assets d'un certain type dans le base de données
}

