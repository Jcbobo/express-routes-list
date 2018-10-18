'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
const ALLOWED_EXPORT_TYPE = ['json', 'table'];

function exportEndpoint(app, exportType) {
  // reference to https://stackoverflow.com/questions/14934452/how-to-get-all-registered-routes-in-express

  exportType = exportType || 'json';

  function addRouter(routesL, routerToAD, baseUrl) {
    baseUrl = baseUrl || '';
    baseUrl = '/' + baseUrl;
    routesL[baseUrl] = routesL[baseUrl] || [];
    routesL[baseUrl].push(routerToAD);
  }

  let route,
      routesL = {};
  app._router.stack.forEach(function (middleware) {
    if (middleware.route) {
      // routes registered directly on the app
      routesL.push(middleware.route);
    } else if (middleware.name === 'router') {
      // router middleware
      let baseUrl = middleware.regexp.toString().replace(/(\/i)|[\\/^?()$=|]/g, '');
      middleware.handle.stack.forEach(function (handler) {
        route = handler.route;
        route && addRouter(routesL, { path: route.path, method: route.stack[0].method }, baseUrl);
      });
    }
  });
  let table;
  switch (exportType) {
    default:
      return routesL;
    case 'table':
      try {
        const Table = require('cli-table');
        table = new Table({ head: ['method', 'path'] });
      } catch (e) {
        table = [];
      }
      Object.keys(routesL).forEach(function (baseUrl) {
        routesL[baseUrl].forEach(function (router) {
          table.push([router.method, baseUrl + router.path]);
        });
      });
      return table;
  }
}
exports.default = exportEndpoint;
module.exports = exports.default;