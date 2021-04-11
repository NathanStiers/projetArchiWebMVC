const db = require('../self_modules/db');
const toolbox = require("../self_modules/toolbox");

/**
 * Allows you to retrieve all the assets in a wallet
 * 
 * @param {Object} req The request Object
 * @param {Object} res The response Object
 */
exports.fetchWalletAllAssets = (req, res) => {
    toolbox.fetchAssetsBasedOnType(req.params.id_wallet).then(assetsFromType => {
        db.db.query("SELECT DISTINCT a.ticker, a.label, aw.id_wallet, aw.id, aw.quantity, aw.invested_amount, aw.price_alert, w.type FROM assets AS a, wallets AS w, assets_wallets AS aw WHERE aw.id_wallet = ? AND aw.id_asset = a.id AND w.user_id = ? AND w.id = aw.id_wallet;", [req.params.id_wallet, req.body.user_id], (error, resultSQL) => {
            if (error) {
                res.redirect('/wallets')
            } else {
                toolbox.mapping_label_id_types().then(mapping => {
                    if ((mapping[assetsFromType.type]) === "Crypto-assets") {
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
                                    type: "Crypto-assets"
                                }
                            })
                            res.render("assetView.ejs", { resultSQL, apiInfos: newDict, assetsFromType: assetsFromType.assets, id_wallet: req.params.id_wallet })
                        }).catch(error => {
                            res.redirect('/wallets')
                        })
                    } else if ((mapping[assetsFromType.type]) === "Stocks") {
                        res.render("assetView.ejs", { resultSQL, assetsFromType: assetsFromType.assets, id_wallet: req.params.id_wallet })
                    } else {
                        res.render("assetView.ejs", { resultSQL, assetsFromType: assetsFromType.assets, id_wallet: req.params.id_wallet })
                    }
                }).catch(error => {
                    res.redirect('/wallets')
                })
            }
        });
    }).catch(err => {
        res.redirect('/wallets')
    })
}

/**
 * Allows you to search for an asset based on its label
 * 
 * @param {Object} req The request Object
 * @param {Object} res The response Object
 */
exports.searchAsset = (req, res) => {
    toolbox.fetchAssetsBasedOnType(req.body.wallet_id).then(assetsFromType => {
        db.db.query("SELECT DISTINCT a.ticker, a.label, aw.id_wallet, aw.id, aw.quantity, aw.invested_amount, aw.price_alert, w.type FROM assets AS a, wallets AS w, assets_wallets AS aw WHERE aw.id_wallet = ? AND aw.id_asset = a.id AND w.user_id = ? AND w.id = aw.id_wallet AND a.label LIKE ?;", [req.body.wallet_id, req.body.user_id, '%' + req.body.searchLike + '%'], (error, resultSQL) => {
            if (error) {
                res.redirect('/wallets')
            } else {
                toolbox.mapping_label_id_types().then(mapping => {
                    if ((mapping[assetsFromType.type]) === "Crypto-assets") {
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
                                    type: "Crypto-assets"
                                }
                            })
                            res.render("assetView.ejs", { resultSQL, apiInfos: newDict, assetsFromType: assetsFromType.assets, id_wallet: req.body.wallet_id })
                        }).catch(error => {
                            res.redirect('/wallets')
                        })
                    } else if ((mapping[assetsFromType.type]) === "Stocks") {
                        res.render("assetView.ejs", { resultSQL, assetsFromType: assetsFromType.assets, id_wallet: req.body.wallet_id })
                    } else {
                        res.render("assetView.ejs", { resultSQL, assetsFromType: assetsFromType.assets, id_wallet: req.body.wallet_id })
                    }
                }).catch(error => {
                    res.redirect('/wallets')
                })
            }
        });
    }).catch(err => {
        res.redirect('/wallets')
    })
}

/**
 * Adds an asset to one user's wallet
 * 
 * @param {Object} req The request Object
 * @param {Object} res The response Object
 */
