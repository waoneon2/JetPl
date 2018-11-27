import { expect } from 'chai'

import * as T from '../src/tree'

const tree = T.Tree(1, [
  T.Tree(2, [
    T.Tree(3, [])
  ]),
  T.Tree(4, [])
]);

describe('Tree', () => {
  it('levels work correctly', () => {
    const levels = T.levels(tree);
    expect(levels).to.deep.equals([[1], [2, 4], [3]])
  });

  it('List all path', () => {
    const allPaths = T.listTree(tree);
    expect(allPaths).to.deep.equals([[1, 2, 3], [1, 4]])
  })
})