let Asset = require('../models/assetModel');

const db = require('../self_modules/db');
const toolbox = require("../self_modules/toolbox");

exports.fetchAllAssets = (req, res) => {
    db.db.query("SELECT * FROM assets;", (error, resultSQL) => {
        if (error) {
            res.status(500).send(error)
            return;
        } else {
            /*resultSQL.forEach(r => {
                delete r.id
            });*/
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
                    if ((mapping[assetsFromType.type]) === "Crypto-actifs") {
                        let newDict = {}
                        toolbox.cyptoValuesCall().then(cryptoAPI => {
                            cryptoAPI.forEach(el => {
                                newDict[el.symbol] = {
                                    name: el.name,
                                    ticker: el.symbol,
                                    max_supply: el.max_supply,
                                    total_supply: el.total_supply,
                                    market_cap: el.quote.EUR.market_cap,
                                    price: el.quote.EUR.price,
                                    type: "Crypto-actifs"
                                }
                            })
                            res.render("assetView.ejs", { resultSQL, apiInfos: newDict, assetsFromType: assetsFromType.assets, id_wallet: req.params.id_wallet })
                            return;
                        }).catch(error => {
                            res.redirect('/wallets')
                            return;
                        })
                    } else if ((mapping[assetsFromType.type]) === "Actions") {
                        res.render("assetView.ejs", { resultSQL, assetsFromType: assetsFromType.assets, id_wallet: req.params.id_wallet })
                        return;
                    } else {
                        res.render("assetView.ejs", { resultSQL, assetsFromType: assetsFromType.assets, id_wallet: req.params.id_wallet })
                        return;
                    }
                }).catch(error => {
                    res.redirect('/wallets')
                    return;
                })
            }
        });
    }).catch(err => {
        res.redirect('/wallets')
    })
}

