const connection = require('./mysql_connection.js')

let query = 'select s.title, r.rating \
from series as s\
join reviews as r\
on s.id = r.series_id order by s.title'

connection.query(query, function(error, results, fields){
    console.log(results)
})

connection.end()