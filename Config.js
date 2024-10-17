const dotenv = require('dotenv');
const path = require('path');

dotenv.config({
    path: path.resolve(__dirname, `environment/${process.env.NODE_ENV}.env`)
});

module.exports = {
    NODE_ENV : process.env.NODE_ENV,
    HOST : process.env.HOST,
    PORT : process.env.PORT,
    USER : process.env.USER,
    PASSWORD: process.env.PASSWORD,
    SERVER: process.env.SERVER,
    DATABASE: process.env.DATABASE,
    LOGFOLDER: process.env.LOGFOLDER,
    LOGFILE: process.env.LOGFILE
}