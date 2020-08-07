// 1. express : 웹 서버를 동작시키는 프레임워크
// --npm 패키지 설치 한 것들에 대한 require 입력
const express = require("express");
// 2. 환경설정해주는 dotenv
const dotenv = require("dotenv");
const morgan = require("morgan");

// --미들웨어 에 대한 require 입력
const logger = require("./middleware/logger");
const errorHandler = require("./middleware/error");

// --라우터에 대한 require 입력
// 7. 라우트 파일 가져온다.
const bootcamps = require("./routes/bootcamps");
const users = require("./routes/users");

// 3. 환경 설정 파일의 내용을 로딩한다.
dotenv.config({ path: "./config/config.env" });

// 4. 웹 서버 프레임 워크인 익스프레스를 가져온다.
const app = express();

// Body 파싱 할 수 있도록 설정
app.use(express.json());

// // 로그 찍는 로거 함수 만든다. logger.js 파일 만들어서 아래 내용 입력
// const logger = (req, res, next) => {
//   //req.hello = "Hello World";
//   //console.log("미들웨어 실행됨.");
//   console.log(
//     `${req.method} ${req.protocol}://${req.get("host")} ${req.originalUrl}`
//   );
//   next();
// };
// app.use 는 순서가 중요! 순서대로 실행을 시킵니다. next로
// 미들웨어 연결
app.use(logger);

app.use(morgan("combined"));

// app.use(function (req, res, next) {
//   // res.status(503).send("사이트 점검중입니다.");
//   // 문자열 비교는 ===
//   if (req.method === "GET") {
//     res.json({ alert: "GET requests are disabled" });
//   } else {
//     next();
//   }
// console.log("미들웨어 : ", req.method, req.path);
// });

// 미들웨어
// 모든 API 에 대해서 토큰 인증하는 것
//
// app.use(auth);

// 라우터 연결 : url의 path와 라우터 파일과 연결
app.use("/api/v1/bootcamps", bootcamps);

// 라우터 연결 : url의 path와 라우터 user 연결
app.use("/api/v1/users", users);

// 예시
// app.use("/api/v1/shirts", shirts);
// app.use("/api/v1/books", books);
// app.use("/api/v1/youtube", youtube);

// app.use("/api/v2/bootcamps", bootcamps);
// app.use("/api/v2/shirts", shirts);
// app.use("/api/v2/books", books);
// app.use("/api/v2/youtube", youtube);

// 5. 환경설정 파일인 config.env 파일에 있는 내용을 불러오는 방법
const PORT = process.env.PORT || 5000;
// 6.
app.listen(
  PORT,
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);
// 익스프레스 서버 실행은 : 터미널에서 npm run dev

// 깃허브에 쓸데없는 파일 올리지마라
// .gitignore 에 적혀있는 것

// const app = express();

// app.get("/", function (req, res) {
//   res.send("Hi");
// });

// app.listen(3000);

// // server.js
// var jwt = require("jsonwebtoken");
// // 토큰 생성
// var token = jwt.sign({ _id: 1 }, process.env.ACCESS_TOKEN_SECRET);
// console.log(token);
// console.log(process.env.ACCESS_TOKEN_SECRET);

// // 클라이언트로부터 받은 토큰이 진짜인지 확인하는 작업
// const data = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
// console.log(data);
