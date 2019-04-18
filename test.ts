import * as chai from 'chai'
import { Node, Tree } from './redblack'

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


suite('empty tree')


test('RBT invariants', () => {
  isFalse(new Tree()._invariantViolated())
})


test('tree properties', () => {
  const rbt = new Tree

  strictEqual(rbt.size, 0)
  isNilNode(rbt.root)
  strictEqual(rbt.root.key as any, Node._nilKey)
  strictEqual(rbt.root.value as any, Node._nilValue)
  isTrue(rbt.root.black)
  isNilNode(rbt.root.parent)
  isNilNode(rbt.root.left)
  isNilNode(rbt.root.right)

  isNilNode(rbt.firstNode())
  isNilNode(rbt.lastNode())
  isUndefined(rbt.find('whatever'))
  isNilNode(rbt.findNode('whatever'))
  isFalse(rbt.has('whatever'))
})


suite('one insertion')


test('RBT invariants', () => {
  isFalse(new Tree({a: 'alpha'})._invariantViolated())
})


test('tree properties', () => {
  const rbt = new Tree<string, string>({a: 'alpha'})

  isUndefined(rbt.find('whatever'))
  isNilNode(rbt.findNode('whatever'))
  isOkNode(rbt.findNode('a'))
  isFalse(rbt.has('whatever'))
  strictEqual(rbt.size, 1)
  strictEqual(rbt.firstNode().key, 'a')
  strictEqual(rbt.firstNode().value, 'alpha')
  deepEqual(rbt.root.entry(), [ 'a', 'alpha' ])
  strictEqual(rbt.root, rbt.firstNode())
  strictEqual(rbt.firstNode(), rbt.lastNode())
  strictEqual(rbt.find('a'), 'alpha')
  strictEqual(rbt.findNode('a'), rbt.root)
  isTrue(rbt.has('a'))
  isNilNode(rbt.nextNode(rbt.root))
  isNilNode(rbt.prevNode(rbt.root))
  isNilNode(rbt.root.parent)
  isNilNode(rbt.root.left)
  isNilNode(rbt.root.right)
  isTrue(rbt.root.black)
})


suite('one insertion, one deletion')


test('tree properties', () => {
  const rbt = new Tree<string, string>({a: 'alpha'})
  rbt.deleteNode(rbt.root)
  strictEqual(rbt.size, 0)
  isNilNode(rbt.root)
  isNilNode(rbt.firstNode())
  isNilNode(rbt.lastNode())
})


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

  const nodes = rbt.nodes()
  const node = nodes.next().value
  equal(node.key, 'a')
  equal(node.value, 'alpha')

  isFalse(rbt._invariantViolated())
})


test('start-end', () => {
  const rbt = new Tree<string, number>({
    0: 0, 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8, 9: 9,
  })
  equal([...rbt.keys()].join(','), '0,1,2,3,4,5,6,7,8,9')
  equal([...rbt.values()].join(','), '0,1,2,3,4,5,6,7,8,9')

  function fromStart(start: Node<string, number>): string {
    return [...rbt.nodes(start)].map(node => node.key).join(',')
  }
  function fromStartToEnd(
    start: Node<string, number>, end: Node<string, number>,
  ): string {
    return [...rbt.nodes(start, end)].map(node => node.key).join(',')
  }

  const node5 = rbt.findNode('5')
  equal(fromStart(node5), '5,6,7,8,9')
  equal(fromStartToEnd(node5, node5), '')

  const node7 = rbt.findNode('7')
  equal(fromStart(node7), '7,8,9')
  equal(fromStartToEnd(node5, node7), '5,6')
  equal(fromStartToEnd(node7, node5), '')

  const node9 = rbt.findNode('9')
  equal(fromStart(node9), '9')
  equal(fromStartToEnd(node7, node9), '7,8')

  const nil = Node.nil
  equal(fromStart(nil), '0,1,2,3,4,5,6,7,8,9')
  equal(fromStartToEnd(nil, nil), '0,1,2,3,4,5,6,7,8,9')
  equal(fromStartToEnd(node7, nil), '7,8,9')
  equal(fromStartToEnd(nil, node7), '0,1,2,3,4,5,6')

  isFalse(rbt._invariantViolated())
})


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
    strictEqual(rbt.firstNode().key, 'a', 'first letter' + message)
    strictEqual(rbt.lastNode().key, letter, 'last letter' + message)
    isFalse(rbt._invariantViolated(), 'invariant violated' + message)
    strictEqual([...rbt.keys()].join(''), letters, 'all letters' + message)
  }
})


test('RBT invariants', () => {
  const entries: Array<[string, string]> = []
  for (let c = 97; c <= 122; c++)
    entries.push([String.fromCodePoint(c), '' + c])

  const rbt = new Tree<string, string>(entries)
  const bad = rbt._invariantViolated()
  isFalse(rbt._invariantViolated(), 'invariant violated')
})


suite('deletion')


test('single', () => {
  const rbt = new Tree<string, string>({ a: 'alpha', b: 'beta', g: 'gamma' })
  strictEqual([...rbt.keys()].join(), 'a,b,g')
  const node = rbt.findNode('b')
})


suite('concurrent modification')


test('tree properties', () => {
  const source: Record<string, number> = {}
; [...Array(5).keys()].map(value => source[value] = value)
  const rbt = new Tree<string, number>(source)
  equal([...rbt.keys()].join(','), '0,1,2,3,4')
  equal([...rbt.values()].join(','), '0,1,2,3,4')

  let result

  const nodes = rbt.nodes()
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


suite('fuzzy')


// https://stackoverflow.com/a/47593316
// tslint:disable-next-line: no-bitwise
const lcg = (s: number) => () => ((s = Math.imul(1597334677, s)) >>> 0)
const rand = lcg(42) // constant seed for repeatability
function randString() {
  let s = ''
  for (let i = 0; i < 20; i++) {
    // tslint:disable-next-line: no-bitwise
    s += String.fromCodePoint(97 + (rand() >>> 8) % 26)
  }
  return s
}


test('insert RBT invariants', () => {
  const rbt = new Tree<string, null>()
  for (let i = 1; i <= 100000; i++) {
    const key = randString()
    const message = ` after set('${key}', null)`

    rbt.set(key, null)
    strictEqual(rbt.size, i, 'size' + message)
    if (0 === i % 10000)
      isFalse(rbt._invariantViolated(), 'invariant violated' + message)
  }
}).timeout(20000)


test('insert and delete RBT invariants', () => {
  const rbt = new Tree<string, null>()
  let size = 0
  for (let i = 1; i <= 1000; i++) {
    const key = randString()
    const message = ` after set('${key}', null)`

    rbt.set(key, null)
    size++
    strictEqual(rbt.size, size, 'size' + message)

    if (rand() < 0.1 * 2 ** 32 ) {
      // count is a number from 1 to i / 3, higher numbers rarer
      const count = Math.ceil(Math.sqrt(rand() % (i * i / 9)))
      let node = rbt.findNode(key)
      for (let j = 1; j < count && node !== Node.nil; j++) {
        const next = rbt.prevNode(node)
        rbt.deleteNode(node)
        node = next
        size--
      }
    }

    if (0 === i % 1)
      isFalse(rbt._invariantViolated(), 'invariant violated' + message)
  }
}).timeout(20000)
