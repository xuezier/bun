'use strict';

let eventEmitter = require('events');
let fs = require('fs');
let Path = require('path');

let mimeTypes = require('mime-types');

class CACHER extends eventEmitter {
  constructor() {
    super();

    let self = this;

    self.cacheMap = new Map();
    self.prefix = 'public/';
  }

  setMap(key, value) {
    let self = this;
    return self.cacheMap.set(key, value);
  }

  getMap(key) {
    let self = this;
    return self.cacheMap.get(key);
  }

  getFileFromCache(path) {
    let self = this;
    let cache = self.cacheMap.get(path);
    return new Promise((resolve, reject) => {
      if (cache) {
        console.info(`从缓存中拉取文件: ${path}`.yellow);
        resolve(cache);
      } else {
        console.info(`从源拉取文件: ${path}`.blue);
        fs.readFile(path, { encoding: 'utf-8' }, function(err, file) {
          if (err) {
            console.error(`拉取文件失败: ${err}`.red);
            reject(err);
          } else {
            let contentType = mimeTypes.contentType(Path.extname(path));
            self.cacheMap.set(path, { 'content-type': contentType, content: file });
            resolve(self.cacheMap.get(path));
          }
        });
      }
    });
  }
}

module.exports = new CACHER();
