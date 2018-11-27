"use strict";

exports.__esModule = true;
exports.head = head;
exports.tail = tail;
exports.span = span;
exports.lines = lines;
exports.unlines = unlines;
exports.reverse = reverse;
exports.append = append;
exports.splitAt = splitAt;
exports.nub = nub;
exports.nubBy = nubBy;
exports.findIndex = findIndex;
exports.concatMap = concatMap;
exports.takeWhile = takeWhile;
exports.repeat = repeat;
exports.accumulate = accumulate;
exports.iterate = iterate;
exports.itakeWhile = itakeWhile;
exports.range = range;
exports.foldl = foldl;

var _maybe = require("folktale/maybe");

function _const(x) {
  return function () {
    return x;
  };
}

function _uncons(empty, f, xs) {
  return xs.length === 0 ? empty() : f(xs[0], xs.slice(1));
}

// Array a -> Maybe a
function head(xs) {
  return _uncons(_maybe.Nothing, function (x) {
    return (0, _maybe.Just)(x);
  }, xs);
}

function tail(xs) {
  return _uncons(_maybe.Nothing, function (_, tail) {
    return (0, _maybe.Just)(tail);
  }, xs);
}

function span(f, xs) {
  function go() {
    var i = 0;
    while (true) {
      if (i > xs.length) {
        return (0, _maybe.Nothing)();
      }
      if (f(xs[i])) {
        i++;
        continue;
      } else {
        return (0, _maybe.Just)(i);
      }
    }
  }
  return go().matchWith({
    Nothing: function Nothing() {
      return { init: xs, rest: [] };
    },
    Just: function Just(_ref) {
      var value = _ref.value;

      return value === 0 ? { init: [], rest: xs } : /** otherwise */{ init: xs.slice(0, value), rest: xs.slice(value, xs.length) };
    }
  });
}

function lines(xs) {}

function unlines(xs) {
  return concatMap(function (x) {
    return x + "\n";
  }, xs);
}

function reverse(xs) {
  return xs.slice().reverse();
}

function append(xs, ys) {
  if (xs.length === 0) return ys;
  if (ys.length === 0) return xs;
  return xs.concat(ys);
}

function splitAt(n, xs) {
  if (n <= 0) return [[], xs];
  var ls = xs.slice(0, n);
  var rs = xs.slice(n, xs.length);
  return [ls, rs];
}

function nub(xs) {
  return nubBy(function (x, y) {
    return x === y;
  }, xs);
}

function nubBy(f, xs) {
  return _uncons(_const([]), function (h, t) {
    return [h].concat(nubBy(f, t.filter(function (x) {
      return !f(h, x);
    })));
  }, xs);
}

function findIndex(f, xs) {
  for (var i = 0, len = xs.length; i < len; i++) {
    if (f(xs[i])) return (0, _maybe.Just)(i);
  }
  return (0, _maybe.Nothing)();
}

function concatMap(f, xs) {
  var result = [];
  for (var i = 0, l = xs.length; i < l; i++) {
    Array.prototype.push.apply(result, f(xs[i]));
  }
  return result;
}

function takeWhile(f, xs) {
  var idx = 0;
  var len = xs.length;
  while (idx < len && f(xs[idx])) {
    idx += 1;
  }
  return xs.slice(0, idx);
}

function* repeat(target) {
  var times = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

  if (!times) {
    while (true) {
      yield target;
    }
  } else {
    for (var i = 0; i < times; i++) {
      yield target;
    }
  }
}

function* accumulate(iterator) {
  var func = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function (a, b) {
    return a + b;
  };

  var item = iterator.next();
  if (item.done) return;
  var total = item.value;
  yield total;
  while (true) {
    item = iterator.next();
    if (item.done) break;
    total = func(total, item.value);
    yield total;
  }
}

// return iterator that yield (x, f(x), f(f(x)), ...)
function iterate(func, x) {
  return accumulate(repeat(x), function (fx, _) {
    return func(fx);
  });
}

function itakeWhile(f, iterator) {
  var results = [];
  while (true) {
    var _iterator$next = iterator.next(),
        done = _iterator$next.done,
        value = _iterator$next.value;

    if (done) break;
    var ret = f(value);
    if (!ret) break;
    results.push(value);
  }
  return results;
}

function range(lo, hi) {
  var result = [];
  for (var i = lo; i < hi; i++) {
    result.push(i);
  }
  return result;
}

function foldl(f, init, xs) {
  var acc = init;
  var len = xs.length;
  for (var i = 0; i < len; i++) {
    acc = f(acc, xs[i]);
  }
  return acc;
}