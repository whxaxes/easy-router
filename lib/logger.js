/**
 * Created by wanghx on 4/16/16.
 *
 * logger
 *
 */
'use strict';

var COLORS = {
  black:   30,
  red:     31,
  green:   32,
  yellow:  33,
  blue:    34,
  magenta: 35,
  cyan:    36,
  white:   37,
  gray:    90
};

module.exports = {
  log: function(){
    if(process.env.NODE_ENV !== 'test') {
      console.log.apply(console, arguments)
    }
  },

  debug: function(){
    var args = [].slice.call(arguments);
    var msg = '[DEBUG] ' + (args.shift() || '');

    if(process.env.NODE_DEBUG) {
      this.log.apply(this, [msg].concat(args));
    }
  },

  color: function(str, type){
    str = (str + '').replace(/\x1B\[\d+m/g, '');

    var color = COLORS[type];

    if (!color) return str;

    return '\x1B[' + color + 'm' + str + '\x1B[0m';
  }
};
