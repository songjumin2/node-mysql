// 다른 파일에 있는 정보를 가져오는 방법
// require('./utils.js')
// const name = 을 적어줘야 받아오는것
// const name = require('./utils.js')
// const add = require('./utils.js')
// const getNotes = require('./notes.js')
// 한꺼번에 받는 방법
const utils = require('./utils.js')
const getNotes = require('./notes.js')


// ./ 라는 뜻은 현재의 파일인 app2.js가 있는 디렉토리
// const name = 'Andrew'

 let sum = add(4, -2)
 console.log(sum)

console.log(utils.name)

console.log(utils.minus(1,10))

// utils.js 파일 안에 있는 name 값을 사용하려 한다.
// console.log(name)

// 새로운 파일 notes.js 라고 만듭니다.
// notes.js 파일 안에 getNotes 라는 함수를 만들고
// 이 함수는 "Hello~" 를 리턴하는 함수입니다.
// app2.js 에서 이 함수를 불러와서 콘솔에 로그 찍으세요.

// const getNotes = require('./notes.js')

// 함수호출하기 
 let ret = getNotes()
 console.log(ret)