const express = require("express");
const router = express.Router();

// 각 경로별로 데이터 가져올 수 있도록 router (라우터설정함)셋팅
// get은 정보 가져오는 것, 디비에서 셀렉트하라는 뜻
// 복잡도가 올라가니까 따로 폴더만들어서 경로를 입력해준다
const {
  getMovies,
  searchMovies,
  getMoviesByYear,
  getMovieByAttendance,
} = require("../controllers/movies");

// 경로가 localhost:6000/api/v1/movies 여기까지는 server.js에서 처리할거임
// movies는 영화관련 유저관련은 user로 입력 똑같이 컨트롤러, 라우터에 이름 똑같이 개발해야함
router.route("/").get(getMovies);
router.route("/search").get(searchMovies);
router.route("/year").get(getMoviesByYear);
router.route("/attendance").get(getMovieByAttendance);

module.exports = router;
