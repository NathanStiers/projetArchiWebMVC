let express = require('express');
let router = express.Router();

let userController = require('../../controllers/userController');
let walletController = require('../../controllers/walletController');
let assetController = require('../../controllers/assetController');

const toolbox = require("../toolbox");

const isBelongingWallet = require('../middlewares/isBelongingWallet')
const maxWalletReached = require('../middlewares/maxWalletReached')

// Routes Views
router.get('/wallets', walletController.fetchAllWallets);
router.get('/wallets/add', (req, res) => {
    toolbox.fetchAllTypes().then(result => {
        res.render('walletAddView.ejs', {types : result})
    }).catch(err => {
        res.redirect('/wallets')
    });
});
router.get('/premium', (req, res) => res.render('premiumView.ejs'));
router.get('/statistics', (req, res) => res.render('statisticsView.ejs'));
router.get('/wallets/:id_wallet/:type', assetController.fetchWalletAllAssets);
router.get('/wallets/delete/:id_wallet', walletController.deleteWallet);
router.get('/assets/:id_wallet/:id_wallet_asset/:qty/:invested', (req, res) => res.render('assetInfoView.ejs', {id_wallet:req.params.id_wallet, id:req.params.id_wallet_asset, qty:req.params.qty, invested:req.params.invested}))
router.post('/assets/add', isBelongingWallet, (req, res) => res.render('assetAddView.ejs'));

// Routes Users
router.post('/user/premium', userController.upgradeUser);

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
