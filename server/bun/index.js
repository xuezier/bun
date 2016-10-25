'use strict';
let Path = require('path');
let fs = require('fs');

let cacher = require('./lib/cacher');
let styler = require('./lib/styler')(cacher);
let minifier = require('./lib/minifier')(cacher);
require('./lib/watcher')(cacher, styler);

let co = require('co');

let express = require('express');
const bun = express();

bun.options = {};
// 计算开始时间
bun.use((req, res, next) => {
  console.info(`>>>>>>>>>>>>>>>>>>>> 拉取文件开始  ${req.url}`.info);
  console.time(`<<<<<<<<<<<<<<<<<<<< 拉取文件结束  ${req.url}`.info);
  next();
});

// check if file is exists
bun.use((req, res, next) => {
  let source_url = req.url;

  if (!source_url.indexOf('.html') > 0) return next();

  let flag = fs.existsSync(`public${source_url}`);
  if (flag) next();
  else {
    co(function*() {
      let nofoundpage = yield _emit_404_page();
      res.set('Content-Type', 'text/html').end(nofoundpage.content);
    }).catch(e => { next(e); });
  }
});

// fliter style file and compile to next middleware
bun.use((req, res, next) => {
  let source_url = req.url;
  let styleMap = ['.scss', '.sass', '.css', '.less'];
  if (styleMap.indexOf(Path.extname(source_url)) > -1) {
    co(function*() {
      yield styler.compileStyleSheet(`public${source_url}`);
      next();
    }).catch(e => { next(e); });
  } else next();
});

// filter javascript file and minify to next middleware
bun.use((req, res, next) => {
  let source_url = req.url;
  if (Path.extname(source_url) == '.js') minifier.minify(`public${source_url}`);
  next();
});

bun.get('/', (req, res, next) => {
  console.log('heiheihei');
  res.sendFile(`${bun.options.__baseroot__}/${bun.options.__basepage__}`);
  next();
});

// file sender
bun.all('*', (req, res, next) => {
  let host = req.headers['host'];
  let referer = req.headers['referer'] || `${bun.options.protocol||'http'}://${host}/`;

  let protocol = referer.indexOf('https://') == 0 ? 'https' : 'http';
  let origin = protocol + host;

  req.headers['referer'] = referer;
  req.headers['protocol'] = protocol;
  req.headers['referer-host'] = host;
  req.headers['origin'] = origin;
  co(function*() {
    let page = yield cacher.getFileFromCache(`public${req.url}`);
    res.set('Content-Type', page['content-type']).end(page.content);
    next();
  }).catch(e => { next(e); });
});

function _emit_404_page() {
  return cacher.getFileFromCache('public/404.html');
}


// 计算结束时间
bun.use((req) => {
  console.timeEnd(`<<<<<<<<<<<<<<<<<<<< 拉取文件结束  ${req.url}`.info);
});
module.exports = bun;
