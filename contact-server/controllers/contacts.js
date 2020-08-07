const connection = require("../db/mysql_connection");

// 모든 주소록 데이터를 다 가져와서 클라이언트한테 보내는 것은 문제가 있다.
// 데이터를 모두 다 보내지 않고 끊어서 보내야 함
// 현업에서는 20~30개 사이로 끊어서 보낸다 ?offset=0&limit=20

// @desc 모든 주소록 가져오기 메소드 페스
// @route GET /api/v1/contacts?offset=0&limit=20
exports.getAllContacts = async (req, res, next) => {
  let offset = req.query.offset;
  let limit = req.query.limit;

  let query = `select * from contact limit ${offset}, ${limit}`;

  try {
    [rows, fields] = await connection.query(query);
    let count = rows.length;
    res.status(200).json({ succes: true, items: rows, count: count });
  } catch (e) {
    res.status(500).json({ success: false, message: "DB ERROR", error: e });
  }
};

// @desc 주소록 1개 추가하기
// @route POST /api/v1/contacts
// @parameters name, phone
exports.createContact = async (req, res, next) => {
  let name = req.body.name; // {name : "김나나", phone : "010-1535-4564"}
  let phone = req.body.phone; // {name : "김나나", phone : "010-1535-4564"}

  let query = "insert into (name, phone) values? ";
  let data = [name, phone];

  try {
    [result] = await connection.query(query, [[data]]);
    res.status(200).json({ success: true, result: result });
  } catch (e) {
    res.status(500).json({ success: false, message: "DB ERROR", error: e });
  }
};

// @desc 주소록 1개 수정하기
// @route PUT /api/v1/contacts
// @parameters id, name, phone
exports.updateContact = async (req, res, next) => {
  let id = req.body.id;
  let name = req.body.name;
  let phone = req.body.phone;

  let querty = "update contact set name = ?, phone = ? where id = ?";
  let data = [name, phone, id];

  try {
    [result] = await connection.query(query, data);
    res.status(200).json({ success: true, result: result });
  } catch (e) {
    res.status(500).json({ success: false, message: "DB ERROR", error: e });
  }
};

// @desc 주소록 1개 삭제하기
// @route DELETE /api/v1/contacts
// @parameters  id
exports.deleteContact = async (req, res, next) => {
  let id = req.body.id;

  let query = "delete from contact where id = ?";
  let data = [id];

  try {
    [result] = await connection.query(query, data);
    res.status(200).json({ success: true, result: result });
  } catch (e) {
    res.status(500).json({ success: false, message: "DB ERROR", error: e });
  }
};

// @desc 이름이나, 전화번호 검색하는 API
// @route GET /api/v1/contacts/search?keyword=67
// @route GET /api/v1/contacts/search?keyword=길동
// 서치컨텍트 함수만들었음
exports.searchContact = async (req, res, next) => {
  let keyword = req.query.keyword;
  let query = `select * from contact where name like "%${keyword}%" or phone like "%${keyword}%"`;

  try {
    [rows, fields] = await connection.query(query);
    res.status(200).json({ succes: true, items: rows });
  } catch (e) {
    res.status(500).json({ success: false, message: "DB ERROR", error: e });
  }
};
