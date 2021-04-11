let User = require('../models/userModel');

const db = require('../self_modules/db');
const toolbox = require("../self_modules/toolbox");
const bcrypt = require('bcrypt');
const generator = require('generate-password');
const jwt = require('jsonwebtoken');

const saltRounds = 12;

// Permet de créer un nouvel utilisateur s'il n'existe pas déjà
// Method : POST 
// Body : name, surname, mail, password
exports.createUser = (req, res) => {
    if (req.body.notification) {
        res.render('SubscribeView.ejs', { notification: req.body.notification })
        return;
    }
    if (req.body.password !== req.body.passwordConfirm) {
        res.render('SubscribeView.ejs', { notification: "Les mots de passe ne correspondent pas" })
        return;
    }
    let user = new User(null, 1, req.body.name, req.body.surname, req.body.mail, null, []);
    bcrypt.hash(req.body.password, saltRounds, (err, hash) => {
        if (err) {
            res.render('SubscribeView.ejs', { notification: err + ". Please contact the webmaster" })
            return;
        }
        user.password = hash;
        if (!toolbox.checkMail(user.mail)) { //Check all info user
            res.render('SubscribeView.ejs', { notification: "Le mail ne correspond pas au bon format" })
            return;
        }
        let mapping_roles = req.body.mapping_roles
        db.db.query("INSERT INTO users (role, name, surname, mail, password) VALUES (?, ?, ?, ?, ?);", [mapping_roles['basic'], user.name, user.surname, user.mail, user.password], (error, resultSQL) => {
            if (error) {
                if (error.errno === 1062) {
                    res.render('SubscribeView.ejs', { notification: "Ce mail est déjà utilisé" })
                } else {
                    res.render('SubscribeView.ejs', { notification: error + ". Please contact the webmaster" })
                }
            } else {
                user.id = resultSQL.insertId;
                user.password = null;
                user.role = "basic";
                const token = jwt.sign({ user_id: user.id, user_role: user.role }, process.env.ACCESS_TOKEN_SECRET);
                let d = new Date();
                let expires = d.setTime(d.getTime() + 6 * 60 * 60 * 1000);
                res.cookie('Token', token, { maxAge: expires });
                res.redirect('/wallets')
            }
        });
    })
}

// Permet d'authentifier un utilisateur sur base de son mail et de son mot de passe
// Method : POST 
// Body : mail, password
exports.connectUser = (req, res) => {
    if (req.body.notification) {
        res.render('LoginView.ejs', { notification: req.body.notification })
        return;
    }
    bcrypt.compare(req.body.password, req.body.user.password, function (error, result) {
        if (error) {
            res.render('LoginView.ejs', { notification: error + ". Please contact the webmaster" })
        } else if (result) {
            delete req.body.user.password
            const token = jwt.sign({ user_id: req.body.user.id, user_role: req.body.user.role }, process.env.ACCESS_TOKEN_SECRET);
            let d = new Date();
            let expires = d.setTime(d.getTime() + 6 * 60 * 60 * 1000);
            res.cookie('Token', token, { maxAge: expires });
            res.redirect('/wallets')
        } else {
            res.render('LoginView.ejs', { notification: "Authentification incorrecte" })
        }
    });
}

// Permet de modifier le rôle d'un utilisateur classique vers utilisateur premium sur base de son id
// Method : GET
// Body : id (from JWT)
exports.upgradeUser = (req, res) => {
    let mapping_roles = req.body.mapping_roles
    if (req.body.user_role === "premium") {
        res.render('premiumView.ejs', { notification: "Vous êtes déjà premium" })
        return;
    }
    db.db.query("UPDATE users SET role = ? WHERE id = ?;", [mapping_roles["premium"], req.body.user_id], (error, resultSQL) => {
        if (error) {
            res.render('premiumView.ejs', { notification: error + ". Please contact the webmaster" })
        } else {
            const token = jwt.sign({ user_id: req.body.user_id, user_role: "premium" }, process.env.ACCESS_TOKEN_SECRET);
            let d = new Date();
            let expires = d.setTime(d.getTime() + 6 * 60 * 60 * 1000);
            res.cookie('Token', token, { maxAge: expires });
            res.render('premiumView.ejs', { notification: "Vous êtes maintenant premium" })
        }
    })
}

