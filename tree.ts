// Overview about the type variables, classes and interfaces
// ----------------------------------------------------------------------------
// K                   key type
// V                   value type
// R                   iterator result value type, e.g. [K, V] for entries()
// N                   tree node type, typically N extends Node<K, V>
// T                   tree type, typically T extends IterTree<N>
// Assignable<K, V>    entry iterator or array to assign entries to tree
// LessOp<K>           function of a and b to return true if a < b
// Tree<K, V>          red-black tree implementing Map
// IterTree<N>         neccessary tree properties for iterators
// Iter<K, V, R, N, T> iterator implementing IterableIterator<R>
// ----------------------------------------------------------------------------
// Convention: Names starting with _ aren't public. You are on your own if you
// use them. They are excluded from *.d.ts files by anyway.

import { nil, Node, ok } from './node'

/** A red black tree written in TypeScript. It can be used instead of
 * {Map}, where the entries are sorted by a comparison function passed in
 * by the constructor.
 */
export class Tree<K = string, V = any>implements Map<K, V> {
  /** @internal */ _root: Node<K, V> = Node.nil
  /** @internal */ _size: number = 0
  /** @internal */ readonly _less: Less<K, Node<K, V>>

  constructor(
    source?: Assignable<K, V>,
    lessOp: LessOp<K> = (a, b) => a < b,
  ) {
    this._less = (a, b) => lessOp(a, b.key)
    if (source) this.assign(source)
  }

  toString(): string {
    return `[Tree size: ${this.size}]`
  }

  // --- Start implementing Map ---

  get size() {
    return this._size
  }
  [Symbol.toStringTag]: string = 'Tree'

  has(key: K): boolean {
    return ok(this._findNode(key))
  }

  get(key: K): V | undefined {
    const node = this._findNode(key)

    return ok(node) ? node.value : undefined
  }

  set(key: K, value: V): this {
    const node = this._findNode(key)
    ok(node) ?  node.value = value : this._insert(key, value)
    return this
  }

  delete(key: K): boolean {
    return this._deleteNode(this._findNode(key))
  }

  clear(): void {
    this._root = Node.nil
    this._size = 0
  }

  forEach(f: (value: V, key: K, map: Map<K, V>) => void, self?: any): void {
    for (const entry of this.entries())
      f.call(self, entry[1], entry[0], this)
  }

  [Symbol.iterator](): IterableIterator<[K, V]> {
    return this.entries()
  }

  entries(): IterableIterator<[K, V]> {
    return this._iterator<[K, V]>(node => node.entry())
  }

  keys(): IterableIterator<K> {
    return this._iterator<K>(node => node.key)
  }

  values(): IterableIterator<V> {
    return this._iterator<V>(node => node.value)
  }

  // TODO perhaps: https://github.com/tc39/proposal-collection-methods

  // --- End implementing Map ---

  // assign all entries from source to the tree
  assign(source: Assignable<K, V>): this {
    if (!isIterable(source))
      source = Object.entries(source) as any

    for (const entry of source as Iterable<[K, V]>)
      this._insert(entry[0], entry[1])
    return this
  }

  // @param get    function to map from node to iterator value R
  // @param start  start node for iterating over a tree subset (inclusive)
  // @param end    end node for iterating over a tree subset (exclusive)
  /** @internal */ _iterator<R>(
    get: (node: Node<K, V>) => R, start?: Node<K, V>, end?: Node<K, V>,
  ): IterableIterator<R> {
    return new Iter<K, V, R, Node<K, V>, Tree<K, V>>(this, get, start, end)
  }

  /** @internal */ _nodes(
    start?: Node<K, V>, end?: Node<K, V>,
  ): IterableIterator<Node<K, V>> {
    return this._iterator<Node<K, V>>(node => node, start, end)
  }

  /** @internal */ _firstNode(node: Node<K, V> = this._root): Node<K, V> {
    while (ok(node.left)) node = node.left
    return node
  }

  /** @internal */ _lastNode(node: Node<K, V> = this._root): Node<K, V> {
    while (ok(node.right)) node = node.right
    return node
  }

  /** @internal */ _nextNode(node: Node<K, V>): Node<K, V> {
    if (nil(node)) return node
    if (ok(node.right)) return this._firstNode(node.right)
    let parent = node.parent
    while (ok(parent) && node === parent.right) {
      node = parent
      parent = parent.parent
    }
    return parent
  }

  /** @internal */_findNode(
    key: K,
    node: Node<K, V> = this._root,
  ): Node<K, V> {
    while (ok(node) && node.key !== key)
      node = this._less(key, node) ? node.left : node.right

    return node
  }

  /** @internal */_insert(key: K, value: V): this {
    let node = new Node<K, V>(key, value)
    this._size++
    if (nil(this._root)) {
      this._root = node
      return this
    }

    let parent, n
    parent = n = this._root
    while (ok(n)) {
      parent = n
      n = this._less(key, n) ? n.left : n.right
    }
    node._parent = parent
    if (nil(parent)) this._root = node
    else if (this._less(key, parent)) parent._left = node
    else parent._right = node
    node._red = true

    // Reinstate the red-black tree invariants after the insert
    while (node.parent.red) {
      parent = node.parent
      const grandp: Node<K, V> = parent.parent
      if (parent === grandp.left) {
        if (grandp.right.red) {
          parent._black = grandp.right._black = grandp._red = true
          node = grandp
          continue
        }
        if (node === parent.right) {
          this._leftRotate(parent)
;         [parent, node] = [node, parent]
        }
        parent._black = grandp._red = true
        this._rightRotate(grandp)
        continue
      }
      if (grandp.left.red) {
        parent._black = grandp.left._black = grandp._red = true
        node = grandp
        continue
      }
      if (node === parent.left) {
        this._rightRotate(parent)
;       [parent, node] = [node, parent]
      }
      parent._black = grandp._red = true
      this._leftRotate(grandp)
    }
    this._root._black = true
    return this
  }

