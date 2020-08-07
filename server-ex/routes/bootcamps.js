const express = require("express");
// 인증된 회원만 부트캠프 내용 보이게
const auth = require("../middleware/auth");

const {
  getBootcamps,
  getBootcamp,
  createBootcamp,
  updateBootcamp,
  deleteBootcamp,
} = require("../controllers/bootcamps");

const router = express.Router();

// 각 경로별로 데이터 가져올 수 있도록 router (라우터설정함)셋팅
// get은 정보 가져오는 것 디비에서 셀렉트하라는 뜻
// 복잡도가 올라가니까 따로 폴더만들어서 경로를 입력해준다

router.route("/").get(getBootcamps).post(createBootcamp);
router
  .route("/:id")
  .get(getBootcamp)
  .put(updateBootcamp)
  .delete(deleteBootcamp);

module.exports = router;
