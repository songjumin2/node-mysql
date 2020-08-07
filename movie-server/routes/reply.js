const express = require("express");
const auth = require("../middleware/auth");
const {
  addReply,
  getReply,
  updateReply,
  deleteReply,
} = require("../controllers/reply");

const router = express.Router();

//  /api/v1/reply
//  get(getReply) auth 없애면 회원가입 안해도 댓글 단거 볼 수 있음
router
  .route("/")
  .post(auth, addReply)
  .get(getReply)
  .put(auth, updateReply)
  .delete(auth, deleteReply);

module.exports = router;
