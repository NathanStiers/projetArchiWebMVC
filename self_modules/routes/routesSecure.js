let express = require('express');
let router = express.Router();

let userController = require('../../controllers/userController');
let walletController = require('../../controllers/walletController');
let assetController = require('../../controllers/assetController');

const toolbox = require("../toolbox");

const isBelongingWallet = require('../middlewares/isBelongingWallet')
const maxWalletReached = require('../middlewares/maxWalletReached')
const mappingRoles = require('../middlewares/mappingRoles')

// Routes Views
router.get('/wallets', maxWalletReached, walletController.fetchAllWallets);
router.get('/premium', (req, res) => res.render('premiumView.ejs'));
router.get('/statistics', (req, res) => res.render('statisticsView.ejs'));
router.get('/wallets/:id_wallet/', assetController.fetchWalletAllAssets);
router.get('/wallets/:id_wallet/delete', walletController.deleteWallet);
router.post('/assets/info', (req, res) => res.render('assetInfoView.ejs', {id_wallet:req.body.id_wallet, id:req.body.id_wallet_asset, qty:req.body.qty, invested:req.body.invested}))
router.get('/logout', (req, res) => {
    res.cookie('Token', null, { maxAge: 0 }); 
    res.redirect('/')
})

// Routes Users
router.post('/user/premium', mappingRoles, userController.upgradeUser);

// Routes Wallets
router.post('/wallets/create', maxWalletReached, walletController.createWallet);
router.post('/wallets/rename', walletController.renameWallet);

// Routes Assets
router.post('/assets/add', isBelongingWallet, assetController.addAsset);
router.post('/assets/remove', isBelongingWallet, assetController.removeAsset);
router.post('/assets/changeQty', isBelongingWallet, assetController.changeQtyAsset);
router.post('/assets/alert', isBelongingWallet, assetController.setPriceAlert);
router.post('/assets/changeInvestment', isBelongingWallet, assetController.changeInitialInvestment);

module.exports = router;
