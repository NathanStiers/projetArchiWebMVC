let express = require('express');
let router = express.Router();

const isConnected = require('../middlewares/isConnected')

let userController = require('../../controllers/userController');
let assetController = require('../../controllers/assetController');

//Routes View
router.get('/', isConnected, (req, res) => res.render('homeView.ejs'))
router.get('/login', isConnected, (req, res) => res.render('loginView.ejs'))
router.get('/subscribe', isConnected, (req, res) => res.render('subscribeView.ejs'))

// Routes Users
router.post('/user/connect', isConnected, userController.connectUser);
router.post('/user/create', isConnected, userController.createUser);
router.post('/user/forgotPwd', isConnected, userController.forgotPwdUser);

// Routes Assets
router.get('/assets/fetchAll', assetController.fetchAllAssets);


module.exports = router;
