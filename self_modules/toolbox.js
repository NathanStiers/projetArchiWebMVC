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
            } else {
                resolve(info);
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
            } else {
                let mapping = {}
                resultSQL.forEach(r => {
                    mapping[r.id] = r.label;
                    mapping[r.label] = r.id;
                });
                resolve(mapping)
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
                reject(error)
            } else {
                let ret = []
                resultSQL.forEach(r => {
                    ret.push(r.label);
                });
                resolve(ret)
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
                reject(error)
            } else {
                db.db.query("SELECT * FROM assets WHERE type = ?;", resultSQL[0].type, (error, resultSQL) => {
                    if (error) {
                        reject(error)
                    } else {
                        let assets = []
                        resultSQL.forEach(r => {
                            assets.push(r);
                        });
                        resolve({assets, type : resultSQL[0].type})
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
exports.cryptoValuesCall = () => {
    return new Promise((resolve, reject) => {
        axios.get("https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest", {
            params: {
                'start': '1',
                'limit': process.env.COIN_MARKET_CAP_API_LIMIT,
                'convert': process.env.COIN_MARKET_CAP_API_CONVERT
            },
            headers: { 'X-CMC_PRO_API_KEY': process.env.COIN_MARKET_CAP_API_TOKEN }
        }).then((response) => {
            resolve(response.data.data)
        }).catch((error) => {
            reject(error)
        });
    });
}

/**
 * Makes a call to an external API to retrieve real-time action data
 * 
 * @param {string} ticker The ticker of the stock
 * @returns {Promise} Fetch the data from the external API and return a promise
 */
exports.stockValuesCall = (ticker) => {
    return new Promise((resolve, reject) => {
        axios.get("http://api.marketstack.com/v1/tickers/"+ticker+"/eod", {
            params: {
                'access_key': process.env.MARKET_STACK_API_TOKEN
            }
        }).then((response) => {
            resolve(response.data.data)
        }).catch((error) => {
            reject(error)
        });
    });
}