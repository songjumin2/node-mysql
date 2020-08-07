// mysql db에 접속 할 수 있는 커넥션을 여기서
// 하나 만들어 놓고 다른 파일에서 가져다 쓸 수 있게 한다.

const mysql = require('mysql')

const connection = mysql.createConnection(
    {
        host : 'database-1.c8l9tuuyfjdx.ap-northeast-2.rds.amazonaws.com',
        user : 'node_user',
        database : 'my_test',
        password : 'songjumin12'
    }
)
// 다른 파일에서 aws 커넥션 사용할 수 있도록 
module.exports = connection