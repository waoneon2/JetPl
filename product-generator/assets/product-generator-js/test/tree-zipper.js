import { expect } from 'chai'

import { Nothing, Just } from 'folktale/maybe'
import * as Z from '../src/tree-zipper'
import * as T from '../src/tree'

const tree = T.Tree(1, [
  T.Tree(2, [
    T.Tree(3, [])
  ]),
  T.Tree(4, [])
]);

describe('Tree Zipper', () => {
  it('child At', () => {
    let zi = Z.children(Z.fromTree(tree));
    let sp = Z.childAt(0, Z.fromTree(tree));
    expect(Just.hasInstance(sp)).to.equals(true);
  });

  it('children forest', () => {
    let zi = Z.fromTree(tree)
    let childs = Z.children(zi);

    console.log(Z.forest(zi))
  })
})