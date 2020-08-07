const request = require("postman-request");

// request('http://www.google.com', function (error, response, body) {
//   console.log('error:', error); // Print the error if one occurred
//   console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
//   console.log('body:', body); // Print the HTML for the Google homepage.
// });

// 1. 화곡역의 위도, 경도를 뽑아서 출력

// const url = 'https://api.mapbox.com/geocoding/v5/mapbox.places/화곡역.json?access_token=pk.eyJ1Ijoic29uZ2p1bWluIiwiYSI6ImNrY214d3d0eTA1czkycm82a2x0ejc2dXgifQ.QKh_itxMQuNUhZwz8Cnhhg'
// // 한글쓸때 내장되어있는 함수 사용해서 변환시켜 사용 encodeURI
// let encodedUrl = encodeURI(url)

// request.get({url: encodedUrl, json:true},
//     function(error, response, body){
//         console.log(body.features[0].center[1])
//         console.log(body.features[0].center[0])
//     });

const connection = require("./mysql_connection");
const url =
  "https://developers.google.com/youtube/v3/search?&part=snippet&key=AIzaSyDXbtuFyis719r1GLy0Vhjk9nVhLjhKGTo";

let encodedUrl = encodeURI(url);

request.get({ url: encodedUrl, json: true }, function (error, response, body) {
  console.log(body.features[0].center[1]);
  console.log(body.features[0].center[0]);
});
