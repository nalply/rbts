import { Tree, Node }  from './redblack'
import * as chai from 'chai'

const { strictEqual, deepEqual, isFalse, isTrue, isUndefined } = chai.assert


const isNilNode = (value: any) =>
  chai.assert(value === Node.nil, 'not a nil Node')
const isOkNode = (value: any) => 
  chai.assert(value.constructor !== Node || value !== Node.nil, 
    'not an ok Node')

suite('red black tree')

test('empty', () => {
  const rbt = new Tree

  isFalse(rbt._invariantViolated(), 'invariant violated')
  strictEqual(rbt.size, 0)
  
  isNilNode(rbt.root)
  isUndefined(rbt.root.key)
  isUndefined(rbt.root.value)
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

test('one insertion, one deletion', () => {
  const rbt = new Tree<string, symbol>()
  const sym = Symbol('sym')

  rbt.set('sym', sym)
  isFalse(rbt._invariantViolated(), 'invariant violated')
  isUndefined(rbt.find('whatever'))
  isNilNode(rbt.findNode('whatever'))
  isOkNode(rbt.findNode('sym'))
  isFalse(rbt.has('whatever'))
  strictEqual(rbt.size, 1)
  strictEqual(rbt.firstNode().key, 'sym')
  strictEqual(rbt.firstNode().value, sym)
  deepEqual(rbt.root.entry(), [ 'sym', sym ])
  strictEqual(rbt.root, rbt.firstNode())
  strictEqual(rbt.firstNode(), rbt.lastNode())
  strictEqual(rbt.find('sym'), sym)
  strictEqual(rbt.findNode('sym'), rbt.root)
  isTrue(rbt.has('sym'))
  isNilNode(rbt.nextNode(rbt.root))
  isNilNode(rbt.prevNode(rbt.root))
  isNilNode(rbt.root.parent)
  isNilNode(rbt.root.left)
  isNilNode(rbt.root.right)
  isTrue(rbt.root.black)

  const iter = rbt.entries()
  deepEqual(iter.next(), { done: false, value: [ 'sym', sym ]})
  const result = iter.next()
  isTrue(result.done)
  isUndefined(result.value)

  rbt.deleteNode(rbt.root)
  strictEqual(rbt.size, 0)
  isNilNode(rbt.root)
  isNilNode(rbt.firstNode())
  isNilNode(rbt.lastNode())
})

// TODO test iteration start-end


test('insertion of several items', () => {
  let entries: [string, string][] = []
  for (let c = 97; c <= 122; c++) 
    entries.push([String.fromCodePoint(c), '' + c])

  const rbt = new Tree<string, string>(entries)
  strictEqual(rbt.size, 26)
  strictEqual(rbt.firstNode().key, 'a')
  strictEqual(rbt.lastNode().key, 'z')
  strictEqual([...rbt.keys()].join(''), 'abcdefghijklmnopqrstuvwxyz')
})


test('balanced tree', () => {
  let entries: [string, string][] = []
  for (let c = 97; c <= 122; c++) 
    entries.push([String.fromCodePoint(c), '' + c])

  const rbt = new Tree<string, string>(entries)
  const bad = rbt._invariantViolated()
  isFalse(rbt._invariantViolated(), 'invariant violated')
})


test('delete', () => {
  const entries = Object.entries({ a: 'alpha', b: 'beta', g: 'gamma' })
  const rbt = new Tree<string, string>(entries)
  strictEqual([...rbt.keys()].join(), 'a,b,g')
  const node = rbt.findNode('b')
})


// todo: concurrent modification in iteration?
