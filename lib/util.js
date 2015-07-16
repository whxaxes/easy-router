var fs = require("fs");
var AB_RE = /^(?:A|B)$/;

var util = {
    /**
     * 判断是否为A或B
     * @param msg
     * @returns {boolean}
     */
    isAB:function(msg){
        return AB_RE.test(msg) && !(AB_RE.lastIndex = 0);
    },

    /**
     * 根据路径返回当前路径是否为目录
     * @param filepath      路径
     * @param strict        如果为true则返回用fs模块判断的结果，否则仅从字符串上进行判断
     * @returns {*}
     */
    isDir:function(filepath , strict){
        if(strict){
            return fs.existsSync(filepath) && fs.lstatSync(filepath).isDirectory();
        }
        return filepath.charAt(filepath.length - 1) === "/";
    },

    /**
     * 遍历方法
     * @param arg
     * @param callback
     */
    each:function(arg , callback){
        if(!arg || !(typeof arg == "object"))return;

        if(arg instanceof Array){
            arg.forEach(callback);
        }else {
            for(var k in arg){
                callback(arg[k] , k);
            }
        }
    },

    isObject: function(obj){
        return !!obj && typeof obj === 'object';
    }
};

util.each(['Arguments', 'Array', 'Boolean', 'Function', 'String', 'Number', 'Date', 'RegExp', 'Error'], function(name) {
    util['is' + name] = function(obj) {
        return Object.prototype.toString.call(obj) === '[object ' + name + ']';
    };
});

module.exports = util;