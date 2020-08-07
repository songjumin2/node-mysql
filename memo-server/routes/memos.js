const express = require("express");
// 인증된 회원만 부트캠프 내용 보이게
// const auth = require("../middleware/auth");
const router = express.Router();

const {
  getMemos,
  createMemo,
  updateMemo,
  deleteMemo,
} = require("../controllers/memos");

// 각 경로별로 데이터 가져올 수 있도록 router (라우터설정함)셋팅
// get은 정보 가져오는 것 디비에서 셀렉트하라는 뜻
// 복잡도가 올라가니까 따로 폴더만들어서 경로를 입력해준다

router.route("/").get(getMemos).post(createMemo);
router.route("/:id").put(updateMemo).delete(deleteMemo);

module.exports = router;
