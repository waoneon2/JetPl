'use strict';

exports.__esModule = true;
exports.reduceStream = reduceStream;

var _stream = require('mithril/stream');

var _stream2 = _interopRequireDefault(_stream);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function reduceStream(f, acc, s) {
  var current = _stream2['default'].combine(function (s) {
    acc = f(current() || acc, s());
    return acc;
  }, [s]);
  return current;
}