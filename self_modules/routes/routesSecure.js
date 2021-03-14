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
        console.log()
        res.render('walletAddView.ejs', {types : result})
    }).catch(err => {
        console.log(err)
        res.redirect('/wallets')
    });
});
router.get('/premium', (req, res) => res.render('premiumView.ejs'));
router.get('/statistics', (req, res) => res.render('statisticsView.ejs'));
router.get('/wallets/:id_wallet', assetController.fetchWalletAllAssets);
router.get('/wallets/delete/:id_wallet', walletController.deleteWallet);

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
