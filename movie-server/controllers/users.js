const validator = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const path = require("path");
const connection = require("../db/mysql_connection");

// @desc   회원가입
// @route  POST /api/v1/user   // post는 body로 받는다
// @parameters email, passwd
exports.createUser = async (req, res, next) => {
  let email = req.body.email;
  let passwd = req.body.passwd;

  // 이메일이 정상적인가 체크
  if (!validator.isEmail(email)) {
    res.status(400).json({ success: false });
    return;
  }

  // npm bcrypt 암호화하는 양식 입력
  const hashedPasswd = await bcrypt.hash(passwd, 8);

  // 암호화까지 다되었으니까 디비에 저장하는 코드 입력하기
  let query = "insert into movie_user (email, passwd) values (?, ?) ";
  let data = [email, hashedPasswd];
  let user_id;
  // 커넥션 가져오기 트랜잭션 입력을 위해
  const conn = await connection.getConnection();
  await conn.beginTransaction();

  try {
    [result] = await conn.query(query, data);
    user_id = result.insertId;
  } catch (e) {
    await conn.rollback();
    res.status(500).json();
    return;
  }

  // 토큰 처리 npm jsonwebtoken 입력
  // 토큰 생성 sign 함수 써야함
  // user_id로 썼으니 auth에 decoded 할때도 같이 user_id로 쓴다
  let token = jwt.sign({ user_id: user_id }, process.env.ACCESS_TOKEN_SECRET);
  query = "insert into movie_token (token, user_id) values (?, ?)";
  data = [token, user_id];

  try {
    [result] = await conn.query(query, data);
  } catch (e) {
    await conn.rollback();
    res.status(500).json({ success: false, error: e });
    return;
  }
  await conn.commit();
  await conn.release();

  res.status(200).json({ success: true, token: token });
};

// 로그인 api를 개발하세요

// @desc   로그인
// @route  POST /api/v1/users/login
// @parameters {"email":"thdwnals@gmail.com", "passwd":"1235"}

exports.loginUser = async (req, res, next) => {
  let email = req.body.email;
  let passwd = req.body.passwd;
  // 암호화된 암호를 비교하면된다
  let query = "select * from movie_user where email = ? ";
  let data = [email];

  let user_id;
  try {
    // rows에 패스워드 들어가있음
    [rows] = await connection.query(query, data);
    // 비밀번호 가져와서 비밀번호 체크
    let hashedPasswd = rows[0].passwd;
    user_id = rows[0].id;
    // 비밀번호 체크 : 비밀번호가 서로 맞는지 확인(비교하는 코드)
    // 체크방법 레퍼런스에 나와있음 (await쓰면 compare쓰면됨)
    let isMatch = await bcrypt.compare(passwd, hashedPasswd);
    // let isMatch = bcrypt.compareSync(passwd, savedPasswd);
    // 패스워드와 암호화된 패스워드가 틀리면 401로 보냄 성공이면 리턴이없으니까 밑으로 내려온다
    if (isMatch == false) {
      res.status(401).json({ success: false, result: isMatch });
      return;
    }
  } catch (e) {
    // 데이터베이스 오류났을 때 표시해준다
    res.status(500).json({ success: false, error: e });
    return;
  }
  // 토큰 생성해줬음
  const token = jwt.sign({ user_id: user_id }, process.env.ACCESS_TOKEN_SECRET);
  // 토큰생성해줬으니까 데이터베이스에 저장하기위한 쿼리
  query = "insert into movie_token (token, user_id) values (?, ?)";
  data = [token, user_id];
  try {
    [result] = await connection.query(query, data);
    res.status(200).json({ success: true, token: token });
    return;
  } catch (e) {
    res.status(500).json({ error: e });
    return;
  }
};

// @desc   로그아웃 api : db에서 해당 유저의 토큰값을 삭제 (현재의 기기 1개에 대한 로그아웃)
// @route  DELETE /api/v1/users/logout
// @parameters  없음
exports.logout = async (req, res, next) => {
  // 토큰테이블에서 현재 이 헤더에 있는 토큰으로 삭제한다
  // movie_token 테이블에서 토큰 삭제해야 로그아웃이 되는 것이다
  let user_id = req.user.id;
  let token = req.user.token;
  // where 절에 나오는 것은 인덱스 생성해줘라 and니까 두개 묶어서 생성
  let query = "delete from movie_token where user_id = ? and token = ? ";
  let data = [user_id, token];
  try {
    [result] = await connection.query(query, data);
    res.status(200).json({ success: true });
    return;
  } catch (e) {
    res.status(500).json({ success: false, error: e });
    return;
  }
};

// @desc     유저의 프로필 사진 설정하는 API
// @route    PUT /api/v1/users/me/photo
// @request  photo
// @response success

