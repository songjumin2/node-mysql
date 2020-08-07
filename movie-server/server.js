// 1. express : 웹 서버를 동작시키는 프레임워크
// --npm 패키지 설치 한 것들에 대한 require 입력
const express = require("express");
const dotenv = require("dotenv");
// 파일 처리를 위한 라이브러리 임포트
const fileupload = require("express-fileupload");
const path = require("path");

// 라우트 파일 가져온다
const movies = require("./routes/movies");
const users = require("./routes/users");
const favorites = require("./routes/favorites");
const reply = require("./routes/reply");
const reservation = require("./routes/reservation");

// 환경설정파일 로딩
dotenv.config({ path: "./config/config.env" });

// 웹 서버 프레임 워크인 익스프레스를 가져온다.
const app = express();

// post 사용시, body 부분을 json으로 사용하겠다.
app.use(express.json());
app.use(fileupload());
// 이미지를 불러올 수 있도록 static 경로 설정
app.use(express.static(path.join(__dirname, "public")));

app.use("/api/v1/movies", movies);
app.use("/api/v1/users", users);
app.use("/api/v1/favorites", favorites);
app.use("/api/v1/reply", reply);
app.use("/api/v1/reservation", reservation);

const PORT = process.env.PORT || 5900;

app.listen(PORT, console.log("서버 실행됨"));
