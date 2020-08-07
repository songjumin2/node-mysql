// 네트워크를 통해서 다른 서버의 api를 호출하기 위해서
const request = require("postman-request");
const connection = require("./mysql_connection");

const baseUrl = "http://dummy.restapiexample.com";

let path = "/api/v1/employees";

// url호출할땐 url: baseUrl+path 이렇게할거고 제이슨으로 받아오겠다. json:true
request.get({ url: baseUrl + path, json: true }, function (
  error,
  response,
  body
) {
  // 네트워크받은거 여기서 처리
  // console.log(body.data)
  // for(let i = 0; i < body.data.length; i++){
  //     console.log(body.data[i])
  // }
  // 쿼리만들기
  // let query = 'insert into employee (name, salary, age) \
  // values ("'+body.data[0].employee_name+'", '+body.data[0].employee_salary+', '+body.data[0].employee_age+');'
  let array = body.data;
  let query = "insert into employee (name, salary, age) values ? ";
  // ?에 들어갈 데이터는 [ ] 로 만들어야 합니다.
  // let data = [[ array[0].employee_name, array[0].employee_salary, array[0].employee_age ]]
  // console.log(data)
  let data = [];
  for (let i = 0; i < array.length; i++) {
    data.push([
      array[i].employee_name,
      array[i].employee_salary,
      array[i].employee_age,
    ]);
  }
  console.log(data);
  // 아래 [ data ] 의 뜻은 첫번째 물음표? 가 data 라는 뜻이다.
  connection.query(query, [data], function (error, results, fields) {
    console.log(results);
  });
  connection.end();

  // let query = 'insert into employee (name, salary, age) values '
  // for(let i = 0; i < array.length; i++){
  //    query = query + `("${array[i].employee_name}", ${array[i].employee_salary}, ${array[i].employee_age}),`
  // }
  // // 맨 마지막 콤마 지우기 슬라이스
  // query = query.slice(0,-1)
  // console.log(query)
  // // db인설트하는 문장
  // connection.query(query, function(error, results, fields){
  //     console.log(results)
  // })
  // connection.end()
});

// 인서트 문 하나로 여러 문장을 한번에 집어 넣는 방법.
// insert into employee (name, salary, age) values
// ( "${body.data[0].employee_name}", ${body.data[0].employee_salary}, ${body.data[0].employee_age}),
// ( "${body.data[1].employee_name}", ${body.data[1].employee_salary}, ${body.data[1].employee_age}),
// ( "${body.data[2].employee_name}", ${body.data[2].employee_salary}, ${body.data[2].employee_age})
// ...
// ...

// let query = 'insert into employee (name, salary, age) values '
//         for(let i = 0; i < array.length; i++){
//            query = query + `("${array[i].employee_name}", ${array[i].employee_salary}, ${array[i].employee_age}),`
//         }
//         // 맨 마지막 콤마 지우기 슬라이스 (맨마지막에 콤마있으면 안됨)
//         query = query.slice(0,-1)
//         console.log(query)