// 클라이언트가 사진을 보낸다(req.files)이 안에 들어있다 => 서버가 이 사진을 받는다 =>
// 서버가 이 사진을 디렉토리에 저장한다 => 이 사진의 파일명을 DB에 저장한다
exports.userPhotoUpload = async (req, res, next) => {
  let user_id = req.user.id;
  if (!user_id || !req.files) {
    res.status(400).json({ success: false });
    return;
  }
  console.log(req.files);
  const photo = req.files.photo;
  // 지금 받은 파일이 이미지 파일인지 체크
  if (photo.mimetype.startsWith("image") == false) {
    res.status(400).json({ success: false, message: "이미지 파일이 아닙니다" });
    return;
  }
  if (photo.size > process.env.MAX_FILE_SIZE) {
    res.status(400).json({ message: "파일크기가 정해진 것 보다 큽니다" });
    return;
  }

  // path 사용 => 유저 아이디로하고 파일명을 변경.jpg뜻이 ${path.parse(photo.name).ext 이거임
  // fall.jpg => photo_3.jpg
  // abc.name => photo_3.png
  photo.name = `photo_${user_id}${path.parse(photo.name).ext}`;
  // 저장할 경로 셋팅(문자열로 만든거임) : ./public/upload/photo_3.jpg
  let fileUploadPath = `${process.env.FILE_UPLOAD_PATH}/${photo.name}`;

  // 파일을 우리가 지정한 경로에 저장하는 코드
  photo.mv(fileUploadPath, async (err) => {
    if (err) {
      console.error(err);
      return;
    }
  });

  // db에 이 파일이름을 업데이트 한다
  let query = "update movie_user set photo_url = ? where id = ?";
  let data = [photo.name, user_id];

  try {
    [result] = await connection.query(query, data);
    res.status(200).json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false });
  }

  res.status(200).json({ success: true });
};

//
//
//
// // 패스워드 변경 API 를 설계 / 개발 하시오
// // @desc   패스워드 변경
// // @route  POST /api/v1/users/change
// // @parameters email, passwd, new_passwd

// exports.changePasswd = async (req, res, next) => {
//   let email = req.body.email;
//   let passwd = req.body.passwd;
//   let new_passwd = req.body.new_passwd;

//   // 이 유저가, 맞는 유저인지 체크
//   let query = "select passwd from movie_user where email = ?";
//   let data = [email];

//   try {
//     [rows] = await connection.query(query, data);
//     let savedPasswd = rows[0].passwd;

//     let isMatch = bcrypt.compareSync(passwd, savedPasswd);

//     if (isMatch != true) {
//       res.status(401).json({ success: false, result: isMatch });
//       return;
//     }
//   } catch (e) {
//     res.status(500).json({ success: false, error: e });
//     return;
//   }

//   query = "update movie_user set passwd = ? where email = ? ";
//   // 암호화 된 패스워드 받아온다
//   const hashedPasswd = await bcrypt.hash(new_passwd, 8);
//   data = [hashedPasswd, email];

//   try {
//     [result] = await connection.query(query, data);
//     if (result.affectedRows == 1) {
//       res.status(200).json({ success: true });
//       return;
//     } else {
//       res.status(200).json({ success: false });
//       return;
//     }
//   } catch (e) {
//     res.status(500).json({ success: false, error: e });
//     return;
//   }
// };

// // 유저의 id 값으로 내 정보 가져오기
// // @desc 내 정보 가져오기
// // @route GET /api/v1/users
// exports.getMyInfo = async (req, res, next) => {
//   console.log("내 정보 가져오는 API", req.user);

//   res.status(200).json({ success: true, result: req.user });
//   return;
// };

// // @desc   로그아웃 api : db에서 해당 유저의 토큰값을 삭제 (현재의 기기 1개에 대한 로그아웃)
// // @route  DELETE /api/v1/users/logout
// // @parameters  없음
// exports.logout = async (req, res, next) => {
//   // 토큰테이블에서 현재 이 헤더에 있는 토큰으로 삭제한다
//   // movie_token 테이블에서 토큰 삭제해야 로그아웃이 되는 것이다
//   let user_id = req.user.id;
//   let token = req.user.token;
//   // where 절에 나오는 것은 인덱스 생성해줘라 and니까 두개 묶어서 생성
//   let query = "delete from movie_token where user_id = ? and token = ? ";
//   let data = [user_id, token];
//   try {
//     [result] = await connection.query(query, data);
//     res.status(200).json({ success: true });
//     return;
//   } catch (e) {
//     res.status(500).json({ success: false, error: e });
//     return;
//   }
// };

// // 안드로이드 사용하고, 아이폰도 사용하고 집 컴퓨터도 사용
// // 이 서비스를 각각의 디바이스 마다 다 로그인하여 사용 중이었다
// // 전체 디바이스(기기) 전부 다 로그아웃을 시키게 하는 API

// // @desc 전체 기기에서 모두 로그아웃 하기
// // @route  POST  /api/v1/users/logoutAll

// exports.logoutAll = async (req, res, next) => {
//   let user_id = req.user.id;

