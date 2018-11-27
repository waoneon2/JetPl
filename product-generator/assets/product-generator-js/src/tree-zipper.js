import { union } from 'folktale/adt/union';
import { Nothing, Just } from 'folktale/maybe'
import map from 'folktale/fantasy-land/map';

import { Tree } from './tree';
import * as A from './array';


export function Pair3(a, b, c) {
  if (!(this instanceof Pair3)) {
    return new Pair3(a, b, c)
  }
  this.fst = a;
  this.snd = b;
  this.tre = c;
}

// data TreeZiper a = TreeZiper (Pos a) (Forest a) (Forest a) [Pair3 (Forest a) a (Forest a)]
export function TreeZiper(ta, before, after, parents) {
  if (!(this instanceof TreeZiper)) {
    return new TreeZiper(ta, before, after, parents);
  }
  this.content = ta;
  this.before = before;
  this.after = after;
  this.parents = parents;
}

export const Pos = union('prgen:Pos', {
  Empty() {
  },

  Full(tree) {
    return { tree }
  }
})

export const { Empty, Full } = Pos;

// the sibling before this location
export function prev(loc) {
  return loc.content.matchWith({
    Empty: () => map(prevTree(loc), x => map(x, prevSpace)),
    Full: ()  => prevTree(prevSpace(loc))
  })
}

// The sibling after this location.
export function next(loc) {
  return loc.content.matchWith({
    Empty: () => map(nextTree(loc), x => map(x, nextSpace)),
    Full: ()  => nextTree(nextSpace(loc))
  })
}

// All trees at this location
export function forest(loc) {
  return loc.content.matchWith({
    Empty: () => loc.before.reduce((a, b) => [b].concat(a), loc.after),
    Full: (ta) => loc.before.reduce((a, b) => [b].concat(a), [ta.tree].concat(loc.after))
  })
}

// The parent of the given location
// parent :: TreeZiper a -> Maybe (TreeZiper a)
export function parent(loc) {
  if (loc.parents.length === 0) {
    return Nothing()
  }
  const item = loc.parents[0];
  return Just(
    TreeZiper(
      Full(Tree(item.snd, forest(loc))),
      item.fst,
      item.tre,
      loc.parents.slice(1)
    )
  )
}

export function root(loc) {
  if (Empty.hasInstance(loc.content)) {
    throw new Error('root should be called when content is full')
  }

  return parent(loc).matchWith({
    Nothing: ()       => loc,
    Just: ({ value }) => root(value)
  })
}

// The space immediately before this location.
export function prevSpace(loc) {
  if (Empty.hasInstance(loc.content)) {
    throw new Error('prevSpace should be called when content is full')
  }

  return TreeZiper(Empty(), loc.before, [loc.content.tree].concat(loc.after), loc.parents)
}

// prevTree :: TreePos Empty a -> Maybe (TreePos Full a)
export function prevTree(loc) {
  if (Full.hasInstance(loc.content)) {
    throw new Error('prevTree should be called when content is empty')
  }

  if (loc.before.length === 0) {
    return Nothing()
  }
  const item = loc.before[0]
  return Just(TreeZiper(Full(item), loc.before.slice(1), loc.after, loc.parents))
}

// The space immediately after this location.
export function nextSpace(loc) {
  if (Empty.hasInstance(loc.content)) {
    throw new Error('nextSpace should be called when content is full')
  }

  return TreeZiper(Empty(), loc.before, [loc.content.tree].concat(loc.after), loc.parents)
}

export function nextTree(loc) {
  if (Full.hasInstance(loc.content)) {
    throw new Error('nextTree should be called when content is empty')
  }

  if (loc.after.length === 0) {
    return Nothing();
  }

  return Just(TreeZiper(Full(loc.after[0]), loc.before, loc.after.slice(1), loc.parents))
}

export function children(loc) {
  if (Empty.hasInstance(loc.content)) {
    throw new Error('children should be called when content is full')
  }

  return TreeZiper(Empty(), [], loc.content.tree.subforest, [Pair3(loc.before, loc.content.tree.label, loc.after)].concat(loc.parents))
}

export function first(loc) {
  if (Full.hasInstance(loc.content)) {
    throw new Error('first should be called when content is empty');
  }

  return TreeZiper(Empty(), [], A.append(A.reverse(loc.before), loc.after), loc.parents);
}

// The last space in the current forest.
export function last(loc) {
  if (Full.hasInstance(loc.content)) {
    throw new Error('last should be called when content is empty');
  }

  return TreeZiper(Empty(), A.append(A.reverse(loc.after), loc.before), [], loc.parents)
}

export function spaceAt(n, loc) {
  if (Full.hasInstance(loc.content)) {
    throw new Error('spaceAt should be called when content is empty');
  }

  let [as, bs] = A.splitAt(n, forest(loc))

  return TreeZiper(Empty(), A.reverse(as), bs, loc.parents)
}

export function firstChild(loc) {
  if (Empty.hasInstance(loc.content)) {
    throw new Error('firstChild should be called when content is Full');
  }

  return nextTree(children(loc));
}

export function lastChild(loc) {
  if (Empty.hasInstance(loc.content)) {
    throw new Error('firstChild should be called when content is Full');
  }

  return prevTree(last(children(loc)))
}

export function childAt(n, loc) {
  if (Empty.hasInstance(loc.content)) {
    throw new Error('childAt should be called when content is Full');
  }

  if (n < 0) return Nothing();

  return nextTree(spaceAt(n, children(loc)));
}

export function fromTree(tree) {
  return TreeZiper(Full(tree), [], [], [])
}

export function toTree(loc) {
  var tree = root(loc);
  return tree.content.tree
}