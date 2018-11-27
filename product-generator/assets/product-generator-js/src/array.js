import { Nothing, Just } from 'folktale/maybe'

function _const(x) {
  return () => x
}

function _uncons(empty, f, xs) {
  return xs.length === 0 ? empty() : f(xs[0], xs.slice(1));
}

// Array a -> Maybe a
export function head(xs) {
  return _uncons(Nothing, x => Just(x), xs);
}

export function tail(xs) {
  return _uncons(Nothing, (_, tail) => Just(tail), xs);
}

export function span(f, xs) {
  function go() {
    var i = 0;
    while (true) {
      if (i > xs.length) {
        return Nothing();
      }
      if (f(xs[i])) {
        i++;
        continue;
      } else {
        return Just(i)
      }
    }
  }
  return go().matchWith({
    Nothing: () => ({ init: xs, rest: [] }),
    Just: ({ value }) => {
      return value === 0    ? { init: [], rest: xs }
      : /** otherwise */    { init: xs.slice(0, value), rest: xs.slice(value, xs.length) }
    }
  })
}

export function lines(xs) {

}

export function unlines(xs) {
  return concatMap(x => x + "\n", xs)
}

export function reverse(xs) {
  return xs.slice().reverse();
}

export function append(xs, ys) {
  if (xs.length === 0) return ys;
  if (ys.length === 0) return xs;
  return xs.concat(ys)
}

export function splitAt(n, xs) {
  if (n <= 0) return [[], xs];
  const ls = xs.slice(0, n)
  const rs = xs.slice(n, xs.length)
  return [ls, rs]
}

export function nub(xs) {
  return nubBy((x, y) => x === y, xs)
}

export function nubBy(f, xs) {
  return _uncons(_const([]), (h, t) => [h].concat(nubBy(f, t.filter(x => !f(h, x)))), xs)
}

export function findIndex(f, xs) {
  for (let i = 0, len = xs.length; i < len; i++) {
    if (f(xs[i])) return Just(i);
  }
  return Nothing();
}

export function concatMap(f, xs) {
  var result = [];
  for (var i = 0, l = xs.length; i < l; i++) {
    Array.prototype.push.apply(result, f(xs[i]));
  }
  return result;
}

export function takeWhile(f, xs) {
  let idx = 0;
  const len = xs.length;
  while (idx < len && f(xs[idx])) {
    idx += 1;
  }
  return xs.slice(0, idx)
}

export function* repeat(target, times = null) {
  if (!times) {
    while (true) {
      yield target
    }
  } else {
    for (let i = 0; i < times; i++) {
      yield target
    }
  }
}

export function* accumulate(iterator, func = (a, b) => a + b) {
  let item = iterator.next()
  if (item.done) return
  let total = item.value
  yield total
  while (true) {
    item = iterator.next()
    if (item.done) break
    total = func(total, item.value)
    yield total
  }
}

// return iterator that yield (x, f(x), f(f(x)), ...)
export function iterate(func, x) {
  return accumulate(repeat(x), (fx, _) => func(fx))
}

export function itakeWhile(f, iterator) {
  let results = [];
  while (true) {
    let {done, value} = iterator.next();
    if (done) break;
    let ret = f(value);
    if (!ret) break;
    results.push(value)
  }
  return results
}

export function range(lo, hi) {
  var result = []
  for (var i = lo; i < hi; i++) {
    result.push(i);
  }
  return result;
}

export function foldl(f, init, xs) {
  let acc = init;
  let len = xs.length;
  for (let i = 0; i < len; i++) {
    acc = f(acc, xs[i]);
  }
  return acc;
}