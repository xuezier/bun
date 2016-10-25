(function() {
  var path;

  path = {
    'dispatch': function(passed_route) {
      var previous_route, matched_route;
      if (Path.routes.current !== passed_route) {
        Path.routes.previous = Path.routes.current;
        Path.routes.current = passed_route;
        matched_route = Path.match(passed_route, true);

        if (Path.routes.previous) {
          previous_route = Path.match(Path.routes.previous);
          if (previous_route !== null && previous_route.do_exit !== null) {
            previous_route.do_exit();
          }
        }

        if (matched_route !== null) {
          matched_route.run();
          return true;
        } else {
          if (Path.routes.rescue !== null) {
            Path.routes.rescue();
          }
        }
      }
    },

    routesMap: new Map(),

    on: function(hash, fn) {
      if (path.routesMap.get(hash)) {
        return path.routesMap.get(hash);
      } else {
        return path.routesMap.set(hash, fn);
      }
    }
  };

  window.pathjs = window.path = path;
}());
