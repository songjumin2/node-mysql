const jwt = require("jsonwebtoken");
const connection = require("../db/mysql_connection");

// auth 함수 만들어준다
const auth = async (req, res, next) => {
  // 토큰 가져온다 리퀘스트에 해더에 저장되어있음
  // 토큰이 있는경우 없는경우도 있기때문에 둘다 체크해줘야함
  // 토큰은 중요하니 따로 빼주고 사용한다
  let token;
  try {
    // 포스트맨에 리퀘스트에 해더에 오쏘리제이션 가져와라
    // 오소리제이션 심어서 보내야된다
    // 토큰 가져오는 코드
    //베어러 제거한다 한방에 제거 하는 방법! .replace("Bearer ", "")
    token = req.header("Authorization").replace("Bearer ", "");
  } catch (e) {
    // 토큰 없을때 코드
    res.status(401).json({ error: "Please authenticate!" });
    return;
  }
  // 해당 토큰이 그 유저의 토큰이 맞는지 확인해본다 토큰값으로 디코딩한다 유저 아이디와 해당 토큰으로 쿼리한다
  // 유저 아이디와 토큰으로 db에 저장되어있는 유효한 유저인지 체크, 한방에 체크하는 방법
  // 디코디드 값에 아이디 들어있으니까 그거 가져온다
  const decoded = jwt.verify(token, process.env.AUTH_TOKEN_SECRET);
  // 뽑아낸다. 회원가입할때 유저 아이디 저장해논거 가져온다
  // 토큰 만들기 config.env 에 AUTH_TOKEN_SECRET=mycompany93 입력하고
  // 데이터베이스에 토큰, 아이디 저장함 유저 아이디값으로 암호화하라고 작성한것임
  // auth에 빼오는거 유저아이디 가져와서 입력, 사인 유저 아이디로 입력했으니 auth에도 유저아이디로입력
  // 만약 이메일이면 이메일쓰면됨
  // const token = jwt.sign({ user_id: user_id }, process.env.AUTH_TOKEN_SECRET);
  // controllers users.js 회원가입 부분에 jwt.sign 할때 사용한 json 키 값을 여기서 빼온다 => decoded.user_id
  let user_id = decoded.user_id;
  // 유저아이디와 토큰 이거있냐 확인하는 쿼리 입력
  // select * from memo_token where user_id = 3 and token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjozLCJpYXQiOjE1OTU1NTIzMjd9.rje3AqOkynUNViyyR6r9bz";
  let query =
    // 웨어절에 나온거는 인덱스를 걸어줘야한다
    // 순서는 토큰먼저 한 후 유저 아이디 해준다 (중복이 덜되는게 첫번째)
    // 한 유저가 안드로이드, 탭, 등등 로그인하면 유저 아이디는 똑같은게 여러개 생기니까 토큰은 같으니 중복이 덜된다
    "select mt.token, mu.id, mu.email, mu.created_at \
  from memo_token as mt \
  join memo_user as mu \
  on mt.user_id = mu.id \
  where mt.user_id = ? and mt.token = ?";
  // 아래 트라이 캐치에는 리턴 안써도됨
  let data = [user_id, token];
  try {
    // 데이터는 로우스로 넘어오니까 [rows] 입력
    [rows] = await connection.query(query, data);
    // 아무것도 없는 데이터를 조회하면 매칭되는게 없으니까 에러인거 표시해준다 if문으로
    // 데이터 없는거면 인증안된거니까 내용 저장
    if (rows.length == 0) {
      // 문제 있을때만 클라이언트에 플리즈내용 넘겨준다
      res.status(401).json({ error: "Please authenticate!" });
      return;
    } else {
      // 데이터가 있는거면 정상이니까 아래처럼 입력 req에 유저정보 가져와야함 (미들웨어는 인증하는것)
      // 바로 인증해서 라우트로 인증하면 보안에 문제가 있으니까 토큰해서
      // 문제없으면 라우트로 넘어가서 처리해라 그 함수 이름이 next( )해줘야함
      // 유저정보 패스워드빼고 넘겨줘야함 memo_user에 있는
      // -- 가져올때 비밀번호 가져오지않는다.
      //select mt.token, mu.id, mu.email, mu.created_at from memo_token as mt
      //join memo_user as mu
      //on mt.user_id = mu.id
      //where mt.user_id = 3 and mt.token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjozLCJpYXQiOjE1OTU1NTIzMjd9.rje3AqOkynUNViyyR6r9bz";
      // req에 담겨있는 user 가져온다
      req.user = rows[0];
      next();
      return;
    }
  } catch (e) {
    res.status(401).json({ error: "Please authenticate!" });
    return;
  }
};

// 먼저 인증하고 뭐뭐 해라 .. 이걸 써줘야 라우터에서 가져다 사용할 수 있음
module.exports = auth;
