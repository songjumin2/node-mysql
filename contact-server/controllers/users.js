const validator = require("validator"); //보안
const bcrypt = require("bcrypt"); //비번
const jwt = require("jsonwebtoken"); //토큰

const connection = require("../db/mysql_connection");

// @desc      회원가입
// @route     POST /api/v1/users
// @request   email, passwd
// @response  success
exports.createUser = async (req, res, next) => {
  let email = req.body.email;
  let passwd = req.body.passwd;

  if (!email || !passwd) {
    res.status(400).json();
    return;
  }
  if (!validator.isEmail(email)) {
    res.status(400).json();
    return;
  }
  // 비번 암호화하는 코드
  const hashedPasswd = await bcrypt.hash(passwd, 8);

  let query = "insert into contact_user (email, passwd) values (?,?)";
  let data = [email, hashedPasswd];
  //아무것도 없는 유저아이디 생성해주고
  let user_id;
  //트랜젝션 처리 유저테이블엔 인서트 해서 들어갔는데 토큰테이블에 안들어가면 문제가되니까 트랜잭션 처리한다
  const conn = await connection.getConnection();
  await conn.beginTransaction(); //트랜잭션 시작

  // contact_user 테이블에 인서트
  try {
    [result] = await conn.query(query, data);
    user_id = result.insertId;
  } catch (e) {
    await conn.rollback(); // 다시 처음부터해라
    res.status(500).json();
    return;
  }
  // 제대로 넣었으면 토큰도 넣자, 넣을때 유저 아이디 암호화해라
  const token = jwt.sign({ user_id: user_id }, process.env.ACCESS_TOKEN_SECRET);
  query = "insert into contact_token (user_id, token) values (?,?)";
  data = [user_id, token];

  try {
    [result] = await conn.query(query, data);
  } catch (e) {
    await conn.rollback();
    res.status(500).json();
    return;
  }

  await conn.commit(); //트랜잭션 끝
  await conn.release();
  // 토큰 꼭 보내주기
  res.status(200).json({ success: true, token: token });
};

// @desc     로그인
// @route    POST /api/v1/users/login
// @request  email, passwd
// @response success, token
exports.loginUser = async (req, res, next) => {
  let email = req.body.email;
  let passwd = req.body.passwd;

  let query = "select * from contact_user where email = ?";
  let data = [email];

  let user_id;

  try {
    [rows] = await connection.query(query, data);
    let hashedPasswd = rows[0].passwd;
    user_id = rows[0].id;
    const isMatch = await bcrypt.compare(passwd, hashedPasswd);
    if (isMatch == false) {
      res.status(401).json();
      return;
    }
  } catch (e) {
    res.status(500).json();
    return;
  }
  const token = jwt.sign({ user_id: user_id }, process.env.ACCESS_TOKEN_SECRET);
  query = "insert into contact_token (user_id, token) values (?,?)";
  data = [user_id, token];
  try {
    [result] = await connection.query(query, data);
    res.status(200).json({ success: true, token: token });
  } catch (e) {
    res.status(500).json();
  }
};

// @desc     로그아웃(기기 1대 로그아웃)
// @route    DELETE /api/v1/users/logout
// @request  token(header), user_id(auth)
// @response success
exports.logoutUser = async (req, res, next) => {
  let user_id = req.user.id;
  let token = req.user.token;

  let query = "delete from contact_token where user_id = ? and token = ?";
  let data = [user_id, token];

  try {
    [result] = await connection.query(query, data);
    res.status(200).json({ success: true });
  } catch (e) {
    res.status(500).json();
  }
};
