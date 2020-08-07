// 로그 찍는 로거 함수 만든다.
const logger = (req, res, next) => {
  //req.hello = "Hello World";
  //console.log("미들웨어 실행됨.");
  console.log(
    `${req.method} ${req.protocol}://${req.get("host")} ${req.originalUrl}`
  );
  next();
};

module.exports = logger;
