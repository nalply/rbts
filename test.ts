import * as chai from 'chai'
import { debug } from 'debug'
import { nil, Node, ok } from './node'
import { Tree } from './tree'

const {
  equal, strictEqual, deepEqual,
  isFalse, isTrue, isUndefined, isNotNull,
  fail,
} = chai.assert

const isNilNode = (value: any) =>
  chai.assert(value === Node.nil, 'not a nil Node')
const isOkNode = (value: any) =>
  chai.assert(value.constructor !== Node || value !== Node.nil,
    'not an ok Node')

const dbg = debug('rbts:test')
function invariantViolated(tree: Tree<any, any>) {
  const result = tree._invariantViolated()
  if (result) debug('rbts:invariant-violated')('invariant violated: ' + result)
  return result
}


// ----------------------------------------------------------------------------
suite('empty tree')


test('RBT invariants', () => {
  isFalse(invariantViolated(new Tree()))
})


test('tree properties', () => {
  const rbt = new Tree

  strictEqual(rbt.size, 0)
  strictEqual(rbt.toString(), '[Tree size: 0]')
  isNilNode(rbt._root)
  strictEqual(rbt._root.key as any, Node.nil.key)
  strictEqual(rbt._root.value as any, Node.nil.value)
  isTrue(rbt._root.black)
  isNilNode(rbt._root.parent)
  isNilNode(rbt._root.left)
  isNilNode(rbt._root.right)

  isNilNode(rbt._firstNode())
  isNilNode(rbt._lastNode())
  isUndefined(rbt.get('whatever'))
  isNilNode(rbt._findNode('whatever'))
  isFalse(rbt.has('whatever'))

  for (const entry of rbt) {
    fail('empty tree should not deliver entries')
  }
  rbt.forEach(() => fail('empty tree should not invoke this'))

  rbt.clear()
  strictEqual(rbt.size, 0)
})


// ----------------------------------------------------------------------------
suite('one insertion')


test('RBT invariants', () => {
  isFalse(invariantViolated(new Tree({a: 'alpha'})))
})


test('tree properties', () => {
  const rbt = new Tree<string, string>({a: 'alpha'})

  isUndefined(rbt.get('whatever'))
  isNilNode(rbt._findNode('whatever'))
  isOkNode(rbt._findNode('a'))
  isFalse(rbt.has('whatever'))
  strictEqual(rbt.size, 1)
  strictEqual(rbt.toString(), '[Tree size: 1]')
  strictEqual(rbt._firstNode().key, 'a')
  strictEqual(rbt._firstNode().value, 'alpha')
  deepEqual(rbt._root.entry(), [ 'a', 'alpha' ])
  strictEqual(rbt._root, rbt._firstNode())
  strictEqual(rbt._firstNode(), rbt._lastNode())
  strictEqual(rbt.get('a'), 'alpha')
  strictEqual(rbt._findNode('a'), rbt._root)
  isTrue(rbt.has('a'))
  isNilNode(rbt._nextNode(rbt._root))
  isNilNode(rbt._root.parent)
  isNilNode(rbt._root.left)
  isNilNode(rbt._root.right)
  isTrue(rbt._root.black)
  isTrue(rbt._root._black)
  isFalse(rbt._root.red)
  isFalse(rbt._root._red)
  strictEqual(rbt._root.toString(), '[a:alpha]')
  strictEqual(rbt._root.toString(true), '(· a:alpha ·)')
  strictEqual(rbt._root._dump(), '(a)')

  let done = false
  for (const entry of rbt) {
    isFalse(done)
    strictEqual(entry[0], 'a')
    strictEqual(entry[1], 'alpha')
    done = true
  }
  done = false
  rbt.forEach((value, key, target) => {
    isFalse(done)
    strictEqual(key, 'a')
    strictEqual(value, 'alpha')
    strictEqual(target, rbt)
    done = true
  })

  rbt.clear()
  strictEqual(rbt.size, 0)
})


