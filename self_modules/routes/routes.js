let express = require('express');
let router = express.Router();

let userController = require('../../controllers/userController');
let assetController = require('../../controllers/assetController');

//Routes View
router.get('/', (req, res) => res.render('homeView.ejs'))
router.get('/login', (req, res) => res.render('loginView.ejs'))
router.get('/subscribe', (req, res) => res.render('subscribeView.ejs'))

// Routes Users
router.post('/user/connect', userController.connectUser);
router.post('/user/create', userController.createUser);
router.post('/user/forgotPwd', userController.forgotPwdUser);

// Routes Assets
router.get('/assets/fetchAll', assetController.fetchAllAssets);


module.exports = router;
