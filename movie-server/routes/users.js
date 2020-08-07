const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");

const {
  createUser,
  loginUser,
  logout,
  userPhotoUpload,
} = require("../controllers/users");

router.route("/").post(createUser);
router.route("/login").post(loginUser);
router.route("/logout").delete(auth, logout); //auth 인증 후 logout해야하니
router.route("/me/photo").put(auth, userPhotoUpload);

module.exports = router;
