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
    if(req.body.notification){
        res.render('SubscribeView.ejs', {notification : req.body.notification})
        return;
    }
    if(req.body.password !== req.body.passwordConfirm){
        res.render('SubscribeView.ejs', {notification : "Les mots de passe ne correspondent pas"})
        return;
    }
    let user = new User(null, 1, req.body.name, req.body.surname, req.body.mail, null, []);
    bcrypt.hash(req.body.password, saltRounds, (err, hash) => {
        if (err) {
            res.render('SubscribeView.ejs', {notification : err + ". Please contact the webmaster"})
            return;
        }
        user.password = hash;
        if (!toolbox.checkMail(user.mail)) { //Check all info user
            res.render('SubscribeView.ejs', {notification : "Le mail ne correspond pas au bon format"})
            return;
        }
        let mapping_roles = req.body.mapping_roles
        db.db.query("INSERT INTO users (role, name, surname, mail, password) VALUES (?, ?, ?, ?, ?);", [mapping_roles['basic'], user.name, user.surname, user.mail, user.password], (error, resultSQL) => {
            if (error) {
                if (error.errno === 1062) {
                    res.render('SubscribeView.ejs', {notification : "Ce mail est déjà utilisé"})
                    return;
                }
                res.render('SubscribeView.ejs', {notification : error + ". Please contact the webmaster"})
                return;
            } else {
                user.id = resultSQL.insertId;
                user.password = null;
                user.role = "basic";
                const token = jwt.sign({ user_id: user.id, user_role: user.role }, process.env.ACCESS_TOKEN_SECRET);
                let d = new Date();
                let expires = d.setTime(d.getTime() + 6 * 60 * 60 * 1000);
                res.cookie('Token', token, { maxAge: expires });
                res.redirect('/wallets')
                return;
            }
        });
    })
}

// Permet d'authentifier un utilisateur sur base de son mail et de son mot de passe
// Method : POST 
// Body : mail, password
exports.connectUser = (req, res) => {
    if(req.body.notification){
        res.render('LoginView.ejs', {notification : req.body.notification})
        return;
    }
    bcrypt.compare(req.body.password, req.body.user.password, function (error, result) {
        if (error) {
            res.render('LoginView.ejs', {notification : error + ". Please contact the webmaster"})
            return;
        } else if (result) {
            delete req.body.user.password
            const token = jwt.sign({ user_id: req.body.user.id, user_role: req.body.user.role }, process.env.ACCESS_TOKEN_SECRET);
            let d = new Date();
            let expires = d.setTime(d.getTime() + 6 * 60 * 60 * 1000);
            res.cookie('Token', token, { maxAge: expires });
            res.redirect('/wallets')
            return;
        } else {
            res.render('LoginView.ejs', {notification : "Authentification incorrecte"})
            return;
        }
    });
}

// Permet de modifier le rôle d'un utilisateur classique vers utilisateur premium sur base de son id
// Method : GET
// Body : id (from JWT)
exports.upgradeUser = (req, res) => {
    let mapping_roles = req.body.mapping_roles
    if (req.body.user_role === mapping_roles["premium"]) {
        res.redirect('/premium')
        return;
    }
    db.db.query("UPDATE users SET role = ? WHERE id = ?;", [mapping_roles["premium"], req.body.user_id], (error, resultSQL) => {
        if (error) {
            res.redirect('/premium')
            return;
        } else {
            const token = jwt.sign({ user_id: req.body.user_id, user_role: "premium" }, process.env.ACCESS_TOKEN_SECRET);
            let d = new Date();
            let expires = d.setTime(d.getTime() + 6 * 60 * 60 * 1000);
            res.cookie('Token', token, { maxAge: expires });
            res.redirect('/wallets')
            return;
        }
    })
}

// Permet à un utilisateur étourdi de récupérer son mot de passe sur base de son email
// Method : POST
// Body : email
exports.forgotPwdUser = (req, res) => {
    if(req.body.notification){
        res.render('LoginView.ejs', {notification : req.body.notification})
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
            res.render('LoginView.ejs', {notification : error + ". Please contact the webmaster"})
            return;
        }
        db.db.query("UPDATE users SET password = ? WHERE id = ?;", [hash, id], (error, resultSQL) => {
            if (error) {
                res.render('LoginView.ejs', {notification : error + ". Please contact the webmaster"})
                return;
            } else {
                toolbox.sendMail(mail, "Confidential : Your new password", newPassword).then(result => {
                    res.render('LoginView.ejs', {notification : "Email envoyé à : " + mail})
                    return;
                }).catch(error => {
                    res.render('LoginView.ejs', {notification : error + ". Please contact the webmaster"})
                    return;
                });
            }
        });
    })
}