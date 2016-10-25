'use strict';
require('./style');

console.time('server started at 3333');

let path = require('path');

let bun = require('./bun');
bun.options = {
  __runmodel__: 'dev',
  __protocol__: 'http',
  __basepage__: 'app.html',
  __baseroot__: path.join(`${__dirname}/../public`).replace(/\\/g, '/')
};

bun.listen(3333);
console.timeEnd('server started at 3333');
