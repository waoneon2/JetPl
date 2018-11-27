'use strict';

exports.__esModule = true;
exports.Tree = Tree;
exports.unfoldTree = unfoldTree;
exports.unfoldForest = unfoldForest;
exports.levels = levels;
exports.listTree = listTree;

var _map = require('folktale/fantasy-land/map');

var map = _interopRequireWildcard(_map);

var _array = require('./array');

var A = _interopRequireWildcard(_array);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

// type Forest a = [Tree a]
// data Tree a = Tree a [Tree a]
function Tree(a, subforest) {
  if (!(this instanceof Tree)) {
    return new Tree(a, subforest);
  }
  this.label = a;
  this.subforest = subforest;
}

Tree.prototype['fantasy-land/map'] = function (f) {
  return new Tree(f(this.label), this.forest.map(function (item) {
    return map.curried(f, item);
  }));
};

// unfoldTree :: (b -> [a, [b]]) -> b -> Tree a
function unfoldTree(f, b) {
  var _f = f(b),
      a = _f[0],
      bs = _f[1];

  return Tree(a, unfoldForest(f, bs));
}

// unfoldForest :: (b -> [a, [b]]) -> [b] -> Forest a
function unfoldForest(f, bs) {
  return bs.map(function (x) {
    return unfoldTree(f, x);
  });
}

function levels(tree) {
  var ret = A.itakeWhile(function (x) {
    return x.length > 0;
  }, A.iterate(A.concatMap.bind(null, subForest), [tree]));
  return ret.map(function (t) {
    return t.map(function (x) {
      return x.label;
    });
  });
}

function listTree(tree) {
  function go(ret, tr) {
    if (tr.subforest.length === 0) return [ret.concat([tr.label])];
    return A.concatMap(go.bind(null, ret.concat([tr.label])), tr.subforest);
  }
  return go([], tree);
}

function subForest(x) {
  return x.subforest;
}