//简易着色console
var colorCode = {
    black: 30,
    red: 31,
    green: 32,
    yellow: 33,
    blue: 34,
    magenta: 35,
    cyan: 36,
    white: 37,
    gray: 90
}

module.exports = function(str , type){
    str = (str + "").replace(/\x1B\[\d+m/g, '');

    var color = colorCode[type];

    if (!color)return str;

    return '\x1B[' + color + 'm' + str + '\x1B[0m';
}