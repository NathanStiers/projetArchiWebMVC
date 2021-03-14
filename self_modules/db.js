const mysql = require("mysql");

const dbHost = process.env.DB_HOST
const dbUser = process.env.DB_USER
const dbPwd = process.env.DB_PWD
const dbName = process.env.DB_NAME

let connect = ()=>{
    return new Promise((resolve, reject) => {
        let dbClient = mysql.createConnection({
            host: dbHost,
            user: dbUser,
            password: dbPwd,
            database: dbName
        })

        dbClient.connect((err)=>{
            if(err){
                console.log("[Db] Unable to connect to server: " + err);
                reject(err)
            }else{
                console.info("[Db] Connected successfully to server")
                exports.db = dbClient
                resolve(exports.db)
            }
        })
    })
}

exports.connect = connect
exports.db = null
