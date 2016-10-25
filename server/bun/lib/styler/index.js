'use strict';
let eventEmitter = require('events');
let Path = require('path');
let fs = require('fs');

let sass = require('node-sass');
let less = require('less');

let mimeTypes = require('mime-types');

class STYLER extends eventEmitter {
  constructor(cacher) {
    super();

    let self = this;
    self.cacher = cacher;
  }

  setMap(key, value) {
    let self = this;
    return self.cacher.setMap.call(self.cacher, key, value);
  }

  getMap(key) {
    let self = this;
    return self.cacher.getMap.call(self.cacher, key);
  }

  compileStyleSheet(path) {
    let self = this;

    if (self.getMap(path)) return Promise.resolve(self.getMap(path));

    let extname = Path.extname(path);

    if ((extname == '.scss') || (extname == '.sass')) return self.compileSass(path);
    if (extname == '.less') return self.compileLess(path);
    if (extname == '.css') return Promise.resolve('ok');
    else return Promise.reject('file no allowed');
  }

  compileSass(path) {
    console.log('a')
    let self = this;
    return new Promise((resolve, reject) => {
      console.time(`第一次编译scss文件 ${path}`.rainbow);
      sass.render({
        file: path,
        outputStyle: 'compressed'
      }, function(err, result) {
        if (err) {
          console.timeEnd(`第一次编译scss文件 ${path}`.rainbow);
          console.error(`编译文件出错 ${path}`.red);
          reject(err);
        } else {
          console.timeEnd(`第一次编译scss文件 ${path}`.rainbow);
          let contentType = mimeTypes.contentType('.css');
          self.setMap(path, { 'content-type': contentType, content: result.css.toString('utf-8') });
          resolve(self.getMap(path));
        }
      });
    });
  }

  compileLess(path) {
    let self = this;
    return new Promise((resolve, reject) => {
      console.time(`第一次编译less文件 ${path}`.rainbow);
      less.render(fs.readFileSync(path).toString('UTF-8'), { compress: true }, function(err, result) {
        if (err) {
          console.timeEnd(`第一次编译less文件 ${path}`.rainbow);
          console.error(`第一次编译文件出错 ${path}`.red);
          reject(err);
        } else {
          console.timeEnd(`编译less文件 ${path}`.rainbow);
          let contentType = mimeTypes.contentType('.css');
          self.setMap(path, { 'content-type': contentType, content: result.css.toString('utf-8') });
          resolve(self.getMap(path));
        }
      });
    });
  }
}

module.exports = function(cacher) {
  return new STYLER(cacher);
};
