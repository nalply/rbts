import * as chai from 'chai'
import { Node, Tree } from './redblack'

const {
  strictEqual, deepEqual, isFalse, isTrue, isUndefined, fail,
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
  const iter = rbt.entries()
  deepEqual(iter.next(), { done: false, value: [ 'a', 'alpha' ]})
  const result = iter.next()
  isTrue(result.done)
  isUndefined(result.value)
})


test('start-end', () => {
  fail('unimplemented')
})


suite('alphabet insertion')


test('tree properties', () => {
  const entries: Array<[string, string]> = []
  for (let c = 97; c <= 122; c++)
    entries.push([String.fromCodePoint(c), '' + c])

  const rbt = new Tree<string, string>(entries)
  strictEqual(rbt.size, 26)
  strictEqual(rbt.firstNode().key, 'a')
  strictEqual(rbt.lastNode().key, 'z')
  strictEqual([...rbt.keys()].join(''), 'abcdefghijklmnopqrstuvwxyz')
})


test('balanced tree', () => {
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
  fail('unimplemented')
})
