const express = require("express");
const auth = require("../middleware/auth");

const {
  setReservation,
  getReservation,
  getMyResevation,
  deleteReservation,
} = require("../controllers/reservation");

const router = express.Router();

// /api/v1/reservation
router.route("/").post(auth, setReservation);
router.route("/").get(auth, getReservation);
router.route("/me").get(auth, getMyResevation);
router.route("/:reservation_id").delete(auth, deleteReservation);

module.exports = router;
