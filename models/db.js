const mysql = require('mysql2');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root', // Assuming default root user for local dev
  password: '', // Assuming generic password, user might need to configure this
  database: 'egg_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool.promise();
