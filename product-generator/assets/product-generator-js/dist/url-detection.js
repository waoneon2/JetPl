'use strict';

exports.__esModule = true;
exports.getProductConfiguration = getProductConfiguration;

var _maybe = require('folktale/maybe');

function getProductConfiguration(url) {
  if (url.includes('?')) {
    var _url$split = url.split('?'),
        path = _url$split[0],
        params = _url$split[1];

    var parts = params.split('&');
    var mconfig = parts.filter(function (item) {
      return item.substr(0, 7) === 'config=';
    });
    if (mconfig.length > 0) {
      var id = parseInt(mconfig[0].split('=')[1], 10);
      return isNaN(id) ? (0, _maybe.Nothing)() : (0, _maybe.Just)(id);
    }
    return (0, _maybe.Nothing)();
  }
  return (0, _maybe.Nothing)();
}