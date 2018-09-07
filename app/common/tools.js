'use strict';

const path = require('path')
const fs = require('fs')
module.exports = {
  dateformat: (strdate, fmt) => {
    const self = new Date(strdate)
    const o = {
      'M+': self.getMonth() + 1, // 月份
      'd+': self.getDate(), // 日
      'h+': self.getHours(), // 小时
      'm+': self.getMinutes(), // 分
      's+': self.getSeconds(), // 秒
      'q+': Math.floor((self.getMonth() + 3) / 3), // 季度
      S: self.getMilliseconds(), // 毫秒
    };
    if (/(y+)/.test(fmt)) {
      fmt = fmt.replace(RegExp.$1, (self.getFullYear() + '').substr(4 - RegExp.$1.length));
    }
    for (const k in o) {
      if (new RegExp('(' + k + ')').test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)));
      }
    }
    return fmt;
  },

  /**
   * 数字前补0操作
   * @param num
   * @param length
   * @constructor
   */
  PrefixInteger: (num, length) => {
    return (Array(length).join('0') + num).slice(-length);
  },
  /**
   * 生成文件名
   * @param  {Object} file
   * @return {String}
   */
  randFilename: (file) => {
    return this.randString(this.rand(10, 100)) + Date.parse(new Date()) + '.' + this.getFilenameExt(file);
  },
  /**
   * 生成字符串组合
   * @param  {Number} size
   * @return {String}
   */
  randString: function (size) {
    let result = '';
    // let allChar = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

    size = size || 1

    while (size--) {
      result += allChar.charAt(this.rand(0, allChar.length - 1))
    }

    return result
  },
  /**
   * 返回指定范围内的一个整数
   * @param  {Number} min
   * @param  {Number} max
   * @return {String}
   */
  rand: function (min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min)
  },
  /**
   * 返回文件后缀
   * @param  {Object} file
   * @return {String}
   */
  getFilenameExt: function (fileName) {
    const types = fileName.split('.')
    return types[types.length - 1]
  },

  //创建多层文件夹 同步
  mkdirsSync: function (dirpath, mode) {
    if (!fs.existsSync(dirpath)) {
      var pathtmp;
      var pathList = dirpath.split(path.sep);
      pathList.forEach(function (dirname) {
        if (pathtmp) {
          pathtmp = path.join(pathtmp, dirname);
        } else {
          if (path.sep === '/') {
            pathtmp = '/' + dirname;
          } else
            pathtmp = dirname;
        }
        if (!fs.existsSync(pathtmp)) {
          if (!fs.mkdirSync(pathtmp, mode)) {
            return false;
          }
        }
      });
    }
    return true;
  },
  // 生成24位的随机码
  guid: function () {
    var d = new Date().getTime();
    var uuid = 'xxxxyxxxxyxxxxyxxxxyxxxx'.replace(/[x,y]/g, function (c) {
      var r = (d + Math.random() * 16) % 16 | 0;
      d = Math.floor(d / 16);
      var v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
    return uuid;
  }
};