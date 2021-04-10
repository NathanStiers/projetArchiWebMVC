require("dotenv").config()

const db = require('./self_modules/db')
const server = require('./self_modules/server');

db.connect().then(server.start)