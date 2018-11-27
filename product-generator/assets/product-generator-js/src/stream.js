import stream from 'mithril/stream'

export function reduceStream(f, acc, s) {
  var current = stream.combine(function (s) {
    acc = f(current() || acc, s())
    return acc
  }, [s])
  return current
}