exports.searchAsset = (req, res) => {
    toolbox.fetchAssetsBasedOnType(req.body.wallet_id).then(assetsFromType => {
        db.db.query("SELECT DISTINCT a.ticker, a.label, aw.id_wallet, aw.id, aw.quantity, aw.invested_amount, aw.price_alert, w.type FROM assets AS a, wallets AS w, assets_wallets AS aw WHERE aw.id_wallet = ? AND aw.id_asset = a.id AND w.user_id = ? AND w.id = aw.id_wallet AND a.label LIKE ?;", [req.body.wallet_id, req.body.user_id, '%' + req.body.searchLike + '%'], (error, resultSQL) => {
            if (error) {
                res.redirect('/wallets')
                return;
            } else {
                toolbox.mapping_label_id_types().then(mapping => {
                    if ((mapping[assetsFromType.type]) === "Crypto-actifs") {
                        let newDict = {}
                        toolbox.cyptoValuesCall().then(cryptoAPI => {
                            cryptoAPI.forEach(el => {
                                newDict[el.symbol] = {
                                    name: el.name,
                                    ticker: el.symbol,
                                    max_supply: el.max_supply,
                                    total_supply: el.total_supply,
                                    market_cap: el.quote.EUR.market_cap,
                                    price: el.quote.EUR.price,
                                    type: "Crypto-actifs"
                                }
                            })
                            res.render("assetView.ejs", { resultSQL, apiInfos: newDict, assetsFromType: assetsFromType.assets, id_wallet: req.body.wallet_id })
                            return;
                        }).catch(error => {
                            res.redirect('/wallets')
                            return;
                        })
                    } else if ((mapping[assetsFromType.type]) === "Actions") {
                        res.render("assetView.ejs", { resultSQL, assetsFromType: assetsFromType.assets, id_wallet: req.body.wallet_id })
                        return;
                    } else {
                        res.render("assetView.ejs", { resultSQL, assetsFromType: assetsFromType.assets, id_wallet: req.body.wallet_id })
                        return;
                    }
                }).catch(error => {
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
        res.redirect('/wallets/' + req.body.wallet_id)
        return;
    }
    db.db.query("INSERT INTO assets_wallets (id_wallet, id_asset, quantity, invested_amount) VALUES(?,?,?,?);", [req.body.wallet_id, req.body.asset_id, req.body.quantity, req.body.invested_amount], (error, resultSQL) => {
        if (error) {
            res.redirect('/wallets/' + req.body.wallet_id)
            return;
        } else {
            res.redirect('/wallets/' + req.body.wallet_id)
            return;
        }
    });
}

exports.removeAsset = (req, res) => {
    db.db.query("DELETE FROM assets_wallets WHERE id = ?;", [JSON.parse(req.body.assetInfos).id], (error, resultSQL) => {
        if (error) {
            res.redirect('/wallets/' + req.body.wallet_id)
            return;
        } else {
            res.redirect('/wallets/' + req.body.wallet_id)
            return;
        }
    });
}

exports.changeQtyAsset = (req, res) => {
    let assetParsed = JSON.parse(req.body.assetInfos)
    let api = undefined
    if (req.body.apiInfos != undefined) {
        api = JSON.parse(req.body.apiInfos)
    }
    if (req.body.quantity <= 0) {
        res.render('assetInfoView.ejs', { api, asset: assetParsed, notification: "La quantité est invalide" })
        return;
    }
    db.db.query("UPDATE assets_wallets SET quantity = ? WHERE id = ?;", [req.body.quantity, assetParsed.id], (error, resultSQL) => {
        if (error) {
            res.render('assetInfoView.ejs', { api, asset: assetParsed, notification: "Erreur inconnue" })
            return;
        } else {
            assetParsed.quantity = req.body.quantity
            res.render('assetInfoView.ejs', { api, asset: assetParsed })
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
    let assetParsed = JSON.parse(req.body.assetInfos)
    let api = undefined
    if (req.body.apiInfos != undefined) {
        api = JSON.parse(req.body.apiInfos)
    }
    if (req.body.invested_amount <= 0) {
        res.render('assetInfoView.ejs', { api, asset: assetParsed, notification: "Le montant est incorrect" })
        return;
    }
    db.db.query("UPDATE assets_wallets SET invested_amount = ? WHERE id = ?;", [req.body.invested_amount, assetParsed.id], (error, resultSQL) => {
        if (error) {
            res.render('assetInfoView.ejs', { api, asset: assetParsed, notification: "Le montant est incorrect" })
            return;
        } else {
            assetParsed.invested_amount = req.body.invested_amount
            res.render('assetInfoView.ejs', { api, asset: assetParsed })
            return;
        }
    })
}

exports.infoAsset = (req, res) => {
    let api = undefined
    toolbox.mapping_label_id_types().then(mapping => {
        if (req.body.apiInfos != undefined) {
            api = JSON.parse(req.body.apiInfos)
            res.render('assetInfoView.ejs', { api, asset: JSON.parse(req.body.assetInfos) })
            return;
        } else if (mapping[JSON.parse(req.body.assetInfos).type] === "Actions") {
            toolbox.actionValueCall(JSON.parse(req.body.assetInfos).ticker).then(result => {
                api = {
                    name: JSON.parse(req.body.assetInfos).label,
                    ticker: JSON.parse(req.body.assetInfos).ticker,
                    max_supply: 0,
                    total_supply: 0,
                    market_cap: 0,
                    price: result.eod[0].close || 0,
                    type: "Actions"
                }
                res.render('assetInfoView.ejs', { api, asset: JSON.parse(req.body.assetInfos) })
                return;
            }).catch(error => {
                res.redirect('/wallets/' + JSON.parse(req.body.assetInfos).id_wallet)
                return;
            })
        }
    }).catch(error => {
        res.redirect('/wallets/' + JSON.parse(req.body.assetInfos).id_wallet)
        return;
    })
}

__fetchTypeAssets = (type) => {
    //permet de récupérer les assets d'un certain type dans le base de données
}

