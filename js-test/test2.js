function run() {
  console.log("3초 후 실행");
}

console.log("시작");

setTimeout(run, 3000); // 3000밀리세컨즈 3초

console.log("끝");

// non - blocking I/O
