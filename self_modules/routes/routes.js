let express = require('express');
let router = express.Router();

const isConnected = require('../middlewares/isConnected')
const fetchUserByMail = require('../middlewares/fetchUserByMail')
const mappingRoles = require('../middlewares/mappingRoles')

let userController = require('../../controllers/userController');

const userConfigurationMiddleware = [isConnected, mappingRoles]

//Routes View
router.get('/', isConnected, (req, res) => res.render('homeView.ejs', {notification : req.flash().notification}))
router.get('/login', isConnected, (req, res) => res.render('loginView.ejs', {notification : req.flash().notification}))
router.get('/subscribe', isConnected, (req, res) => res.render('subscribeView.ejs', {notification : req.flash().notification}))

// Routes Users
router.post('/user/connect', userConfigurationMiddleware, fetchUserByMail, userController.connectUser);
router.post('/user/create', userConfigurationMiddleware, userController.createUser);
router.post('/user/forgotPwd', userConfigurationMiddleware, fetchUserByMail, userController.forgotPwdUser);

module.exports = router;