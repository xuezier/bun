'use strict';
let eventEmitter = require('events');

let UglifyJs = require('uglify-js');
let mimeTypes = require('mime-types');

class MINIFIER extends eventEmitter {
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

  minify(path) {
    let self = this;
    if (!self.getMap(path)) {
      console.time(`第一次拉取文件,正在压缩进缓存 ${path}`.rainbow);
      let result = UglifyJs.minify(path);
      let contentType = mimeTypes.contentType('.js');
      self.setMap(path, { 'content-type': contentType, content: result.code });
      console.timeEnd(`第一次拉取文件,正在压缩进缓存 ${path}`.rainbow);
    }
    return self.getMap(path);
  }
}

module.exports = function(cacher) {
  return new MINIFIER(cacher);
};
