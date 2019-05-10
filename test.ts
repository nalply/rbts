import * as chai from 'chai'
import { debug } from 'debug'
import { Node } from './node'
import { LessOp, Tree } from './tree'

const {
  equal, strictEqual, deepEqual, throws,
  isFalse, isTrue, isUndefined, isNaN, isOk,
  fail,
} = chai.assert


 // return false or description of violated invariant, not efficient
function invariantViolated(tree: Tree<any, any>): string | false {
  const walked = new Set<Node<any, any>>()
  let maxDepth = 0, minDepth = Infinity

  // in order traversal
  let node = tree.minNode
  while (node.ok) {
    const d = depth(node) // see comment below at walkup!
    if (node._left.nil || node._right.nil) {
      if (d > maxDepth) maxDepth = d
      if (d < minDepth) minDepth = d
    }

    const p = node._parent, r = node._right, l = node._left
    const key = node.key.toString().substr(0, 20)
    const s = ` (at key ${key}, depth ${d})`
    const notChild = 'not parent\'s child' + s
    if (d < 0 || walked.has(node)) return `cycle` + s
    if (node._red) {
      if (l._red) return 'left of red not black' + s
      if (r._red) return 'right of red not black' + s
    }
    if (p.ok && node !== p._left && node !== p._right) return notChild
    if (r.ok && node !== r._parent) return 'not left\'s child' + s
    if (l.ok && node !== l._parent) return 'not right\'s child' + s
    if (r.ok && tree._less(r.key, node)) return 'right is greater' + s
    if (l.ok && tree._less(node.key, l)) return 'left is smaller' + s

    // Check whether the number of black nodes in all paths is same
    let blackDepth = null
    if (node._left.nil && node._right.nil) {
      let walkup = node, blackDepth2 = +node._black
      // we already walked up in depth(node), no need to check for cycles
      while ((walkup = walkup._parent).ok) blackDepth2 += +node._black

      const bad = `black depth ${blackDepth2}, expected ${blackDepth}` + s
      if (null === blackDepth) blackDepth = blackDepth2
      else if (blackDepth !== blackDepth2) return bad
    }

    walked.add(node)
    node = tree._nextNode(node)
  }

  if (tree.size > 3) {
    const sqrtSize = Math.sqrt(tree.size)
    const diffDepth = maxDepth - minDepth
    const message = `unbalanced tree of size ${tree.size}: `
      + `diffDepth ${diffDepth} > sqrtSize ${sqrtSize.toPrecision(4)}`

    if (diffDepth > +sqrtSize) return message
  }

  // no violated invariants have been found
  return false
}


function dump(
  node: Node<any, any>, check: Set<Node<any, any>> = new Set,
): string {
  if (node.nil) return '·'

  const key = node.key.toString().substr(0, 10)
  const o = node._black ? '(' : '<'
  const c = node._black ? ')' : '>'
  if (check.has(node)) return '@' + o + node.key + c
  check.add(node)
  const left = node._left.nil ? '' : dump(node._left, check)
  const right = node._right.nil ? '' : dump(node._right, check)

  return o + left + key + right + c
}


// Node depth (0 if nil and Infinity if there was a cycle), not efficient
function depth(node: Node<any, any>): number {
  const walked = new Set<Node<any, any>>()
  let d = 0
  while (node.ok) {
    if (walked.has(node)) return Infinity // cycle detected
    walked.add(node)
    d++
    node = node._parent
  }
  return d
}


function fromObject<V>(obj: Record<string, V>): Tree<string, V> {
  return fromEntries(Object.entries(obj))
}


function fromEntries<K, V>(entries: Array<[K, V]>): Tree<K, V> {
  return new Tree(entries.values())
}

function fromEntriesLess<K, V>(entries: Array<[K, V]>, less: LessOp<K>): Tree<K, V> {
  return new Tree(entries.values(), less)
}


// ----------------------------------------------------------------------------
suite('empty tree')

test('nil node', () => {
  const nil = Node.nilNode, laxNil: any = nil
  strictEqual(nil.key as any, Node.nilNode.key)
  strictEqual(nil.value as any, Node.nilNode.value)
  strictEqual(nil._parent, nil)
  strictEqual(nil._left, nil)
  strictEqual(nil._right, nil)
  isTrue(nil._black)
  isFalse(nil._red)
  isTrue(nil.nil)
  isFalse(nil.ok)

  deepEqual(nil.entry(), [ Node.nilNode.key, Node.nilNode.value ])
  strictEqual(nil.toString(), '·')
  strictEqual(nil._details(), '(·)')

  throws(() => laxNil.key = 'key')  // Node.key is readonly
  throws(() => laxNil.value = 'value')
  throws(() => laxNil._parent = nil)
  throws(() => laxNil._left = nil)
  throws(() => laxNil._right = nil)

  nil._black = false
  isTrue(nil._black)
  isFalse(nil._red)
  nil._red = false
  isTrue(nil._black)
  isFalse(nil._red)
})


