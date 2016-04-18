/**
 * util工具模块
 * @type {exports}
 */

'use strict';

var fs = require('fs');
var AB_REG = /^(?:A|B)$/;

var util = {
  /**
   * 判断是否为A或B
   * @param msg
   * @returns {boolean}
   */
  isAB: function(msg) {
    return AB_REG.test(msg) && !(AB_REG.lastIndex = 0);
  },

  /**
   * 遍历方法
   * @param arg
   * @param callback
   */
  each: function(arg, callback) {
    if (!arg || typeof arg !== 'object') return;

    if (arg instanceof Array) {
      arg.forEach(callback);
    } else {
      for (var k in arg) {
        callback(arg[k], k);
      }
    }
  },

  isObject: function(obj) {
    return !!obj && typeof obj === 'object';
  }
};

util.each(['Arguments', 'Array', 'Boolean', 'Function', 'String', 'Number', 'Date', 'RegExp', 'Error'], function(name) {
  util['is' + name] = function(obj) {
    return Object.prototype.toString.call(obj) === '[object ' + name + ']';
  };
});

module.exports = util;