// ----------------------------------------------------------------------------
suite('one insertion, one deletion')


test('tree properties', () => {
  const rbt = new Tree<string, string>({a: 'alpha'})
  rbt._deleteNode(rbt._root)
  strictEqual(rbt.size, 0)
  isNilNode(rbt._root)
  isNilNode(rbt._firstNode())
  isNilNode(rbt._lastNode())
})


// ----------------------------------------------------------------------------
suite('iteration')


test('one insertion', () => {
  const rbt = new Tree<string, string>({a: 'alpha'})
  equal([...rbt.keys()].join(','), 'a')
  equal([...rbt.values()].join(','), 'alpha')

  const entries = rbt.entries()
  deepEqual(entries.next(), { done: false, value: [ 'a', 'alpha' ] })
  deepEqual(entries.next(), { done: true, value: undefined! })
//                                                      --^--
// https://github.com/Microsoft/TypeScript/issues/11375#issuecomment-413037242

  const nodes = rbt._nodes()
  const node = nodes.next().value
  equal(node.key, 'a')
  equal(node.value, 'alpha')

  isFalse(invariantViolated(rbt))
})


// ----------------------------------------------------------------------------
test('start-end', () => {
  const rbt = new Tree<string, number>({
    0: 0, 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8, 9: 9,
  })
  equal([...rbt.keys()].join(','), '0,1,2,3,4,5,6,7,8,9')
  equal([...rbt.values()].join(','), '0,1,2,3,4,5,6,7,8,9')

  function fromStart(start: Node<string, number>): string {
    return [...rbt._nodes(start)].map(node => node.key).join(',')
  }
  function fromStartToEnd(
    start: Node<string, number>, end: Node<string, number>,
  ): string {
    return [...rbt._nodes(start, end)].map(node => node.key).join(',')
  }

  const node5 = rbt._findNode('5')
  equal(fromStart(node5), '5,6,7,8,9')
  equal(fromStartToEnd(node5, node5), '')

  const node7 = rbt._findNode('7')
  equal(fromStart(node7), '7,8,9')
  equal(fromStartToEnd(node5, node7), '5,6')
  equal(fromStartToEnd(node7, node5), '')

  const node9 = rbt._findNode('9')
  equal(fromStart(node9), '9')
  equal(fromStartToEnd(node7, node9), '7,8')

  equal(fromStart(Node.nil), '0,1,2,3,4,5,6,7,8,9')
  equal(fromStartToEnd(Node.nil, Node.nil), '0,1,2,3,4,5,6,7,8,9')
  equal(fromStartToEnd(node7, Node.nil), '7,8,9')
  equal(fromStartToEnd(Node.nil, node7), '0,1,2,3,4,5,6')

  isFalse(invariantViolated(rbt))
})


// ----------------------------------------------------------------------------
suite('alphabet insertion')


test('tree properties', () => {
  const rbt = new Tree<string, string>()
  let letters = ''
  for (let i = 1; i <= 26; i++) {
    const code = i + 96, letter = String.fromCodePoint(code)
    const message = ` after set('${letter}', '${code}')`
    letters += letter
    rbt.set(letter, code.toString())

    strictEqual(rbt.size, i, 'size' + message)
    strictEqual(rbt._firstNode().key, 'a', 'first letter' + message)
    strictEqual(rbt._lastNode().key, letter, 'last letter' + message)
    isFalse(invariantViolated(rbt), 'invariant violated' + message)
    strictEqual([...rbt.keys()].join(''), letters, 'all letters' + message)
  }
})


test('RBT invariants', () => {
  const entries: Array<[string, string]> = []
  for (let c = 97; c <= 122; c++)
    entries.push([String.fromCodePoint(c), '' + c])

  const rbt = new Tree<string, string>(entries)
  isFalse(invariantViolated(rbt), 'invariant violated')
})


// ----------------------------------------------------------------------------
suite('deletion')


