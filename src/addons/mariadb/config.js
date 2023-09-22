const mariadb = require('mariadb');
const pool = mariadb.createPool({
    host: process.env.maria_host,
    user: process.env.maria_user,
    password: process.env.maria_pwd,
    connectionLimit: 25
});

exports.pool = pool;
exports.mariadb = mariadb;