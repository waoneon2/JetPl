'use strict';

exports.__esModule = true;
exports.Full = exports.Empty = exports.Pos = undefined;
exports.Pair3 = Pair3;
exports.TreeZiper = TreeZiper;
exports.prev = prev;
exports.next = next;
exports.forest = forest;
exports.parent = parent;
exports.root = root;
exports.prevSpace = prevSpace;
exports.prevTree = prevTree;
exports.nextSpace = nextSpace;
exports.nextTree = nextTree;
exports.children = children;
exports.first = first;
exports.last = last;
exports.spaceAt = spaceAt;
exports.firstChild = firstChild;
exports.lastChild = lastChild;
exports.childAt = childAt;
exports.fromTree = fromTree;
exports.toTree = toTree;

var _union = require('folktale/adt/union');

var _maybe = require('folktale/maybe');

var _map = require('folktale/fantasy-land/map');

var _map2 = _interopRequireDefault(_map);

var _tree = require('./tree');

var _array = require('./array');

var A = _interopRequireWildcard(_array);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function Pair3(a, b, c) {
  if (!(this instanceof Pair3)) {
    return new Pair3(a, b, c);
  }
  this.fst = a;
  this.snd = b;
  this.tre = c;
}

// data TreeZiper a = TreeZiper (Pos a) (Forest a) (Forest a) [Pair3 (Forest a) a (Forest a)]
function TreeZiper(ta, before, after, parents) {
  if (!(this instanceof TreeZiper)) {
    return new TreeZiper(ta, before, after, parents);
  }
  this.content = ta;
  this.before = before;
  this.after = after;
  this.parents = parents;
}

var Pos = exports.Pos = (0, _union.union)('prgen:Pos', {
  Empty: function Empty() {},
  Full: function Full(tree) {
    return { tree: tree };
  }
});

var Empty = Pos.Empty,
    Full = Pos.Full;

// the sibling before this location

exports.Empty = Empty;
exports.Full = Full;
function prev(loc) {
  return loc.content.matchWith({
    Empty: function Empty() {
      return (0, _map2['default'])(prevTree(loc), function (x) {
        return (0, _map2['default'])(x, prevSpace);
      });
    },
    Full: function Full() {
      return prevTree(prevSpace(loc));
    }
  });
}

// The sibling after this location.
function next(loc) {
  return loc.content.matchWith({
    Empty: function Empty() {
      return (0, _map2['default'])(nextTree(loc), function (x) {
        return (0, _map2['default'])(x, nextSpace);
      });
    },
    Full: function Full() {
      return nextTree(nextSpace(loc));
    }
  });
}

// All trees at this location
function forest(loc) {
  return loc.content.matchWith({
    Empty: function Empty() {
      return loc.before.reduce(function (a, b) {
        return [b].concat(a);
      }, loc.after);
    },
    Full: function Full(ta) {
      return loc.before.reduce(function (a, b) {
        return [b].concat(a);
      }, [ta.tree].concat(loc.after));
    }
  });
}

// The parent of the given location
// parent :: TreeZiper a -> Maybe (TreeZiper a)
function parent(loc) {
  if (loc.parents.length === 0) {
    return (0, _maybe.Nothing)();
  }
  var item = loc.parents[0];
  return (0, _maybe.Just)(TreeZiper(Full((0, _tree.Tree)(item.snd, forest(loc))), item.fst, item.tre, loc.parents.slice(1)));
}

function root(loc) {
  if (Empty.hasInstance(loc.content)) {
    throw new Error('root should be called when content is full');
  }

  return parent(loc).matchWith({
    Nothing: function Nothing() {
      return loc;
    },
    Just: function Just(_ref) {
      var value = _ref.value;
      return root(value);
    }
  });
}

// The space immediately before this location.
function prevSpace(loc) {
  if (Empty.hasInstance(loc.content)) {
    throw new Error('prevSpace should be called when content is full');
  }

  return TreeZiper(Empty(), loc.before, [loc.content.tree].concat(loc.after), loc.parents);
}

// prevTree :: TreePos Empty a -> Maybe (TreePos Full a)
function prevTree(loc) {
  if (Full.hasInstance(loc.content)) {
    throw new Error('prevTree should be called when content is empty');
  }

  if (loc.before.length === 0) {
    return (0, _maybe.Nothing)();
  }
  var item = loc.before[0];
  return (0, _maybe.Just)(TreeZiper(Full(item), loc.before.slice(1), loc.after, loc.parents));
}

// The space immediately after this location.
function nextSpace(loc) {
  if (Empty.hasInstance(loc.content)) {
    throw new Error('nextSpace should be called when content is full');
  }

  return TreeZiper(Empty(), loc.before, [loc.content.tree].concat(loc.after), loc.parents);
}

function nextTree(loc) {
  if (Full.hasInstance(loc.content)) {
    throw new Error('nextTree should be called when content is empty');
  }

  if (loc.after.length === 0) {
    return (0, _maybe.Nothing)();
  }

  return (0, _maybe.Just)(TreeZiper(Full(loc.after[0]), loc.before, loc.after.slice(1), loc.parents));
}

function children(loc) {
  if (Empty.hasInstance(loc.content)) {
    throw new Error('children should be called when content is full');
  }

  return TreeZiper(Empty(), [], loc.content.tree.subforest, [Pair3(loc.before, loc.content.tree.label, loc.after)].concat(loc.parents));
}

function first(loc) {
  if (Full.hasInstance(loc.content)) {
    throw new Error('first should be called when content is empty');
  }

  return TreeZiper(Empty(), [], A.append(A.reverse(loc.before), loc.after), loc.parents);
}

// The last space in the current forest.
function last(loc) {
  if (Full.hasInstance(loc.content)) {
    throw new Error('last should be called when content is empty');
  }

  return TreeZiper(Empty(), A.append(A.reverse(loc.after), loc.before), [], loc.parents);
}

function spaceAt(n, loc) {
  if (Full.hasInstance(loc.content)) {
    throw new Error('spaceAt should be called when content is empty');
  }

  var _A$splitAt = A.splitAt(n, forest(loc)),
      as = _A$splitAt[0],
      bs = _A$splitAt[1];

  return TreeZiper(Empty(), A.reverse(as), bs, loc.parents);
}

function firstChild(loc) {
  if (Empty.hasInstance(loc.content)) {
    throw new Error('firstChild should be called when content is Full');
  }

  return nextTree(children(loc));
}

function lastChild(loc) {
  if (Empty.hasInstance(loc.content)) {
    throw new Error('firstChild should be called when content is Full');
  }

  return prevTree(last(children(loc)));
}

function childAt(n, loc) {
  if (Empty.hasInstance(loc.content)) {
    throw new Error('childAt should be called when content is Full');
  }

  if (n < 0) return (0, _maybe.Nothing)();

  return nextTree(spaceAt(n, children(loc)));
}

function fromTree(tree) {
  return TreeZiper(Full(tree), [], [], []);
}

function toTree(loc) {
  var tree = root(loc);
  return tree.content.tree;
}