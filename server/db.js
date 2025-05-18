const Pool = require("pg").Pool;

const pool = new Pool({
    user: "postgres",
    password: "Devangisgr8!",
    host: "localhost",
    port: 5432,
    database: "tradeoff"
});

module.exports = pool;