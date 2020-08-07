const request = require('postman-request');

const baseUrl = 'http://api.weatherstack.com/'

let queryUrl = baseUrl + 'current?access_key=23015574d45f3e8e634394229be33c32&query=seoul' +
                         '&query='

 let query = 'seoul'

 request.get({url : queryUrl + query, json:true}, function(error, response, body){
     console.log(response.statusCode)
     // console.log(body)
     // 온도만 출력
     console.log(body.current.temperature)
 })