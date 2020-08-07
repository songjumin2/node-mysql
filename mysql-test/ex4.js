const connection = require('./mysql_connection.js')

let query = 'select first_name, title, grade \
from students as s \
join papers as p  on p.student_id = s.id \
order by grade desc;'

query = 'select first_name, title, grade \
from students as s \
left join papers as p on p.student_id = s.id;'


query = 'select first_name, ifnull(title,"MISSING") as title, ifnull(grade,0) as grade \
from students as s \
left join papers as p on p.student_id = s.id;'


query = 'select first_name, avg(grade) as average \
from students as s \
left join papers as p on s.id = p.student_id \
group by first_name \
order by average desc;'

connection.query(query, function(error, results, fields){
    console.log(results)
})

connection.end()
