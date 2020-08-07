// promise로 개발된, mysql2패키지를 설치하고 로딩
const mysql = require("mysql2");

// db-config.json 에 저장된 중요 정보를 여기서 셋팅.
const db_config = require("../config/db-config.json");

const pool = mysql.createPool({
  host: db_config.MYSQL_HOST,
  user: db_config.MYSQL_USER,
  database: db_config.DB_NAME,
  password: db_config.DB_PASSWD,
  waitForConnections: true,
  connectionLimit: 10,
});

const connection = pool.promise();

module.exports = connection;