  /** @internal */_deleteNode(node: Node<K, V>): boolean {
    if (nil(node)) return false

    this._size--

    let child: Node<K, V>, parent: Node<K, V>, red: boolean
    if (ok(node.left) && ok(node.right)) {
      const next = this._firstNode(node.right)
      if (node === this._root) this._root = next
      else node === node.parent.left
        ? node.parent._left = next
        : node.parent._right = next
      child = next.right, parent = next.parent, red = next.red
      if (node === parent) parent = next
      else {
        if (ok(child)) child._parent = parent
        parent._left = child
        next._right = node.right
        node.right._parent = next
      }
      next._parent = node.parent
      next._black = node.black
      node.left._parent = next
      if (red) return true
    }
    else {
      ok(node.left) ? child = node.left : child = node.right
      parent = node.parent, red = node.red
      if (ok(child)) child._parent = parent
      if (node === this._root) this._root = child
      else parent.left === node ? parent._left = child : parent._right = child
      if (red) return true
    }

    // Reinstate the red-black tree invariants after the delete
    node = child
    while (node !== this._root && node.black) {
      if (node === parent.left) {
        let brother = parent.right
        if (brother.red) {
          brother._black = parent._red = true
          this._leftRotate(parent)
          brother = parent.right
        }
        if (brother.left.black && brother.right.black) {
          brother._red = true
          node = parent
          parent = node.parent
          continue
        }
        if (brother.right.black) {
          brother.left._black = brother._red = true
          this._rightRotate(brother)
          brother = parent.right
        }
        brother._black = parent.black
        parent._black = brother.right._black = true
        this._leftRotate(parent)
        node = this._root
        break
      }
      else {
        let brother = parent.left
        if (brother.red) {
          brother._black = parent._red = true
          this._rightRotate(parent)
          brother = parent.left
        }
        if (brother.left.black && brother.right.black) {
          brother._red = true
          node = parent
          parent = node.parent
          continue
        }
        if (brother.left.black) {
          brother.right._black = brother._red = true
          this._leftRotate(brother)
          brother = parent.left
        }
        brother._black = parent.black
        parent._black = brother.left._black = true
        this._rightRotate(parent)
        node = this._root
        break
      }
    }
    if (ok(node)) node._black = true
    return true
  }

    // this._size--
    // let next = node
    // if (nil(node.left) && nil(node.right)) {
    //   next = this.nextNode(node)
    //   node._key = next.key
    //   node.value = next.value
    // }
    // const child = ok(next.left) ? next.left : next.right
    // if (ok(child)) child._parent = next.parent
    // if (nil(next.parent)) this._root = child
    // else if (next === next.parent.left) next.parent._left = child
    // else next.parent._right = child

    // if (next.red) return true


  /** @internal */ _leftRotate(node: Node<K, V>): void {
    const child = node.right
    node._right = child.left
    if (ok(child.left)) child.left._parent = node
    child._parent = node.parent
    if (node === this._root) this._root = child
    else if (node === node.parent.left) node.parent._left = child
    else node.parent._right = child
    node._parent = child
    child._left = node
  }

  /** @internal */ _rightRotate(node: Node<K, V>): void {
    const child = node.left
    node._left = child.right
    if (ok(child.right)) child.right._parent = node
    child._parent = node.parent
    if (node === this._root) this._root = child
    else if (node === node.parent.left) node.parent._left = child
    else node.parent._right = child
    node._parent = child
    child._right = node
  }
}

export type Assignable<K, V> = Iterator<[K, V]> | Array<[K, V]>
  | (K extends string ? Record<K, V> : never)

export type LessOp<K> = (a: K, b: K) => boolean


function isIterable(obj: any): obj is Iterable<unknown> {
  return obj && typeof obj[Symbol.iterator] === 'function'
}


type Less<K, N> = (key: K, node: N) => boolean

interface IterTree<K, N> {
  _less: Less<K, N>
  _nextNode(node: N): N
  _firstNode(): N
}

class Iter<K, V, R, N extends Node<K, V>, T extends IterTree<K, N>>
implements IterableIterator<R>
{
  /** @internal */ _started: boolean = false
  /** @internal */ _node: N
  /** @internal */ _end: N
  /** @internal */ _tree: T
  /** @internal */ _result: (node: N) => R

  get node(): N { return this._node }

  constructor(
    tree: T,
    result: (node: N) => R,
    start: N = Node.nil as N,
    end: N = Node.nil as N,
  ) {
    this._tree = tree
    this._result = result
    this._node = start
    if (ok(start) && ok(end) && !tree._less(start.key, end)) end = start
    this._end = end
  }

  [Symbol.iterator](): IterableIterator<R> { return this }

  next(): IteratorResult<R> {
    if (nil(this.node)) this._node = this._tree._firstNode()
    if (this._started) this._node = this._tree._nextNode(this.node)
    this._started = true

    const done = nil(this.node) || this.node === this._end
    const value = done ? undefined : this._result(this.node)
    return { done, value } as IteratorResult<R>
    //                     ^^^^^^^^^^^^^^^^^^^^
    // See https://github.com/Microsoft/TypeScript/issues/11375
   }
}
