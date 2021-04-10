const nodemailer = require('nodemailer');
const db = require('../self_modules/db');
const axios = require('axios');

/**
 * Allows you to check the conformity of an email
 * 
 * @param {string} mail The mail of the user 
 * @returns {boolean} True if the mail is correct, false otherwise
 */
exports.checkMail = (mail) => {
    var re = /\S+@\S+\.\S+/;
    return re.test(mail);
}

/**
 * Allows you to send a personalized email
 * 
 * @param {string} to The mail of the receiver
 * @param {string} subject The subject of the mail
 * @param {string} text The content of the mail
 * @returns {Promise} Send the mail and return a promise
 */
exports.sendMail = (to, subject, text) => {
    let mailOptions = {
        from: process.env.NODE_MAILER_USER,
        to: to,
        subject: subject,
        text: text
    };
    const transporter = nodemailer.createTransport({
        service: process.env.NODE_MAILER_SERVICE,
        auth: {
            user: process.env.NODE_MAILER_USER,
            pass: process.env.NODE_MAILER_PWD
        }
    });
    return new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                reject(error);
                return;
            }
            else {
                resolve(info);
                return;
            }
        });
    });
}

/**
 * Allows to map types between label and id
 * 
 * @returns {Promise} Make the mapping and return a promise
 */
exports.mapping_label_id_types = () => {
    return new Promise((resolve, reject) => {
        db.db.query("SELECT * FROM types;", (error, resultSQL) => {
            if (error) {
                reject(error)
                return;
            }
            else {
                let mapping = {}
                resultSQL.forEach(t => {
                    mapping[t.id] = t.label;
                    mapping[t.label] = t.id;
                });
                resolve(mapping)
                return;
            }
        });
    });
}

/**
 * Allows to map roles between label and id
 * 
 * @returns {Promise} Make the mapping and return a promise
 */
exports.mapping_label_id_roles = () => {
    return new Promise((resolve, reject) => {
        db.db.query("SELECT * FROM roles;", (error, resultSQL) => {
            if (error) {
                reject(error)
                return;
            }
            else {
                let mapping = {}
                resultSQL.forEach(r => {
                    mapping[r.id] = r.label;
                    mapping[r.label] = r.id;
                });
                resolve(mapping)
                return;
            }
        });
    });
}

/**
 * Allows you to retrieve all types of assets from the database
 * 
 * @returns {Promise} Fetch all the assets and return a promise
 */
exports.fetchAllTypes = () => {
    return new Promise((resolve, reject) => {
        db.db.query("SELECT * FROM types;", (error, resultSQL) => {
            if (error) {
                reject(500)
                return;
            }
            else {
                let ret = []
                resultSQL.forEach(r => {
                    ret.push(r.label);
                });
                resolve(ret)
                return;
            }
        });
    });
}

/**
 * Retrieves the assets in the database with the same type as the selected portfolio
 * 
 * @param {number} id The id of the wallet 
 * @returns {Promise} Fetch all the assets and return a promise
 */
exports.fetchAssetsBasedOnType = (id) => {
    return new Promise((resolve, reject) => {
        db.db.query("SELECT type FROM wallets WHERE id = ?;", id, (error, resultSQL) => {
            if (error) {
                reject(500)
                return;
            }
            else {
                db.db.query("SELECT * FROM assets WHERE type = ?;", resultSQL[0].type, (error, resultSQL) => {
                    if (error) {
                        reject(500)
                        return;
                    }
                    else {
                        let assets = []
                        resultSQL.forEach(r => {
                            assets.push(r);
                        });
                        resolve({assets, type : resultSQL[0].type})
                        return;
                    }
                });
            }
        });
    });
}

/**
 * Makes a call to an external API to retrieve data from the top 100 crypto-assets in real time
 * 
 * @returns {Promise} Fetch the data from the external API and return a promise
 */
exports.cyptoValuesCall = () => {
    return new Promise((resolve, reject) => {
        axios
            .get("https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest", {
                params: {
                    'start': '1',
                    'limit': process.env.COIN_MARKET_CAP_API_LIMIT,
                    'convert': process.env.COIN_MARKET_CAP_API_CONVERT
                },
                headers: { 'X-CMC_PRO_API_KEY': process.env.COIN_MARKET_CAP_API_TOKEN }
            })
            .then((response) => {
                resolve(response.data.data)
                return;
            })
            .catch((error) => {
                reject(error)
                return;
            });
    });
}

/**
 * Makes a call to an external API to retrieve real-time action data
 * 
 * @param {string} ticker The ticker of the stock
 * @returns {Promise} Fetch the data from the external API and return a promise
 */
exports.actionValueCall = (ticker) => {
    return new Promise((resolve, reject) => {
        axios
            .get("http://api.marketstack.com/v1/tickers/"+ticker+"/eod", {
                params: {
                    'access_key': process.env.MARKET_STACK_API_TOKEN
                }
            })
            .then((response) => {
                resolve(response.data.data)
                return;
            })
            .catch((error) => {
                reject(error)
                return;
            });
    });
}

/**
 * Allows you to retrieve information from a cookie
 * 
 * @param {string} cname The name of the cookie
 * @returns {string} The data of the cookie or undefined if it doesn't exists
 */
exports.readCookie = (cname) => {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length)
        }
    }
    return undefined;
}

/**
 * Checks if the user is logged in 
 * 
 * @returns {boolean} True if the user is connected, false otherwise
 */
exports.checkIfConnected = () => {
    let token = this.readCookie("Token")
    if (token !== undefined) {
        return true;
    }
    return false;
}

/**
 * Transforms data from external APIs to standardize the structure
 * 
 * @param {Object} dictToTransform The JSON response from external API
 * @returns {Object} The modified JSON Object
 */
exports.transformDictFromCryptoAPI = (dictToTransform) => {
    let newDict = {}
    dictToTransform.forEach(el => {
        newDict[el.symbol] = {
            name: el.name,
            ticker: el.symbol,
            max_supply: el.max_supply,
            total_supply: el.total_supply,
            market_cap: el.quote.EUR.market_cap,
            price: el.quote.EUR.price,
            type: "Crypto-assets"
        }
    })
    return newDict;
}