test('single', () => {
  const rbt = new Tree<string, string>({ a: 'alpha', b: 'beta', g: 'gamma' })
  strictEqual([...rbt.keys()].join(), 'a,b,g')
  strictEqual(rbt._findNode('b').value, 'beta')
  isTrue(rbt.delete('b'))
  isNilNode(rbt._findNode('b'))
  isFalse(rbt.delete('b'))
  isFalse(invariantViolated(rbt), 'invariant violated')
})


// ----------------------------------------------------------------------------
suite('concurrent modification')


test('tree properties', () => {
  const source: Record<string, number> = {}
; [...Array(5).keys()].map(value => source[value] = value)
  const rbt = new Tree<string, number>(source)
  equal([...rbt.keys()].join(','), '0,1,2,3,4')
  equal([...rbt.values()].join(','), '0,1,2,3,4')

  let result: IteratorResult<Node<string, number>>

  const nodes = rbt._nodes()
  result = nodes.next()
  isFalse(result.done)
  strictEqual(result.value.key, '0')

  rbt.set('0a', 42)
  result = nodes.next()
  isFalse(result.done)
  strictEqual(result.value.key, '0a')

  result = nodes.next()
  isFalse(result.done)
  strictEqual(result.value.key, '1')
})


// ----------------------------------------------------------------------------
suite('fuzzy')


// https://stackoverflow.com/a/47593316
const M = 1597334677
const N = 2 ** 32

// tslint:disable-next-line: no-bitwise
const lcg = (s: number) => (max = 1) => ((s = Math.imul(M, s)) >>> 0) / (N / max)

let rand: (max?: number) => number

// tslint:disable-next-line: no-bitwise
const irand = (max: number) => rand(max) | 0

function randString(n: number) {
  let s = ''
  for (let i = 0; i < n; i++) {
    s += String.fromCodePoint(97 + irand(26))
  }
  return s
}


test('insert RBT invariants', () => {
  rand = lcg(42)
  const rbt = new Tree<string, null>()
  for (let i = 1; i <= 100000; i++) {
    const key = randString(10)
    const message = ` after set('${key}', null)`

    rbt.set(key, null)
    strictEqual(rbt.size, i, 'size' + message)
    if (0 === i % 10000)
      isFalse(invariantViolated(rbt), 'invariant violated' + message)
  }
})


test('mixed insert-delete RBT invariants', () => {
  rand = lcg(42)
  let message
  const rbt = new Tree<number, null>(), n = 10000
  try {
    for (let i = 0; i < n / 2; i++)
      rbt.set(irand(n), null)

    isFalse(invariantViolated(rbt), 'invariant violated' + message)

    for (let i = 0; i < n; i++) {
      message = ` iteration ${i} size ${rbt.size}`
      if (rand() < 0.5) {
        const key = irand(n)
        rbt.set(key, null)
      }
      else if (rbt.size > 0) {
        const m: number = irand(rbt.size)
        let node = rbt._firstNode()
        for (let j = 0; j < m; j++) node = rbt._nextNode(node)
        rbt._deleteNode(node)
      }

      if (0 === i % 10)
        isFalse(invariantViolated(rbt), 'invariant violated' + message)
    }
  }
  catch (err) {
    err.message += message
    throw err
  }
})


test('batch insert and delete RBT invariants', () => {
  // tslint:disable-next-line: no-shadowed-variable
  const dbg = debug('rbts:test-batch-invariant')
  rand = lcg(42)
  const rbt = new Tree<string, null>()

  for (let i = 0; i < 10000; i++)
    rbt.set(randString(5), null)

  let count = 0
  for (let i = 0; i < 100; i++) {
    for (const key of rbt.keys())
      if (rand() < 0.02 && count < 100)
        rbt.delete(key), count++
    dbg('deleted', count, 'size', rbt.size)

    for (let j = 0; j < count; j++)
      rbt.set(randString(5), null)
    dbg('size', rbt.size)

    isFalse(invariantViolated(rbt))
  }
})
