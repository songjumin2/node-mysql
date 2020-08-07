const express = require("express");
// 인증할수있는코드 가져와야한다 미들웨어 경로 입력하고 아래 post(auth, addFavorite)auth 입력
const auth = require("../middleware/auth");
const {
  addFavorite,
  getMyFavorites,
  deleteFavorite,
} = require("../controllers/favorites");

const router = express.Router();

//  /api/v1/favorites
router.route("/").post(auth, addFavorite);
router.route("/").get(auth, getMyFavorites);
router.route("/").delete(auth, deleteFavorite);

module.exports = router;
