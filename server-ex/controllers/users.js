const connection = require("../db/mysql_connection");
const ErrorResponse = require("../utils/errorResponse");
const validator = require("validator");
// const e = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const { query } = require("../db/mysql_connection");
const e = require("express");
const sendEmail = require("../utils/sendMail");

// @desc   회원가입
// @route  POST /api/v1/user
// @route  POST /api/v1/user/register
// @route  POST /api/v1/user/signup
// @parameters email, passwd
exports.createUser = async (req, res, next) => {
  let email = req.body.email;
  let passwd = req.body.passwd;

  // bcrypt 깔고 입력(hash는 한 방향(단 방향)으로 암호화하는 것)
  // 비밀번호와 같은 것은 단 방향(복호화가 불가능)으로 암호화를 해야한다
  // 그래야 복호화가 안되어서 안전하다(복호화 : 암호화 했던걸 원상태로 돌리는 것)
  // 1234(원문) => sdfsdfsd 암호화
  // sdfsdfsd => 1234(원문) 복호화
  // saltRounds => 8은 암호화를 몇번 할거냐
  const hashedPasswd = await bcrypt.hash(passwd, 8);

  // 이메일이 정상적인가 체크
  if (!validator.isEmail(email)) {
    res.status(500).json({ success: false });
    return;
  }
  // // 이메일 중복체크
  // let query = "select * from user where email = ?";
  // let data = [email];
  // try {
  //   [rows] = await connection.query(query, data);
  //   if (rows.length >= 1) {
  //     res
  //       .status(200)
  //       .json({ success: false, code: 1, message: "이미 존재하는 이메일" });
  //     return;
  //   }
  // } catch {
  //   res.status(500).json({ success: false, error: e });
  //   return;
  // }
  // 유저 인서트(유니크 체크하고)
  // 암호화 한 후 데이터베이스 인서트 할 때 passwd자리에 hashePasswd 넣어준다
  let query = "insert into user (email, passwd) values ? ";
  let data = [email, hashedPasswd];
  let user_id;

  try {
    [result] = await connection.query(query, [[data]]);
    user_id = result.insertId;
    // console.log("user_id" + user_id);
  } catch (e) {
    if (e.errno == 1062) {
      // 이메일 중복된 것이다
      res
        .status(400)
        .json({ success: false, errno: 1, message: "이메일 중복" });
      return;
    } else {
      res.status(500).json({ success: false, error: e });
    }
  }

  let token = jwt.sign({ user_id: user_id }, process.env.ACCESS_TOKEN_SECRET);
  query = "insert into token (token, user_id) values (?, ?)";
  data = [token, user_id];

  try {
    [result] = await connection.query(query, data);

    const message = "환영합니다.";
    try {
      await sendEmail({
        email: email,
        subject: "회원가입축하",
        message: message,
      });
    } catch (e) {
      res.status(500).json({ success: false, error: e });
    }

    res.status(200).json({ success: true, token: token });
    return;
  } catch (e) {
    res.status(500).json({ success: false, error: e });
  }
};

// 로그인 api를 개발하세요

// @desc   로그인
// @route  POST /api/v1/users/login
// @parameters {"email":"thdwnals@gmail.com", "passwd":"1235"}

exports.loginUser = async (req, res, next) => {
  let email = req.body.email;
  let passwd = req.body.passwd;

  let query = "select * from user where email = ? ";
  let data = [email];

  try {
    [rows] = await connection.query(query, data);

    // 비밀번호 가져와서 비밀번호 체크
    let savedPasswd = rows[0].passwd;
    // 비밀번호 체크 : 비밀번호가 서로 맞는지 확인
    // 체크방법 레퍼런스에 나와있음
    let isMatch = await bcrypt.compare(passwd, savedPasswd);
    // let isMatch = bcrypt.compareSync(passwd, savedPasswd);
    if (isMatch == false) {
      res.status(400).json({ success: false, result: isMatch });
      return;
    }
    let token = jwt.sign(
      { user_id: rows[0].id },
      process.env.ACCESS_TOKEN_SECRET
    );
    query = "insert into token (token, user_id) values (?, ?)";
    data = [token, rows[0].id];

    try {
      [result] = await connection.query(query, data);
      res.status(200).json({ success: true, result: isMatch, token: token });
    } catch (e) {
      res.status(500).json({ success: false, error: e });
    }
  } catch (e) {
    res.status(500).json({ success: false, error: e });
  }
};

