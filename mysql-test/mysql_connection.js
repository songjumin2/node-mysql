const mysql = require('mysql')

const connection = mysql.createConnection(
    {
        host : 'database-1.c8l9tuuyfjdx.ap-northeast-2.rds.amazonaws.com',
        user : 'node_user',
        database : 'my_test',
        password : 'songjumin12'
    }
)
module.exports = connection