exports.addAsset = (req, res) => {
    if (req.body.wallet_type !== req.body.asset_type) {
        res.redirect('/wallets/' + req.body.wallet_id)
        return;
    }
    db.db.query("INSERT INTO assets_wallets (id_wallet, id_asset, quantity, invested_amount) VALUES(?,?,?,?);", [req.body.wallet_id, req.body.asset_id, req.body.quantity, req.body.invested_amount], (error, resultSQL) => {
        if (error) {
            res.redirect('/wallets/' + req.body.wallet_id)
        } else {
            res.redirect('/wallets/' + req.body.wallet_id)
        }
    });
}

/**
 * Remove an asset to one user's wallet
 * 
 * @param {Object} req The request Object
 * @param {Object} res The response Object
 */
exports.removeAsset = (req, res) => {
    db.db.query("DELETE FROM assets_wallets WHERE id = ?;", [JSON.parse(req.body.assetInfos).id], (error, resultSQL) => {
        if (error) {
            res.redirect('/wallets/' + req.body.wallet_id)
        } else {
            res.redirect('/wallets/' + req.body.wallet_id)
        }
    });
}

/**
 * Allows you to change the quantity owned of an asset
 * 
 * @param {Object} req The request Object
 * @param {Object} res The response Object
 */
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
        } else {
            assetParsed.quantity = req.body.quantity
            res.render('assetInfoView.ejs', { api, asset: assetParsed })
        }
    });
}

/**
 * Allows you to set the alert price of an asset if the user is premium
 * 
 * @param {Object} req The request Object
 * @param {Object} res The response Object
 * @todo this UserStory is not implemented on the website
 */
exports.setPriceAlert = (req, res) => {
    if (req.body.price_alert <= 0) {
        res.status(403).send("Le montant est incorrect")
        return;
    }
    toolbox.mapping_label_id_roles().then(mapping => {
        db.db.query("SELECT * FROM users WHERE id = ? AND role = ?;", [req.body.user_id, mapping["premium"]], (error, resultSQL) => {
            if (error) {
                res.status(500).send(error)
            } else if (resultSQL.length) {
                res.status(403).send("Il s'agit d'une fonctionnalité premium")
            } else {
                db.db.query("UPDATE assets_wallets SET price_alert = ? WHERE id_wallet = ? AND id_asset = ?;", [req.body.price_alert, req.body.wallet_id, req.body.asset_id], (error, resultSQL) => {
                    if (error) {
                        res.status(500).send(error)
                    } else {
                        res.status(200).send("Mise à jour effectuée")
                    }
                });
            }
        });
    }).catch(err => {
        res.status(500).send(err);
    })
}

/**
 * Allows you to change the invested amount of an asset
 * 
 * @param {Object} req The request Object
 * @param {Object} res The response Object
 */
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
        } else {
            assetParsed.invested_amount = req.body.invested_amount
            res.render('assetInfoView.ejs', { api, asset: assetParsed })
        }
    })
}

/**
 * Fetch more data of an asset
 * 
 * @param {Object} req The request Object
 * @param {Object} res The response Object
 */
exports.infoAsset = (req, res) => {
    let api = undefined
    toolbox.mapping_label_id_types().then(mapping => {
        if (req.body.apiInfos != undefined) {
            api = JSON.parse(req.body.apiInfos)
            res.render('assetInfoView.ejs', { api, asset: JSON.parse(req.body.assetInfos) })
        } else if (mapping[JSON.parse(req.body.assetInfos).type] === "Stocks") {
            toolbox.actionValueCall(JSON.parse(req.body.assetInfos).ticker).then(result => {
                api = {
                    name: JSON.parse(req.body.assetInfos).label,
                    ticker: JSON.parse(req.body.assetInfos).ticker,
                    max_supply: 0,
                    total_supply: 0,
                    market_cap: 0,
                    price: result.eod[0].close || 0,
                    type: "Stocks"
                }
                res.render('assetInfoView.ejs', { api, asset: JSON.parse(req.body.assetInfos) })
            }).catch(error => {
                res.redirect('/wallets/' + JSON.parse(req.body.assetInfos).id_wallet)
            })
        }
    }).catch(error => {
        res.redirect('/wallets/' + JSON.parse(req.body.assetInfos).id_wallet)
    })
}