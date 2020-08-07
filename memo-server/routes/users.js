const express = require("express");
const { createUser, loginUser, myInfo } = require("../controllers/users");
const auth = require("../middleware/auth");
const router = express.Router();

// 컨트롤러 유저스에서 회원가입, 로그인, 내 정보 가져오기 입력 후
// 라우터에 입력해줘야함

// 라우터 작성하니까 위에 {createUser} 생김
// /api/v1/users (회원가입 연결함)
router.route("/").post(createUser);
// /api/v1/users/login (로그인 연결함)
router.route("/login").post(loginUser);
// /api/v1/users/me (내 정보 가져오기 연결함)
// auth타고가야함 인증받고 가야하니까 입력해준다
// const auth 도 위에 입력해줘야함
router.route("/me").get(auth, myInfo);

module.exports = router;
