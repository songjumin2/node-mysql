// 1. 데이터베이스 연결
const connection = require("../db/mysql_connection");
// 2. Json Web Token
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const validator = require("validator");

// 3.
// @desc    회원가입
// @route  POST /api/v1/users
// @parameters email, passwd
exports.createUser = async (req, res, next) => {
  // 클라이언트로부터 이메일, 비번 받아서 변수로 만들기
  let email = req.body.email;
  let passwd = req.body.passwd;

  // 이메일 확인, 비번 암호화 해야함
  // 1. 이메일 확인함 벨리데이터로
  // 이메일 맞으면 아래로 보내고 다르면 클라이언트에게 바로 잘못보냈다고 전달
  // 리턴 꼭 해주기
  if (validator.isEmail(email) == false) {
    res.status(400).json({ success: false });
    return;
  }
  // 2. 비밀번호 암호화하기
  const hashedPasswd = await bcrypt.hash(passwd, 8);
  // 일단 회원가입 insert 해줘야함
  let query = "insert into memo_user (email, passwd) values(?, ?)";
  let data = [email, hashedPasswd];
  let user_id;
  // 쿼리 날린다 insert 문이라 result로 함 셀렉트문이면 rows

  try {
    [result] = await connection.query(query, data);
    // 인서트하면 인서트한 유저의 아이디값 가져온다
    user_id = result.insertId;
  } catch (e) {
    res.status(500).json({ success: false });
    return;
  }

  // 토큰 만들기 config.env 에 AUTH_TOKEN_SECRET=mycompany93 입력하고
  //데이터베이스에 토큰, 아이디 저장함 유저 아이디값으로 암호화하라고 작성한것임
  // auth에 빼오는거 유저아이디 가져와서 입력 사인 유저 아이디로 입력했으니 auth에도 유저아이디로입력
  // 만약 이메일이면 이메일쓰면됨
  const token = jwt.sign({ user_id: user_id }, process.env.AUTH_TOKEN_SECRET);

  query = "insert into memo_token (token, user_id) values (?, ?)";
  data = [token, user_id];
  try {
    [result] = await connection.query(query, data);
  } catch (e) {
    res.status(500).json({ success: false, error: e });
    return;
  }

  res.status(200).json({ success: true, token: token });
};

// @desc  로그인
// @route POST /api/v1/users/login
// @request  email, passwd  (클라이언트(유저)가 로그인할때 이메일, 패스워드 줘야하니까 파라미터에 입력)
// @response  success, token (클라이언트에 전달해주는 것)
exports.loginUser = async (req, res, next) => {
  // 로그인도 이메일 패스워드 필요하니 가져온다
  let email = req.body.email;
  let passwd = req.body.passwd;

  // 해당유저가 맞는지 검증한다 (비번검증) 그러기 위해선 이메일로 쿼리하나만듬
  let query = "select * from memo_user where email = ?";
  // 데이터는 이메일이니까 이메일만 입력하면된다
  let data = [email];

  console.log(email);
  // 유저아이디 가져오는게 인증토큰 만드려고
  let user_id;
  try {
    //로우스에 데이터가 담아서 온다(user_id,,,,)
    [rows] = await connection.query(query, data);
    // 이메일아닌사람이 접속했는지 확인하는 것, 0이거나 .. 없는사람이 로그인 한거임(이메일확인)
    // res 했으면 리턴이 있어야함
    if (rows.length == 0) {
      res.status(400).json({ success: false, message: "없는 아이디" });
      return;
    }
    // 패스워드가 맞는지 확인하기위해서
    // 데이터베이스에 저장되어있는 내용들은 rows에 들어가있음
    const isMatch = await bcrypt.compare(passwd, rows[0].passwd);
    if (isMatch == false) {
      res.status(401).json({ success: false, message: "비밀번호 틀림" });
      return;
    }
    // 컬럼의 이름이 id임
    user_id = rows[0].id;
  } catch (e) {
    res.status(500).json({ success: false, error: e });
    return;
  }
  // 유저 아이디 뽑아왔으니 토큰 만든다.(암호화했다)
  let token = jwt.sign({ user_id: user_id }, process.env.AUTH_TOKEN_SECRET);

  query = "insert into memo_token (token, user_id) values (?, ?)";
  data = [token, user_id];

  try {
    [result] = await connection.query(query, data);
    // 로그인이나, 패스워드할때는 토큰을 무조건 보내줘야한다. 클라이언트에게!
    res.status(200).json({ success: true, token: token });
    return;
  } catch (e) {
    res.status(500).json({ success: false, error: e });
    return;
  }
};

// @desc  내정보 가져오는 API
// @url   GET /api/v1/users/me
// @request (없음)
// @response id, email, created_at
////예시 이렇게도 입력 가능 @response success, info{id, email, created_at}
// 오스라는 미들웨어 통해서 내정보를 가져오는 것 회원가입을해야 디비에 내 정보가 있는거니까
// 토큰부여받은애들이 가져와지는것
exports.myInfo = (req, res, next) => {
  // 인증 토큰 검증 통과해서 이 함수로 온다
  // req에 user가 이미 담겨있다
  let userInfo = req.user;
  // userInfo자체가 제이슨으로 되어있으니까 그냥 입력
  res.status(200).json(userInfo);
  // 이렇게도 입력 가능 그럼 포스트맨에 입력하는 그대로 제이슨 뜸
  // res.status(200).json({success:true, info:userInfo});
};
