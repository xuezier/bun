'use strict';
let Path = require('path');

let cacher = require('./lib/cacher');
let styler = require('./lib/styler')(cacher);
let minifier = require('./lib/minifier')(cacher);

let express = require('express');
const bun = express();

bun.options = {};
// 计算开始时间
bun.use((req, res, next) => {
  console.info(`>>>>>>>>>>>>>>>>>>>> 拉取文件开始  ${req.url}`.info);
  console.time(`<<<<<<<<<<<<<<<<<<<< 拉取文件结束  ${req.url}`.info);
  next();
});

// fliter style file and compile to next middleware
bun.use((req, res, next) => {
  let source_url = req.url;
  let styleMap = ['.scss', '.sass', '.css', '.less'];
  if (styleMap.indexOf(Path.extname(source_url)) > -1) {
    styler.compileStyleSheet(`public${source_url}`).then(result => {
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

// bun.use(bun.filter_request);

bun.all('*', (req, res, next) => {
  let host = req.headers['host'];
  let referer = req.headers['referer'] || `${bun.options.protocol||'http'}://${host}/`;

  let protocol = referer.indexOf('https://') == 0 ? 'https' : 'http';
  let origin = protocol + host;

  req.headers['referer'] = referer;
  req.headers['protocol'] = protocol;
  req.headers['referer-host'] = host;
  req.headers['origin'] = origin;

  cacher.getFileFromCache(`public${req.url}`).then(page => {
    res.set('Content-Type', page['content-type']).end(page.content);
    next();
  }).catch(e => {
    _emit_404_page().then(nofoundpage => {
      res.set('Content-Type', 'text/html').end(nofoundpage);
      next();
    }).catch(e => { next(e); });
  });
});

function _emit_404_page() {
  return cacher.getFileFromCache('public/404.html');
}


// 计算结束时间
bun.use((req) => {
  console.timeEnd(`<<<<<<<<<<<<<<<<<<<< 拉取文件结束  ${req.url}`.info);
});
module.exports = bun;