// 패스워드 변경 API 를 설계 / 개발 하시오
// @desc   패스워드 변경
// @route  POST /api/v1/users/change
// @parameters email, passwd, new_passwd

exports.changePasswd = async (req, res, next) => {
  let email = req.body.email;
  let passwd = req.body.passwd;
  let new_passwd = req.body.new_passwd;

  // 이 유저가, 맞는 유저인지 체크
  let query = "select passwd from user where email = ?";
  let data = [email];

  try {
    [rows] = await connection.query(query, data);
    let savedPasswd = rows[0].passwd;

    let isMatch = bcrypt.compareSync(passwd, savedPasswd);

    if (isMatch != true) {
      res.status(401).json({ success: false, result: isMatch });
      return;
    }
  } catch (e) {
    res.status(500).json({ success: false, error: e });
  }

  query = "update user set passwd = ? where email = ? ";
  // 암호화 된 패스워드 받아온다
  const hashedPasswd = await bcrypt.hash(new_passwd, 8);
  data = [hashedPasswd, email];

  try {
    [result] = await connection.query(query, data);
    if (result.affectedRows == 1) {
      res.status(200).json({ success: true });
    } else {
      res.status(200).json({ success: false });
    }
  } catch (e) {
    res.status(500).json({ success: false, error: e });
  }
};

// 유저의 id 값으로 내 정보 가져오기
// @desc 내 정보 가져오기
// @route GET /api/v1/users
exports.getMyInfo = async (req, res, next) => {
  console.log("내 정보 가져오는 API", req.user);

  res.status(200).json({ success: true, result: req.user });
};

// @desc   로그아웃 api : db에서 해당 유저의 토큰값을 삭제
// @route  POST /api/v1/users/logout
// @parameters  없음
exports.logout = async (req, res, next) => {
  // 토큰테이블에서 현재 이 헤더에 있는 토큰으로 삭제한다
  let token = req.user.token;
  let user_id = req.user.id;

  let query = `delete from token where user_id = ${user_id} and token = "${token}" `;

  try {
    [result] = await connection.query(query);
    // result 를 res 에 넣어서 클라이언트에 보낸다
    //  포스트맨에서 삭제하여 무엇이 오는지 확인해본다
    if (result.affectedRows == 1) {
      res.status(200).json({ success: true, result: result });
      return;
    } else {
      res.status(400).json({ success: false, error: e });
    }
  } catch (e) {
    res.status(500).json({ success: false, error: e });
  }
};

// 안드로이드 사용하고, 아이폰도 사용하고 집 컴퓨터도 사용
// 이 서비스를 각각의 디바이스 마다 다 로그인하여 사용 중이었다
// 전체 디바이스(기기) 전부 다 로그아웃을 시키게 하는 API

// @desc 전체 기기에서 모두 로그아웃 하기
// @route  POST  /api/v1/users/logoutAll

exports.logoutAll = async (req, res, next) => {
  let user_id = req.user.id;

  let query = `delete from token where user_id = ${user_id}`;

  try {
    [result] = await connection.query(query);
    res.status(200).json({ success: true, result: result });
    return;
  } catch (e) {
    res.status(500).json({ success: false, error: e });
  }
};

// 회원탈퇴 : db에서 해당 회원의 유저 정보 삭제 => 유저 정보가 있는 다른 테이블도 정보 삭제

