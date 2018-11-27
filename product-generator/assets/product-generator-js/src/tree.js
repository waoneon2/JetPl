import * as map from 'folktale/fantasy-land/map';
import * as A from './array'

// type Forest a = [Tree a]
// data Tree a = Tree a [Tree a]
export function Tree(a, subforest) {
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
}

// unfoldTree :: (b -> [a, [b]]) -> b -> Tree a
export function unfoldTree(f, b) {
  let [a, bs] = f(b);
  return Tree(a, unfoldForest(f, bs))
}

// unfoldForest :: (b -> [a, [b]]) -> [b] -> Forest a
export function unfoldForest (f, bs) {
  return bs.map(function (x) {
    return unfoldTree(f, x)
  })
}

export function levels(tree) {
  let ret = A.itakeWhile(x => x.length > 0, A.iterate(A.concatMap.bind(null, subForest), [tree]))
  return ret.map(t => t.map(x => x.label))
}

export function listTree(tree) {
  function go(ret, tr) {
    if (tr.subforest.length === 0) return [ret.concat([tr.label])];
    return A.concatMap(go.bind(null, ret.concat([tr.label])), tr.subforest);
  }
  return go([], tree)
}

function subForest(x) {
  return x.subforest;
}