// Permet à un utilisateur étourdi de récupérer son mot de passe sur base de son email
// Method : POST
// Body : email
exports.forgotPwdUser = (req, res) => {
    if (req.body.notification) {
        res.render('LoginView.ejs', { notification: req.body.notification })
        return;
    }
    let mail = req.body.user.mail
    let id = req.body.user.id
    let newPassword = generator.generate({
        length: 10,
        numbers: true
    });
    bcrypt.hash(newPassword, saltRounds, (error, hash) => {
        if (error) {
            res.render('LoginView.ejs', { notification: error + ". Please contact the webmaster" })
            return;
        }
        db.db.query("UPDATE users SET password = ? WHERE id = ?;", [hash, id], (error, resultSQL) => {
            if (error) {
                res.render('LoginView.ejs', { notification: error + ". Please contact the webmaster" })
            } else {
                toolbox.sendMail(mail, "Confidential : Your new password", newPassword).then(result => {
                    res.render('LoginView.ejs', { notification: "Email envoyé à : " + mail })
                }).catch(error => {
                    res.render('LoginView.ejs', { notification: error + ". Please contact the webmaster" })
                });
            }
        });
    })
}

exports.statisticsResults = (req, res) => {
    db.db.query("SELECT DISTINCT a.ticker, a.label, aw.id_wallet, aw.id, aw.quantity, aw.invested_amount, aw.price_alert, w.type FROM assets AS a, wallets AS w, assets_wallets AS aw WHERE aw.id_asset = a.id AND w.user_id = ? AND w.id = aw.id_wallet AND w.id IN (SELECT * FROM(SELECT win.id FROM wallets AS win WHERE win.user_id = ? ORDER BY win.creation_date ASC, win.id ASC LIMIT ?) temp_tab);", [req.body.user_id, req.body.user_id, req.body.user_role === "premium" ? 10 : 3], (error, resultSQL) => {
        if (error) {
            res.render('statisticsView.ejs', { notification: error + ". Please contact the webmaster" })
        } else {
            let newDict = {}
            toolbox.mapping_label_id_types().then(mapping => {
                toolbox.cyptoValuesCall().then(cryptoAPI => {
                    cryptoAPI.forEach(el => {
                        newDict[el.symbol] = {
                            name: el.name,
                            ticker: el.symbol,
                            price: el.quote.EUR.price
                        }
                    })
                    let howMuchType = {
                        "Crypto-assets": resultSQL.filter(el => mapping[el.type] === "Crypto-assets").length,
                        "Stocks": resultSQL.filter(el => mapping[el.type] === "Stocks").length,
                        "TODO": resultSQL.filter(el => mapping[el.type] === "TODO").length
                    }
                    let totalProfit = 0
                    let pruComparison = {
                        "best": ['error', Number.MAX_VALUE],
                        "worst": ['error', Number.MIN_VALUE]
                    }
                    let valueComparison = {
                        "best": ['error', Number.MIN_VALUE],
                        "worst": ['error', Number.MAX_VALUE]
                    }
                    resultSQL.forEach(el => {
                        if (mapping[el.type] === "Crypto-assets") {
                            totalProfit += (el.quantity * newDict[el.ticker].price) - (el.invested_amount)
                            pruComparison.worst = (pruComparison.worst[1] < (el.invested_amount / el.quantity)) ? [el.ticker, (el.invested_amount / el.quantity)] : pruComparison.worst
                            pruComparison.best = (pruComparison.best[1] > (el.invested_amount / el.quantity)) ? [el.ticker, (el.invested_amount / el.quantity)] : pruComparison.best
                            valueComparison.best = (valueComparison.best[1] < (newDict[el.ticker].price * el.quantity)) ? [el.ticker, (newDict[el.ticker].price * el.quantity)] : valueComparison.best
                            valueComparison.worst = (valueComparison.worst[1] > (newDict[el.ticker].price * el.quantity)) ? [el.ticker, (newDict[el.ticker].price * el.quantity)] : valueComparison.worst
                        }
                    })
                    let countUniqueAssets = new Set(resultSQL.map(({ ticker }) => ticker)).size
                    console.log(howMuchType); console.log(countUniqueAssets); console.log(totalProfit); console.log(pruComparison); console.log(valueComparison);
                    res.render('statisticsView.ejs', { howMuchType, countUniqueAssets, totalProfit, pruComparison, valueComparison })
                }).catch(error => {
                    res.render('statisticsView.ejs', { notification: error + ". Please contact the webmaster" })
                })
            }).catch(error => {
                res.render('statisticsView.ejs', { notification: error + ". Please contact the webmaster" })
            })
        }
    })
}

exports.logOutUser = (req, res) => {
    res.cookie('Token', null, { maxAge: 0 }); 
    res.redirect('/')
}