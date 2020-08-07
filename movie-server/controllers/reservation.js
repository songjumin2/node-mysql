const moment = require("moment");
const connection = require("../db/mysql_connection");
const { forgotPasswd } = require("./users");

// @desc  좌석 예약하기
// @route POST /api/v1/reservation  //새로운 데이터 들어가니까 post
// @request movie_id, seat_number_arr[], start_time, user_id(auth에 있는)  /(파라미터) 여러좌석 동시에 예약할 수 있게 seat_number_arr (어레이로)
// @response success / 결과 클라이언트에게 보내준다

exports.setReservation = async (req, res, next) => {
  let movie_id = req.body.movie_id;
  let seat_number_arr = req.body.seat_number_arr; // 여러 좌석 동시에 예약 할 수 있게 arr사용
  let start_time = req.body.start_time;
  let user_id = req.user.id;

  // 무결성 체크/클라이언트에게 내용 보내준다
  if (!movie_id || !seat_number_arr || !start_time || !user_id) {
    res.status(400).json({ success: false, message: "모두 입력해주세요" });
    return;
  }

  // 첫번째 방법 : select 해서 해당 좌석 정보가 있는지 확인 => rows.length == 1 (1이면 있다는 얘기)
  // 두번째 방법 : 테이블에 movie_id, start_time, seat_number를 unique하게 설정  //workbench에서 설정 이게 더 효율성 있음
  // insert니까 [result]로
  // 한꺼번에 insert하는 방법 values ?(물음표하나로), 데이터 지우고 for문으로
  let query =
    "insert into movie_reservation \
  (movie_id, seat_number, start_time, user_id) values ? ";

  let data = [];
  for (let i = 0; i < seat_number_arr.length; i++) {
    // 데이터 뽑아내기 (쿼리문 순서대로 데이터 집어넣어준다, 시트넘버를 배열로만들기), [data]로 대괄호로 한번싸준다
    data.push([movie_id, seat_number_arr[i], start_time, user_id]);
  }
  console.log(data);
  try {
    [result] = await connection.query(query, [data]);
    res.status(200).json({
      success: true,
      message: "좌석이 예약 되었습니다.",
    });
    return;
  } catch (e) {
    // 1062 중복된것 표시 클라이언트에게 에러정보 보내준다
    if (e.errno == 1062) {
      res.status(400).json({ message: "이미 예약 된 좌석입니다." });
      return;
    } else {
      // 그렇지 않으면 디비서버에서 에러난거다라고 표시
      res.status(500).json({ error: e });
      return;
    }
  }
};

// @desc    상영시간의 해당영화 좌석 불러오기(모든 좌석 정보)
// @route   GET /api/v1/reservation?start_time=&movie_id=
// @request start_time, movie_id
// @response success, items[], cnt

exports.getReservation = async (req, res, next) => {
  let start_time = req.query.start_time;
  let movie_id = req.query.movie_id;

  if (!start_time || !movie_id) {
    res.status(400).json({ success: false, message: "모두 입력" });
  }
  let query =
    "select id, movie_id, seat_number from movie_reservation \
  where start_time = ? and movie_id = ?";
  data = [start_time, movie_id];

  try {
    [rows] = await connection.query(query, data);
    res.status(200).json({ success: true, items: rows, cnt: rows.length });
    return;
  } catch (e) {
    res.status(500).json({ error: e });
    return;
  }
};

// @desc    내가 예약한 좌석 정보 불러오기
// @route   GET /api/v1/reservation/me
// @request user_id(auth)
// @response success, items[], cnt
exports.getMyResevation = async (req, res, next) => {
  let user_id = req.user.id;

  if (!user_id) {
    res.status(400).json({ success: false, message: "오류" });
    return;
  }

  // 지금 현재 시간보다 상영시간이 지난 시간의 예약은 가져올 필요가 없다
  // and start_time > ?
  // 현재시간이니까
  // npm i moment 시간관련 설치 후 리퀘스트 입력
  //숫자로 되어있는걸 문자형식으로 바꾸려는 것 moment

  // 현재 시간을 밀리세컨즈 1970년1월1일 이후의 시간 => 숫자
  let currentTime = Date.now();
  // currentTime = currentTime + 1000*60*30 => 현재부터 30분이후의 영화 가져오기
  // 위의 현재시간 숫자를 => 2020-07-31 12:21:34 식으로 바꿔준 것
  let compareTime = moment(currentTime).format("YYYY-MM-DD HH:mm:ss");
  console.log(currentTime);
  console.log(compareTime);

  // 영화시작시간이 현재 시간보다 이후의 시간으로 예약 된 정보만 가져오는 쿼리
  // 타이틀 보이게 클라이언트에게 보내주기
  let query =
    "select * from movie_reservation as r \
    join movie as m \
    on r.movie_id = m.id \
    where user_id = ? and start_time > ?";

  let data = [user_id, compareTime];

  try {
    [rows] = await connection.query(query, data);
    res.status(200).json({ success: true, items: rows, cnt: rows.length });
  } catch (e) {
    res.status(500).json({ success: false });
  }
};

// db 직접 처리법
// select
// if(TIMESTAMPDIFF(MINUTE, DATE_ADD(NOW(), INTERVAL 9 HOUR),
// 	start_at) > 30, true, false)
// 	as possible_cancel
// from manage_reservation as m join reservation as r on m.reserve_id = r.reserve_id;

// @desc   좌석 예약을 취소
// @route  DELETE /api/v1/reservations/:reservation_id
// @request user_id(auth)
// @response success
exports.deleteReservation = async (req, res, next) => {
  let reservation_id = req.params.reservation_id;
  let user_id = req.user.id;

  // 시작시간 30분 전에는 취소 불가
  let currentTime = Date.now(); // 현재시간 밀리세컨즈 1596166728086 //1000밀리세컨즈가 1초
  let compareTime = currentTime + 1000 * 60 * 30; // 현재시간 + 30분

  let query = "select * from movie_reservation where id = ?";
  let data = [reservation_id];

  try {
    [rows] = await connection.query(query, data);
    // DB에 저장된 timestamp("YYYY-MM-DD HH:mm:ss") 형식을 => 밀리세컨즈로 바꾸는 방법
    let start_time = rows[0].start_time;
    let mili_start_time = new Date(start_time).getTime();
    // 30분 이내라는 뜻
    if (mili_start_time < compareTime) {
      res
        .status(400)
        .json({ message: "영화 상영 30분 이전에는 취소가 불가능 합니다" });
      return;
    }
  } catch (e) {
    res.status(500).json({ success: false });
  }

  query = "delete from movie_reservation where id = ?";
  data = [reservation_id];

  try {
    [result] = await connection.query(query, data);
    res.status(200).json({ success: true, message: "취소 되었습니다" });
  } catch (e) {
    res.status(500).json({ success: false });
  }
};
