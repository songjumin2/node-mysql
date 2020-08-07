// 데이터베이스 연결
const connection = require("../db/mysql_connection");
const { off } = require("../db/mysql_connection");

// @desc   영화데이터 모두 불러오는 api (25개씩)
// @route  GET  /api/v1/movies (경로 path만 써야함) 물음표 뒤에붙으면 req.query 바디에 붙으면 안됨
// @req     offset, limit (?offset=30&limit=25)
// @res     success, items[ {id,title,attendance,year}, cnt ]
exports.getMovies = async (req, res, next) => {
  console.log("영화 전부 가져오는 API");

  let offset = req.query.offset;
  let limit = req.query.limit;
  // 쿼리빠졌다 알려주는 코드
  if (!offset || !limit) {
    res.status(400).json({ message: "parameters setting error" });
    return;
  }
  // ${offset}, ${limit} 대신 물음표로 해도됨
  let query = `select m.*, count(r.movie_id) as reply_cnt, round(avg(r.rating), 1) as avg_rating  
  from movie as m
  left join movie_reply as r
  on m.id = r.movie_id
  group by m.id
  order by m.id 
  limit ${offset}, ${limit};`;
  try {
    [rows] = await connection.query(query);
    let cnt = rows.length;
    res.status(200).json({ success: true, items: rows, cnt: cnt });
    return;
  } catch (e) {
    res.status(500).json({ success: false, error: e });
    return;
  }
};

// @desc   영화명으로 검색하는 api (25개씩)
// @route   GET  /api/v1/movies/search
// @req     offset, limit, keyword
//             ( ?offset=0&limit=25&keyword=war )
// @res      success, items[ {id,title,attendance,year}, cnt ]
exports.searchMovies = async (req, res, next) => {
  let offset = req.query.offset;
  let limit = req.query.limit;
  let keyword = req.query.keyword;

  if (!offset || !limit || !keyword) {
    res.status(400).json({ message: "parameters setting error" });
    return;
  }
  // title like는 인덱스로 말고 fulltext로 설정해줘야함
  let query = `select * from movie where title like '%${keyword}%' limit ${offset}, ${limit}`;
  try {
    [rows] = await connection.query(query);
    res.status(200).json({ success: true, items: rows, cnt: rows.length });
    return;
  } catch (e) {
    res.status(500).json({ success: false, error: e });
    return;
  }
};

// @desc   연도로 정렬하는 api (25개씩), 오름, 내림 둘다 가능
// @route  GET  /api/v1/monies/year
// @req     offset, limit, order : asc / desc (디폴트는 아무것도안쓴다 오름차순)
//          (?offset=0&limit=25&order=asc)
// @res     success, items[ {id,title,attendance,year}, cnt ]
exports.getMoviesByYear = async (req, res, next) => {
  let offset = req.query.offset;
  let limit = req.query.limit;
  let order = req.query.order;
  if (!offset || !limit) {
    res.status(400).json({ message: "parameters setting error" });
    return;
  }
  // order (디폴트 파라미터 처리방법, order가 올수도있고 안올수도있는데 없으면 오름차순으로 된다)
  if (!order) {
    order = "asc";
  }
  // year는 인덱스 설정!
  let query = `select * from movie order by year ${order} limit ${offset}, ${limit}`;
  try {
    [rows] = await connection.query(query);
    res.status(200).json({ succes: true, items: rows, cnt: rows.length });
    return;
  } catch (e) {
    res.status(500).json({ success: false, error: e });
  }
};

// @desc    관객수로 정렬하는 api (25개씩)
// @route   GET  /api/v1/movies/attendance
// @req      offset, limit, order : asc / desc
// @res      success, items[ {id,title,attendance,year}, cnt ]
exports.getMovieByAttendance = async (req, res, next) => {
  let offset = req.query.offset;
  let limit = req.query.limit;
  let order = req.query.order;

  if (!offset || !limit) {
    res.status(400).json({ message: "parameters setting error" });
    return;
  }
  // order (디폴트 파라미터 처리방법, order가 올수도있고 안올수도있는데 없으면 오름차순으로 된다)
  if (!order) {
    order = "desc";
  }
  // attendance도 인덱스 설정!
  let query = `select * from movie order by attendance ${order} limit ${offset}, ${limit}`;
  try {
    [rows] = await connection.query(query);
    res.status(200).json({ succes: true, items: rows, cnt: rows.length });
    return;
  } catch (e) {
    res.status(500).json({ success: false, error: e });
  }
};
