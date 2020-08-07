const url = require("url");
const querystring = require("querystring");

const parseUrl = url.parse(
  "https://www.gilbut.co.kr/?page=3&limit=10&category=nod"
);

const query = querystring.parse(parseUrl.query);

console.log(query);
console.log(querystring.stringify(query));
