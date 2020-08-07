const { get } = require("http")


const getNotes = function(){
    return 'Hello ~'
}

module.exports = getNotes

// 확인방법 
// let ret =  getNotes()
// console.log(ret)