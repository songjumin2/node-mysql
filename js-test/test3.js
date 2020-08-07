// promise
const condition = true;
const promise = new Promise(function (resolve, reject) {
  if (condition) {
    resolve("성공");
  } else {
    reject("실패");
  }
});

promise
  .then((message) => {
    console.log(message);
  })
  .catch((error) => {
    console.log(error);
  });
