const connection = require("../db/mysql_connection");
const ErrorResponse = require("../utils/errorResponse");

// @desc    모든 정보를 다 조회
// @route   GET /api/v1/bootcamps
// @access  Public
exports.getBootcamps = async (req, res, next) => {
  // console.log("모든 부트캠프 가져오는 함수")
  // res
  //   .status(200)
  //   .json({ success: true, msg: "Show all bootcamps", middleware: req.hello });
  try {
    const [rows, fields] = await connection.query("select * from bootcamp");
    res.status(200).json({ success: true, item: rows });
  } catch (e) {
    res.status(500).json(e);
  }
};

// @desc    해당 아이디의 정보 조회
// @route   GET /api/v1/bootcamps/id
// @access  Public
exports.getBootcamp = async (req, res, next) => {
  try {
    [rows, fields] = await connection.query(
      `select * from bootcamp where id = ${req.params.id}`
    );
    if (rows.length != 0) {
      res.status(200).json({ success: true, item: rows[0] });
    } else {
      res.status(400).json({ success: false });
    }
  } catch (e) {
    res.status(500).json({ success: false, error: e });
  }
};

//   res
//     .status(200)
//     .json({ success: true, msg: `Show bootcamp ${req.params.id} 번` });
// };

// @desc    새로운 정보를 인서트
// @route   POST /api/v1/bootcamps
// @access  Public
exports.createBootcamp = async (req, res, next) => {
  let title = req.body.title;
  let subject = req.body.subject;
  let teacher = req.body.teacher;
  let start_time = req.body.start_time;

  let query =
    "insert into bootcamp (title, subject, teacher, start_time) values ?";
  let data = [title, subject, teacher, start_time];
  console.log(data);
  try {
    [rows, filed] = await connection.query(query, [[data]]);
    res.status(200).json({ success: true, ret: rows });
  } catch (e) {
    res.status(500).json({ success: false, error: e });
  }
};

// @desc    기존 정보를 업데이트
// @route   PUT /api/v1/bootcamps/id
// @access  Public
exports.updateBootcamp = (req, res, next) => {
  res.status(200).json({
    success: true,
    msg: `Update bootcamp ${req.params.id}`,
  });
};
// @desc    해당정보를 삭제
// @route   DELETE /api/v1/bootcamps/id
// @access  Public
exports.deleteBootcamp = (req, res, next) => {
  res.status(200).json({
    success: true,
    msg: `Delete bootcamp ${req.params.id}`,
  });
};
