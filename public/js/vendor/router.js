'use strict';
(function() {
  var Router = function() {
    var self = this;

    self.routesMap = new Map();
    self.__current_location__ = '';

    self.init();
  };

  Router.prototype = {
    init: function() {
      var self = this;
      window.addEventListener('load', self.route.bind(self), false);
      window.addEventListener('hashchange', self.route.bind(self), false);
    },
    // 触发路由
    route: function() {
      var __current_hash__ = location.hash;
      self.__current_location__ = location.href;
    },
    // 设置路由器
    initRouter: function(options) {

    },
    on: function(path, fn) {
      var self = this;

    }
  };

  window.router = new Router();

}());
