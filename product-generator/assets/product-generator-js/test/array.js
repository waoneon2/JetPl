import { expect } from 'chai'
import { property } from 'jsverify'
import * as A from '../src/array'

describe('Array', () => {
  it('span split', () => {
    let { init, rest } = A.span(x => x % 2 === 1, [1, 3, 2, 4, 5])
    console.log(init, rest)
  })
})