//   let query = `delete from movie_token where user_id = ${user_id}`;

//   try {
//     [result] = await connection.query(query);
//     res.status(200).json({ success: true, result: result });
//     return;
//   } catch (e) {
//     res.status(500).json({ success: false, error: e });
//     return;
//   }
// };

// // 회원탈퇴 : db에서 해당 회원의 유저 정보 삭제 => 유저 정보가 있는 다른 테이블도 정보 삭제

// // @desc 회원탈퇴 : 유저 테이블에서 삭제, 토큰 데이블에서 삭제
// // @route DELETE  /api/v1/users
// exports.deleteUser = async (req, res, next) => {
//   let user_id = req.user.id;

//   let query = `delete from movie_user where id = ${user_id}`;
//   const conn = await connection.getConnection();
//   try {
//     await conn.beginTransaction();
//     console.log("트렌젝션 시작");
//     // 첫번째 테이블에서 정보 삭제
//     [result] = await conn.query(query);
//     // 두번째 테이블에서 정보 삭제
//     query = `delete from movie_token where user_id = ${user_id}`;
//     [result] = await conn.query(query);

//     await conn.commit();
//     res.status(200).json({ success: true });
//     return;
//   } catch (e) {
//     // 처리하다 잘못되면 롤백으로 원상복구 시킨다
//     await conn.rollback();
//     res.status(500).json({ success: false, error: e });
//     return;
//   } finally {
//     conn.release();
//   }
// };

// // 유저가 패스워드를 분실
// // 1. 클라이언트가 패스워드 분실했다고 서버한테 요청
// //    서버가 패스워들 변경할 수 있는 url을 클라이언트한테 보내준다
// //    (경로에 암호화된 문자열을 보내준다 -> 토큰역할)

// // @desc   패스워드 분실
// // @route  POST  /api/v1/users/forgotpasswd
// // 따로 파라미터 안보내도되고 모스통해서 온다
// exports.forgotPasswd = async (req, res, next) => {
//   let user = req.user;
//   // 암호화된 문자열 만드는 방법
//   const resetToken = crypto.randomBytes(20).toString("hex");
//   const resetPasswdToken = crypto
//     .createHash("sha256")
//     .update(resetToken)
//     .digest("hex");
//   // 해당 리셋 패스워드 토큰 데이터베이스에 저장
//   // 유저 테이블에 reset_passwd_token 컬럼에 저장
//   // 문자열 바꿀 경로 , 쿼리에 들어갈 데이터 설정도해준다
//   let query = "update movie_user set reset_passwd_token = ? where id = ?";
//   let data = [resetPasswdToken, user.id];

//   try {
//     [result] = await connection.query(query, data);
//     user.reset_passwd_token = resetPasswdToken;
//     res.status(200).json({ success: true, data: user });
//     return;
//   } catch (e) {
//     res.status(500).json({ success: false, error: e });
//     return;
//   }
// };

// // 2. 클라이언트는 해당 암호화된 주소를 받아서 새로운 비밀번호를 함께 서버로 보낸다
// //    서버는 이 주소가 진짜 유효한지 확인해서 새로운 비밀번호로 셋팅

// // @desc 리셋 패스워드 토큰을 경로로 만들어서 바꿀 비번과 함께 요청
// //       비번 초기화 ( reset passwd api)
// // @route POST  /api/v1/user/resetPasswd/:resetPasswdToken(:resetPasswdToken =>/req.params.resetPasswdToken 이 내용임)
// // @req   passwd
// exports.resetPasswd = async (req, res, next) => {
//   const resetPasswdToken = req.params.resetPasswdToken;
//   const user_id = req.user.id;

//   let query = "select * from movie_user where id = ?";
//   let data = [user_id];

//   try {
//     [rows] = await connection.query(query, data);
//     savedResetPasswdToken = rows[0].reset_passwd_token;
//     if (savedResetPasswdToken !== resetPasswdToken) {
//       res.status(400).json({ success: false });
//       return;
//     }
//   } catch (e) {
//     res.status(500).json({ success: false, error: e });
//     return;
//   }

//   let passwd = req.body.passwd;
//   // 유저한테 넘어온 패스워드를 암호화 시킨다
//   const hashedPasswd = await bcrypt.hash(passwd, 8);
//   // 기존에 있던 패스워드를 새로운 패스워드로 업데이트 시킨다
//   // reset_passwd_token 패스워드 다 바꾸고 비어있는 패스워드로 다시 바꿔라 '' 공백으로 표시해준다
//   query =
//     "update movie_user set passwd = ?, reset_passwd_token = '' where id = ?";
//   data = [hashedPasswd, user_id];
//   // 유저의 reset_passwd_token 지워라
//   delete req.user.reset_passwd_token;
//   try {
//     [result] = await connection.query(query, data);
//     res.status(200).json({ success: true, data: req.user });
//     return;
//   } catch (e) {
//     res.status(500).json({ success: false, error: e });
//     return;
//   }
// };