test('RBT invariants', () => {
  isFalse(invariantViolated(new Tree()))
})


test('tree properties', () => {
  const rbt = new Tree

  strictEqual(rbt.size, 0)
  strictEqual(rbt.toString(), '[Tree size:0]')
  isTrue(rbt._root.nil)
  isTrue(rbt.minNode.nil)
  isTrue(rbt.maxNode.nil)
  isUndefined(rbt.get('whatever'))
  isTrue(rbt.getNode('whatever').nil)
  isFalse(rbt.has('whatever'))
  isFalse(rbt.delete('whatever'))

  rbt.forEach(() => fail('empty tree should not invoke f in forEach(f)'))
  for (const entry of rbt)
    fail('empty tree should not iterate over entries')
  for (const entry of rbt.entries())
    fail('empty tree should not iterate over entries')
  for (const key of rbt.keys())
    fail('empty tree should not iterate over keys')
  for (const value of rbt.values())
    fail('empty tree should not iterate over values')
  for (const node of rbt.nodes())
    fail('empty tree should not iterate over nodes')

  rbt.clear()
  strictEqual(rbt.size, 0)
})


// ----------------------------------------------------------------------------
suite('one insertion')

test('RBT invariants', () => {
  isFalse(invariantViolated(fromObject({a: 'alpha'})))
})


