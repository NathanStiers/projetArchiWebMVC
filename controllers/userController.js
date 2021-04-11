let User = require('../models/userModel');

const db = require('../self_modules/db');
const toolbox = require("../self_modules/toolbox");
const bcrypt = require('bcrypt');
const generator = require('generate-password');
const jwt = require('jsonwebtoken');

const saltRounds = 12;

/**
 * Allows you to create a new user if it does not already exist
 * 
 * @param {Object} req The request Object
 * @param {Object} res The response Object
 */
exports.createUser = (req, res) => {
    if (req.body.password !== req.body.passwordConfirm) {
        req.flash('notification', 'Les mots de passe ne correspondent pas');
        res.redirect('/subscribe')
        return;
    }
    if(req.body.name === "" || req.body.surname === "" || req.body.mail === "" || req.body.password === ""){
        req.flash('notification', 'Veuillez remplir tous les champs du formulaire');
        res.redirect('/subscribe')
        return;
    }
    let user = new User(null, 1, req.body.name, req.body.surname, req.body.mail, null, []);
    bcrypt.hash(req.body.password, saltRounds, (error, hash) => {
        if (error) {
            req.flash('notification', error + '. Please contact the webmaster');
            res.redirect('/subscribe')
            return;
        }
        user.password = hash;
        if (!toolbox.checkMail(user.mail)) { //Check all info user
            req.flash('notification', 'Le mail ne correspond pas au bon format');
            res.redirect('/subscribe')
            return;
        }
        let mapping_roles = req.body.mapping_roles
        db.db.query("INSERT INTO users (role, name, surname, mail, password) VALUES (?, ?, ?, ?, ?);", [mapping_roles['basic'], user.name, user.surname, user.mail, user.password], (error, resultSQL) => {
            if (error) {
                if (error.errno === 1062) {
                    req.flash('notification', 'Ce mail est déjà utilisé');
                    res.redirect('/subscribe')
                    return;
                } else {
                    req.flash('notification', error + '. Please contact the webmaster');
                    res.redirect('/subscribe')
                    return;
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

/**
 * Allows to authenticate a user based on his email and password
 * 
 * @param {Object} req The request Object
 * @param {Object} res The response Object
 */
exports.connectUser = (req, res) => {
    bcrypt.compare(req.body.password, req.body.user.password, function (error, result) {
        if (error) {
            req.flash('notification', error + '. Please contact the webmaster');
            res.redirect('/login')
            return;
        } else if (result) {
            delete req.body.user.password
            const token = jwt.sign({ user_id: req.body.user.id, user_role: req.body.user.role }, process.env.ACCESS_TOKEN_SECRET);
            let d = new Date();
            let expires = d.setTime(d.getTime() + 6 * 60 * 60 * 1000);
            res.cookie('Token', token, { maxAge: expires });
            res.redirect('/wallets')
        } else {
            req.flash('notification', 'Authentification incorrecte');
            res.redirect('/login')
            return;
        }
    });
}

/**
 * Allows you to change the role of a classic user to a premium user based on his id
 * 
 * @param {Object} req The request Object
 * @param {Object} res The response Object
 */
exports.upgradeUser = (req, res) => {
    let mapping_roles = req.body.mapping_roles
    if (req.body.user_role === "premium") {
        req.flash('notification', 'Vous êtes déjà premium');
        res.redirect('/premium')
        return;
    }
    db.db.query("UPDATE users SET role = ? WHERE id = ?;", [mapping_roles["premium"], req.body.user_id], (error, resultSQL) => {
        if (error) {
            req.flash('notification', error + '. Please contact the webmaster');
            res.redirect('/premium')
            return;
        } else {
            const token = jwt.sign({ user_id: req.body.user_id, user_role: "premium" }, process.env.ACCESS_TOKEN_SECRET);
            let d = new Date();
            let expires = d.setTime(d.getTime() + 6 * 60 * 60 * 1000);
            res.cookie('Token', token, { maxAge: expires });
            req.flash('notification', 'Vous êtes maintenant premium');
            res.redirect('/premium')
            return;
        }
    })
}

/**
 * Allows a dizzy user to recover his password based on his email
 * 
 * @param {Object} req The request Object
 * @param {Object} res The response Object
 */
exports.forgotPwdUser = (req, res) => {
    let mail = req.body.user.mail
    let id = req.body.user.id
    let newPassword = generator.generate({
        length: 10,
        numbers: true
    });
    bcrypt.hash(newPassword, saltRounds, (error, hash) => {
        if (error) {
            req.flash('notification', error + '. Please contact the webmaster');
            res.redirect('/login')
            return;
        }
        db.db.query("UPDATE users SET password = ? WHERE id = ?;", [hash, id], (error, resultSQL) => {
            if (error) {
                req.flash('notification', error + '. Please contact the webmaster');
                res.redirect('/login')
                return;
            } else {
                toolbox.sendMail(mail, "Confidential : Your new password", newPassword).then(result => {
                    req.flash('notification', "Email envoyé à : " + mail);
                    res.redirect('/login')
                    return;
                }).catch(error => {
                    req.flash('notification', error + '. Please contact the webmaster');
                    res.redirect('/login')
                    return;
                });
            }
        });
    })
}

/**
 * Allows a user to analyze their investments through wallet statistics
 * 
 * @param {Object} req The request Object
 * @param {Object} res The response Object
 */
exports.statisticsResults = (req, res) => {
    db.db.query("SELECT DISTINCT a.ticker, a.label, aw.id_wallet, aw.id, aw.quantity, aw.invested_amount, aw.price_alert, w.type FROM assets AS a, wallets AS w, assets_wallets AS aw WHERE aw.id_asset = a.id AND w.user_id = ? AND w.id = aw.id_wallet AND w.id IN (SELECT * FROM(SELECT win.id FROM wallets AS win WHERE win.user_id = ? ORDER BY win.creation_date ASC, win.id ASC LIMIT ?) temp_tab);", [req.body.user_id, req.body.user_id, req.body.user_role === "premium" ? 10 : 3], (error, resultSQL) => {
        if (error) {
            res.render('statisticsView.ejs', { notification: error + ". Please contact the webmaster" })
        } else {
            let newDict = {}
            let mapping_types = req.body.mapping_types
            toolbox.cryptoValuesCall().then(cryptoAPI => {
                cryptoAPI.forEach(el => {
                    newDict[el.symbol] = {
                        name: el.name,
                        ticker: el.symbol,
                        price: el.quote.EUR.price
                    }
                })
                let howMuchType = {
                    "Crypto-assets": resultSQL.filter(el => mapping_types[el.type] === "Crypto-assets").length,
                    "Stocks": resultSQL.filter(el => mapping_types[el.type] === "Stocks").length,
                    "TODO": resultSQL.filter(el => mapping_types[el.type] === "TODO").length
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
                    if (mapping_types[el.type] === "Crypto-assets") {
                        totalProfit += (el.quantity * newDict[el.ticker].price) - (el.invested_amount)
                        pruComparison.worst = (pruComparison.worst[1] < (el.invested_amount / el.quantity)) ? [el.ticker, (el.invested_amount / el.quantity)] : pruComparison.worst
                        pruComparison.best = (pruComparison.best[1] > (el.invested_amount / el.quantity)) ? [el.ticker, (el.invested_amount / el.quantity)] : pruComparison.best
                        valueComparison.best = (valueComparison.best[1] < (newDict[el.ticker].price * el.quantity)) ? [el.ticker, (newDict[el.ticker].price * el.quantity)] : valueComparison.best
                        valueComparison.worst = (valueComparison.worst[1] > (newDict[el.ticker].price * el.quantity)) ? [el.ticker, (newDict[el.ticker].price * el.quantity)] : valueComparison.worst
                    }
                })
                let countUniqueAssets = new Set(resultSQL.map(({ ticker }) => ticker)).size
                res.render('statisticsView.ejs', { howMuchType, countUniqueAssets, totalProfit, pruComparison, valueComparison })
            }).catch(error => {
                res.render('statisticsView.ejs', { notification: error + ". Please contact the webmaster" })
            })
        }
    })
}

/**
 * Allows a user to logout
 * 
 * @param {Object} req The request Object
 * @param {Object} res The response Object
 */
exports.logOutUser = (req, res) => {
    res.cookie('Token', null, { maxAge: 0 }); 
    res.redirect('/')
}