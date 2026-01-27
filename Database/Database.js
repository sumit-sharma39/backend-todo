const { Pool } = require ("pg");

console.log("here")
const client = new Pool({
  user: "avnadmin",
  password: "AVNS_BUSMC5K94g2LAb9gO-c",
  host: "pg-3a8f90e4-sumits55066-9110.h.aivencloud.com",
  port: "25054",
  database: "defaultdb",
  ssl: {
      require: true,
    rejectUnauthorized: false,
  },
});
module.exports = client;