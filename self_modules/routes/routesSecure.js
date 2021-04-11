let express = require('express');
let router = express.Router();

let userController = require('../../controllers/userController');
let walletController = require('../../controllers/walletController');
let assetController = require('../../controllers/assetController');

const isBelongingWallet = require('../middlewares/isBelongingWallet')
const maxWalletReached = require('../middlewares/maxWalletReached')
const mappingRoles = require('../middlewares/mappingRoles')

// Routes Views
router.get('/wallets', maxWalletReached, walletController.fetchAllWallets);
router.post('/wallets', maxWalletReached, walletController.fetchAllWallets);
router.get('/premium', (req, res) => res.render('premiumView.ejs'));
router.get('/statistics', userController.statisticsResults);
router.get('/wallets/:id_wallet/', assetController.fetchWalletAllAssets);
router.get('/wallets/:id_wallet/delete', walletController.deleteWallet);
router.post('/assets/info', assetController.infoAsset); 
router.get('/logout', userController.logOutUser);

// Routes Users
router.post('/user/premium', mappingRoles, userController.upgradeUser);

// Routes Wallets
router.post('/wallets/search', walletController.searchWallet)
router.post('/wallets/create', maxWalletReached, walletController.createWallet);
router.post('/wallets/rename', walletController.renameWallet);
 
// Routes Assets
router.post('/assets/search', assetController.searchAsset)
router.post('/assets/add', isBelongingWallet, assetController.addAsset);
router.post('/assets/remove', isBelongingWallet, assetController.removeAsset);
router.post('/assets/changeQty', isBelongingWallet, assetController.changeQtyAsset);
router.post('/assets/alert', isBelongingWallet, assetController.setPriceAlert);
router.post('/assets/changeInvestment', isBelongingWallet, assetController.changeInitialInvestment);

module.exports = router;