// mysql_connetion 에 만들어놓은거 가져옴
  
const connection = require('./mysql_connection.js')


let query = 'select * from memo'

connection.query(query, function(error, results, fields){
    console.log(results)
})

connection.end()