// @desc 회원탈퇴 : 유저 테이블에서 삭제, 토큰 데이블에서 삭제
// @route DELETE  /api/v1/users
exports.deleteUser = async (req, res, next) => {
  let user_id = req.user.id;

  let query = `delete from user where id = ${user_id}`;
  const conn = await connection.getConnection();
  try {
    await conn.beginTransaction();
    console.log("트렌젝션 시작");
    // 첫번째 테이블에서 정보 삭제
    [result] = await conn.query(query);
    // 두번째 테이블에서 정보 삭제
    query = `delete from token where user_id = ${user_id}`;
    [result] = await conn.query(query);

    await conn.commit();
    res.status(200).json({ success: true });
  } catch (e) {
    // 처리하다 잘못되면 롤백으로 원상복구 시킨다
    await conn.rollback();
    res.status(500).json({ success: false, error: e });
  } finally {
    conn.release();
  }
};

// 유저가 패스워드를 분실
// 1. 클라이언트가 패스워드 분실했다고 서버한테 요청
//    서버가 패스워들 변경할 수 있는 url을 클라이언트한테 보내준다
//    (경로에 암호화된 문자열을 보내준다 -> 토큰역할)

// @desc   패스워드 분실
// @route  POST  /api/v1/users/forgotpasswd
// 따로 파라미터 안보내도되고 모스통해서 온다
exports.forgotPasswd = async (req, res, next) => {
  let user = req.user;
  // 암호화된 문자열 만드는 방법
  const resetToken = crypto.randomBytes(20).toString("hex");
  const resetPasswdToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  // 해당 리셋 패스워드 토큰 데이터베이스에 저장
  // 유저 테이블에 reset_passwd_token 컬럼에 저장
  // 문자열 바꿀 경로 , 쿼리에 들어갈 데이터 설정도해준다
  let query = "update user set reset_passwd_token = ? where id = ?";
  let data = [resetPasswdToken, user.id];

  try {
    [result] = await connection.query(query, data);
    user.reset_passwd_token = resetPasswdToken;
    res.status(200).json({ success: true, data: user });
  } catch (e) {
    res.status(500).json({ success: false, error: e });
  }
};

// 2. 클라이언트는 해당 암호화된 주소를 받아서 새로운 비밀번호를 함께 서버로 보낸다
//    서버는 이 주소가 진짜 유효한지 확인해서 새로운 비밀번호로 셋팅

// @desc 리셋 패스워드 토큰을 경로로 만들어서 바꿀 비번과 함께 요청
//       비번 초기화 ( reset passwd api)
// @route POST  /api/v1/user/resetPasswd/:resetPasswdToken(:resetPasswdToken =>/req.params.resetPasswdToken 이 내용임)
// @req   passwd
exports.resetPasswd = async (req, res, next) => {
  const resetPasswdToken = req.params.resetPasswdToken;
  const user_id = req.user.id;

  let query = "select * from user where id = ?";
  let data = [user_id];

  try {
    [rows] = await connection.query(query, data);
    savedResetPasswdToken = rows[0].reset_passwd_token;
    if (savedResetPasswdToken !== resetPasswdToken) {
      res.status(400).json({ success: false });
      return;
    }
  } catch (e) {
    res.status(500).json({ success: false, error: e });
    return;
  }

  let passwd = req.body.passwd;
  // 유저한테 넘어온 패스워드를 암호화 시킨다
  const hashedPasswd = await bcrypt.hash(passwd, 8);
  // 기존에 있던 패스워드를 새로운 패스워드로 업데이트 시킨다
  // reset_passwd_token 패스워드 다 바꾸고 비어있는 패스워드로 다시 바꿔라 '' 공백으로 표시해준다
  query = "update user set passwd = ?, reset_passwd_token = '' where id = ?";
  data = [hashedPasswd, user_id];
  // 유저의 reset_passwd_token 지워라
  delete req.user.reset_passwd_token;
  try {
    [result] = await connection.query(query, data);
    res.status(200).json({ success: true, data: req.user });
    return;
  } catch (e) {
    res.status(500).json({ success: false, error: e });
    return;
  }
};
