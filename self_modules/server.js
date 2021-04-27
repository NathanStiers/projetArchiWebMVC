const express = require('express');
const cors = require('cors')
const router = require('./routes/routes');
const routerSecure = require('./routes/routesSecure');
const authorize = require('./middlewares/authorize');
const corsOptions = require('./middlewares/cors');
const cookieParser = require('cookie-parser'); 
const session = require('express-session');
const flash = require('req-flash');

const port = process.env.PORT
const host = process.env.HOST

const app = express();

app.use(express.urlencoded({extended:true}));
app.use(express.static('public'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.use(cookieParser()); 
app.use(session({ secret: 'ThisIsAn0!herS3cr3t' }));
app.use(flash())
app.use(cors())
app.use('/', router);
app.use(authorize);
app.use('/', routerSecure);

/**
 * Start the server
 */
exports.start = function () {
    app.listen(port, host, () => {
        console.info(`[SERVER] Listening on http://${host}:${port}`);
    })
};