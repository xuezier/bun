'use strict';
let watch = require('watch');
let mimeTypes = require('mime-types');
let co = require('co');

let fs = require('fs');
let Path = require('path');
let eventEmitter = require('events');

class WATCHER extends eventEmitter {
  constructor(cacher, styler) {
    super();

    let self = this;

    self.cacher = cacher;
    self.styler = styler;
    self.init();
  }

  setMap(key, value) {
    let self = this;
    return self.cacher.setMap.call(self.cacher, key, value);
  }

  getMap(key) {
    let self = this;
    return self.cacher.getMap.call(self.cacher, key);
  }

  init() {
    let self = this;
    watch.createMonitor('public', function(monitor) {
      monitor.on('changed', function(f) {
        let key = f.replace(/\\/g, '/');
        let iscache = Map.prototype.has.call(self.cacher.cacheMap, key);
        if (iscache) {
          co(function*() {
            console.time(`检测到缓存发生变化，更新缓存文件 ${key}`.yellow);
            let extname = Path.extname(key);
            // if html file
            if (extname == '.html') {
              let contentType = mimeTypes.contentType('.html');
              self.setMap(key, { 'content-type': contentType, content: fs.readFileSync(key).toString('utf-8') });
            }
            // if style files
            else if (['.sass', '.scss'].indexOf(extname) > -1) {
              yield self.styler.compileSass.call(self.styler, key);
            } else if (extname == '.less') {
              yield self.styler.compileLess.call(self.styler, key);
            }

            console.timeEnd(`检测到缓存发生变化，更新缓存文件 ${key}`.yellow);
          }).catch(e => { console.log(e); throw e; });
        }
      });
    });
  }
};

module.exports = function(cacher, styler) {
  return new WATCHER(cacher, styler);
};