test('properties of tree with one node', () => {
  const rbt = fromObject({a: 'alpha'})

  isUndefined(rbt.get('whatever'))

  isTrue(rbt.getNode('whatever').nil)
  isTrue(rbt.getNode('a').ok)
  isFalse(rbt.has('whatever'))
  isTrue(rbt.has('a'))
  strictEqual(rbt.size, 1)
  strictEqual(rbt.toString(), '[Tree size:1]')
  strictEqual(rbt.minNode.key, 'a')
  strictEqual(rbt.minNode.value, 'alpha')
  deepEqual(rbt._root.entry(), [ 'a', 'alpha' ])
  strictEqual(rbt._root, rbt.minNode)
  strictEqual(rbt.minNode, rbt.maxNode)
  strictEqual(rbt.get('a'), 'alpha')
  strictEqual(rbt.getNode('a'), rbt._root)
  isTrue(rbt.has('a'))
  isTrue(rbt._nextNode(rbt._root).nil)
  isTrue(rbt._root._parent.nil)
  isTrue(rbt._root._left.nil)
  isTrue(rbt._root._right.nil)
  isTrue(rbt._root._black)
  isFalse(rbt._root._red)
  strictEqual(rbt._root.toString(), '[a:alpha]')
  strictEqual(rbt._root._details(), '(· a:alpha ·)')

  let done = false
  for (const entry of rbt) {
    isFalse(done, 'should iterate only once')
    strictEqual(entry[0], 'a')
    strictEqual(entry[1], 'alpha')
    done = true
  }
  done = false
  rbt.forEach((value, key, target) => {
    isFalse(done, 'should iterate only once')
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


test('after one deletion', () => {
  const rbt = fromObject({a: 'alpha'})
  const root = rbt._root
  isTrue(rbt.delete('a'))
  strictEqual(rbt.size, 0)
  isTrue(rbt._root.nil)
  isTrue(rbt.minNode.nil)
  isTrue(rbt.maxNode.nil)

  isTrue(root._parent.nil)
  isTrue(root._left.nil)
  isTrue(root._right.nil)
})


// ----------------------------------------------------------------------------
suite('iteration')


test('one insertion', () => {
  const rbt = fromObject({a: 'alpha'})
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

  isFalse(invariantViolated(rbt))
})


// ----------------------------------------------------------------------------
test('start-end', () => {
  const rbt = fromObject({
    0: 0, 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8, 9: 9,
  })
  equal([...rbt.keys()].join(','), '0,1,2,3,4,5,6,7,8,9')
  equal([...rbt.values()].join(','), '0,1,2,3,4,5,6,7,8,9')

  function fromStart(start: Node<any, any>): string {
    return [...rbt.nodes(start)].map(node => node.key).join(',')
  }
  function fromStartToEnd(
    start: Node<any, any>, end: Node<any, any>,
  ): string {
    return [...rbt.nodes(start, end)].map(node => node.key).join(',')
  }

  const node5 = rbt.getNode('5')
  equal(fromStart(node5), '5,6,7,8,9')
  equal(fromStartToEnd(node5, node5), '')

  const node7 = rbt.getNode('7')
  equal(fromStart(node7), '7,8,9')
  equal(fromStartToEnd(node5, node7), '5,6')
  equal(fromStartToEnd(node7, node5), '')

  const node9 = rbt.getNode('9')
  equal(fromStart(node9), '9')
  equal(fromStartToEnd(node7, node9), '7,8')

  equal(fromStart(Node.nilNode), '0,1,2,3,4,5,6,7,8,9')
  equal(fromStartToEnd(Node.nilNode, Node.nilNode), '0,1,2,3,4,5,6,7,8,9')
  equal(fromStartToEnd(node7, Node.nilNode), '7,8,9')
  equal(fromStartToEnd(Node.nilNode, node7), '0,1,2,3,4,5,6')

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
    strictEqual(rbt.minNode.key, 'a', 'first letter' + message)
    strictEqual(rbt.maxNode.key, letter, 'last letter' + message)
    isFalse(invariantViolated(rbt), 'invariant violated' + message)
    strictEqual([...rbt.keys()].join(''), letters, 'all letters' + message)
  }
})


test('RBT invariants', () => {
  const entries: Array<[string, string]> = []
  for (let c = 97; c <= 122; c++)
    entries.push([String.fromCodePoint(c), '' + c])

  const rbt = fromEntries(entries)
  isFalse(invariantViolated(rbt), 'invariant violated')
})


// ----------------------------------------------------------------------------
suite('deletion')


test('single', () => {
  const rbt = fromObject({ a: 'alpha', b: 'beta', g: 'gamma' })
  strictEqual([...rbt.keys()].join(), 'a,b,g')
  const node = rbt.getNode('b')
  strictEqual(node.value, 'beta')
  isTrue(rbt.delete('b'))
  isTrue(rbt.getNode('b').nil)
  isFalse(rbt.delete('b'))
  isTrue(node._parent.nil)
  isTrue(node._left.nil)
  isTrue(node._right.nil)
  isFalse(invariantViolated(rbt), 'invariant violated')
})


// ----------------------------------------------------------------------------
suite('concurrent modification')


test('tree properties', () => {
  const source: Record<string, number> = {}
; [...Array(5).keys()].map(value => source[value] = value)
  const rbt = fromObject(source)
  equal([...rbt.keys()].join(','), '0,1,2,3,4')
  equal([...rbt.values()].join(','), '0,1,2,3,4')

  let result: IteratorResult<Node<string, number>>

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


// ----------------------------------------------------------------------------
suite('dead tree')

const frozen = /^Cannot (set|assign)|object is not extensible$/

test('killed Tree', () => {
  const rbt = fromObject({ a: 'alpha' })
  rbt.kill()
  isNaN(rbt.size)
  const treeDead = 'Tree is dead'
  throws(() => rbt.get('whatever'), treeDead)
  throws(() => rbt.has('whatever'), treeDead)
  throws(() => rbt.set('whatever', 'whatever'), treeDead)
})


// ----------------------------------------------------------------------------
suite('internal node handling')


test('insert nil', () => {
  const rbt = new Tree()
  rbt._insertNode(Node.nilNode as Node<any, any>)
  strictEqual(rbt.size, 0)
})


test('display red node', () => {
  const node = new Node('a', 'alpha')
  node._red = true
  strictEqual(node.toString(), '[a:alpha]')
  strictEqual(node._details(), '<· a:alpha ·>')

  node._left = node  // create a cycle!
  node._right = node // create a cycle!
  strictEqual(node.toString(), '[a:alpha]')
  strictEqual(node._details(), '<a a:alpha a>')
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
        let node = rbt.minNode
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


// ----------------------------------------------------------------------------
suite('README.md')


interface Person { name: string, age: number }

test('example code', () => {
  const store = fromEntriesLess(
    [
      [ 'bDe7', { name: 'Jane Doe', age: 47 } ],
      [ 'O3lE', { name: 'John Doe', age: 46 } ],
      [ 'fX4z', { name: 'Billy Brown', age: 33 } ],
      [ 'Tuac', { name: 'Vera Brown', age: 30 } ],
      [ '5S0o', { name: 'Zoe Brown', age: 8 } ],
    ], (a, b) => a.toUpperCase() < b.toUpperCase(),
  )

  const vera = store.get('Tuac')
  isOk(vera)
  if (vera) strictEqual(vera.age, 30)

  const names = [
    'Zoe Brown', 'Jane Doe', 'Billy Brown', 'John Doe', 'Vera Brown',
  ].values()
  for (const person of store.values())
    strictEqual(person.name, names.next().value)
  isTrue(names.next().done)

  isTrue(store.delete('bDe7'))
  isFalse(store.delete('bDe7'))
  isFalse(store.delete('TUAC'))
  strictEqual(store.size, 4)
})
