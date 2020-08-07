// cd js-test js-test로 가기
// 파일 하나 만들기 const 변경못하게 저장(상수) 라이브러리만들때 이름 똑같이 써주기 
const fs = require('fs')

// 파라미터 첫번째는 파일이름, 두번째는 파일내용
// fs.writeFileSync('notes.txt', '안녕하세요')

// 1. appendFileSync 라는 함수를 이용해서
// 2. notes.txt 파일에 새로운 내용을 추가하세요.
// 3. 실행하여 결과를 확인합니다.

// fs.appendFileSync('notes.txt', "\n반갑습니다.")

// validator 패키지 가져다 쓰기
const validator = require('validator')

let ret = validator.isEmail('abc@naver.com')
ret = validator.isURL('http://naver.com')

console.log(ret)

// 1. chalk라는 패키지(라이브러리, 모듈)를 설치하세요
// 2. app.js 파일에서 로딩하세요
// 3. 문자열로 "Success!" 라고 출력할건데, 녹색(green)으로 출력하시오.
// 4. 3번의 문제에 추가하여 bold 체로 출력해보세요

const chalk = require('chalk')
console.log(chalk.green.bold.inverse('Success!'))