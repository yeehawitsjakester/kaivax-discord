const mariadb = require('mariadb');
const pool = mariadb.createPool({
    host: process.env.maria_host,
    user: process.env.maria_user,
    password: process.env.maria_pwd,
    connectionLimit: 100 //TODO: refine and improve connections, seems we are hitting limits I dont think are normal
});

exports.pool = pool;
exports.mariadb = mariadb;