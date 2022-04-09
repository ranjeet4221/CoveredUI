require('dotenv').config()
var sql = require("mssql");
var connect = function()
{
    var conn = new sql.ConnectionPool({
        user: 'admin',
        password: 'saratoga',
        server: 'database-1.c7lp84zvxywq.us-west-2.rds.amazonaws.com', 
        database: 'Covered',
        port:1433
    });
 
    return conn;
};

module.exports = connect;