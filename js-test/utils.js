console.log('utils.js called')

const name = 'Mike'
// 함수만들기
const add = function(a,b){
    return a + b
}

const minus = function(a,b){
    return a - b
}

// name을 노출시켜줘야 다른 파일에서 받을 수 있다.
// module.exports = name

// 여러개 노출시킬 때

// 1번째 방법
module.exports = {name, add, minus}

// 2번째 방법
// module.exports = {
// name : 'Mike',
// // 함수만들기
// add : function(a,b){
//     return a + b
// },
// minus : function(a,b){
//     return a - b
// }
// }
