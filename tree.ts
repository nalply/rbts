// Convention: Names starting with _ aren't public. You are on your own if you
// use them. They are excluded from *.d.ts files by anyway (by internal tag).
// Didnt' use private because they are needed in tests (white box testing).

import { Node } from './node'
export { Node }


/** Type for assigning to trees, used by the constructor and [[Tree.assign]]:
 * iterators or arrays over entries, or objects, too, but only if K is string.
 * @typeparam K key type
 * @typeparam V value type
 */
export type TreeAssignable<K, V> = Iterator<[K, V]> | Array<[K, V]>
  | (K extends string ? Record<K, V> : never)


/** Type for the less-than criterium after which the entries will be sorted:
 * a function to return true if entry `a` is less than entry `b`.
 * @typeparam K key type, entries are sorted by key
 */
export type LessOp<K> = (a: K, b: K) => boolean


/** A red-black tree written in TypeScript. The entries are stored sorted after
 * the criterium `lessOp` passed tp the constructor or by default by the
 * comparison operator `<` (less). Insertion, deletion and iteration have
 * O(log n) time complexity where n is the number of entries in the tree.
 * @typeparam K key type, entries are sorted by key
 * @typeparam V value type
 */
export class Tree<K = string, V = any>implements Map<K, V> {
  /** @internal */ _root: Node<K, V> = Node.nilNode
  /** @internal */ _size: number = 0
  /** @internal */ readonly _less: Less<K, Node<K, V>>

  /** Create a new red-black tree optionally with entries from `source` and
   * the sorting criterium `lessOp`.
   * @param source an array of entries or an iterable of entries or an object
   * @param lessOp sorting criterum: a function taking two arguments and
   *   returning true if the first is less than the second argument, should
   *   run in O(1) time to ensure the red-black tree efficiency
   */
  constructor(
    source?: TreeAssignable<K, V>,
    lessOp: LessOp<K> = (a, b) => a < b,
  ) {
    this._less = (a, b) => lessOp(a, b.key)
    if (source) this.assign(source)
  }

  /** @returns `"[Tree size:<size>]"` with `<size>` as in [[Tree.size]] */
  toString(): string {
    return `[${this[Symbol.toStringTag]} size:${this.size}]`
  }

  /** Assign all entries from source to the tree */
  assign(source: TreeAssignable<K, V>): this {
    if (!isIterable(source))
      source = Object.entries(source) as any

    for (const entry of source as Iterable<[K, V]>)
      this._insertNode(new Node(entry[0], entry[1]))
    return this
  }

  /** Iterator over nodes, sorted by key, O(log n) each step
   * @param start iteration start with this node (inclusive)
   * @param end iteration end before this node (exclusive) or [[Node.nilNode]]
   *   to iterate to the end
   */
  nodes(start?: Node<K, V>, end?: Node<K, V>): IterIter<Node<K, V>> {
    return this._iterator<Node<K, V>>(node => node, start, end)
  }

  /** Get a node with the key, O(log n)
   * @param key the key
   */
  getNode(key: K): Node<K, V> {
    return this._findNode(key)
  }

  /** The node with the minimum key, O(log n) */
  get minNode(): Node<K, V> {
    return this._firstNode()
  }

  /** The node with the maximum key, O(log n) */
  get maxNode(): Node<K, V> {
    return this._lastNode()
  }

  /** Clear the tree and make it unusable */
  kill() {
    this._root = deadNode()
    this._size = NaN
    Object.freeze(this)
  }

  // --- Start implementing Map ---

  /** @returns the number of entries in the tree, O(1) */
  get size() {
    return this._size
  }

  /** Used by [[Tree.toString]] */
  [Symbol.toStringTag]: string = 'Tree'

  /** @returns true if an entry with key is found, O(log n) */
  has(key: K): boolean {
    return this._findNode(key).ok
  }

  /** Get an entry with the key, O(log n) */
  get(key: K): V | undefined {
    const node = this._findNode(key)

    return node.ok ? node.value : undefined
  }

  /** Set an entry, O(log n) */
  set(key: K, value: V): this {
    const node = this._findNode(key)
    node.ok ?  node.value = value : this._insertNode(new Node(key, value))
    return this
  }

  /** Delete an entry with the key from the tree, O(log n)
   * @returns true if there was a key
   */
  delete(key: K): boolean {
    const node = this._findNode(key)
    const result = this._deleteNode(node)
    if (node.ok)
      node._parent = node._left = node._right = Node.nilNode
    return result
  }

  /** Clear the tree, same as `Map.clear()`, O(1) */
  clear(): void {
    this._root = Node.nilNode
    this._size = 0
  }

  /** Invoke `f` over all entries sorted by key, same as `Map.forEach()`
   * @param f Function taking value, key and container as parameters which
   *   will be called for all entries of the tree in their order
   * @param self `this` inside f
   */
  forEach(f: (value: V, key: K, map: Map<K, V>) => void, self?: any): void {
    for (const entry of this.entries())
      f.call(self, entry[1], entry[0], this)
  }

  /** Indicate that Tree is iterable but same as [[Tree.entries]] */
  [Symbol.iterator](): IterIter<[K, V]> {
    return this.entries()
  }

  /** Iterator over entries, sorted by key, O(log n) each step */
  entries(start?: Node<K, V>, end?: Node<K, V>): IterIter<[K, V]> {
    return this._iterator<[K, V]>(node => node.entry(), start, end)
  }

  /** Iterator over keys, sorted, O(log n) each step */
  keys(start?: Node<K, V>, end?: Node<K, V>): IterIter<K> {
    return this._iterator<K>(node => node.key, start, end)
  }

  /** Iterator over values, sorted by key, O(log n) each step */
  values(start?: Node<K, V>, end?: Node<K, V>): IterIter<V> {
    return this._iterator<V>(node => node.value, start, end)
  }

  // TODO perhaps: https://github.com/tc39/proposal-collection-methods

  // --- End implementing Map ---

  // --------------------------------------------------------------------------
  // From here: not part of the public API, no documentation comments any more

  // get    function to map from node to iterator value R
  // start  start node for iterating over a tree subset (inclusive)
  // end    end node for iterating over a tree subset (exclusive)
  /** @internal */ _iterator<R>(
    get: (node: Node<K, V>) => R,
    start?: Node<K, V>,
    end?: Node<K, V>,
  ): IterIter<R> {
    return new Iter<K, V, R, Node<K, V>, Tree<K, V>>(this, get, start, end)
  }

  /** @internal */ _firstNode(node: Node<K, V> = this._root): Node<K, V> {
    while (node._left.ok) node = node._left
    return node
  }

  /** @internal */ _lastNode(node: Node<K, V> = this._root): Node<K, V> {
    while (node._right.ok) node = node._right
    return node
  }

  /** @internal */ _nextNode(node: Node<K, V>): Node<K, V> {
    if (node.nil) return node
    if (node._right.ok) return this._firstNode(node._right)
    let parent = node._parent
    while (parent.ok && node === parent._right) {
      node = parent
      parent = parent._parent
    }
    return parent
  }

  /** @internal */_findNode(
    key: K,
    node: Node<K, V> = this._root,
  ): Node<K, V> {
    while (node.ok && key !== node.key)
      node = this._less(key, node) ? node._left : node._right
    return node
  }

  /** @internal */_insertNode(node: Node<K, V>): this {
    if (node.nil) return this

    node._parent = node._left = node._right = Node.nilNode
    this._size++
    if (this._root.nil) {
      this._root = node
      return this
    }

    let parent, n
    parent = n = this._root
    while (n.ok) {
      parent = n
      n = this._less(node.key, n) ? n._left : n._right
    }
    node._parent = parent

    // Empirical insight from fuzzying: parent is never nil. I tried to create
    // a situation where parent is nil (add two nodes), but couldn't make
    // parent nil. However should it happen anyway (will throw TypeError), an
    // if branch could be added: if (parent.nil) this._root = node ... else
    if (this._less(node.key, parent)) parent._left = node
    else parent._right = node
    node._red = true

    // Reinstate the red-black tree invariants after the insert
    while (node._parent._red) {
      parent = node._parent
      const grandp = parent._parent
      if (parent === grandp._left) {
        if (grandp._right._red) {
          parent._black = grandp._right._black = grandp._red = true
          node = grandp
          continue
        }
        if (node === parent._right) {
          this._leftRotate(parent)
;         [parent, node] = [node, parent]
        }
        parent._black = grandp._red = true
        this._rightRotate(grandp)
        continue
      }
      if (grandp._left._red) {
        parent._black = grandp._left._black = grandp._red = true
        node = grandp
        continue
      }
      if (node === parent._left) {
        this._rightRotate(parent)
;       [parent, node] = [node, parent]
      }
      parent._black = grandp._red = true
      this._leftRotate(grandp)
    }
    this._root._black = true
    return this
  }

  // Always make sure that node is member of the tree! The tree can break,
  // the left child's key might turn larger or other bad things. Also, after
  // delete the node is not part of the tree anymore and links are invalid.
  // The best bet is to set parent, left and child to nil after the delete.
  /** @internal */_deleteNode(node: Node<K, V>): boolean {
    if (node.nil) return false

    this._size--

    let child: Node<K, V>, parent: Node<K, V>, red: boolean
    if (node._left.ok && node._right.ok) {
      const next = this._firstNode(node._right)
      if (node === this._root) this._root = next
      else node === node._parent._left
        ? node._parent._left = next
        : node._parent._right = next
      child = next._right, parent = next._parent, red = next._red
      if (node === parent) parent = next
      else {
        if (child.ok) child._parent = parent
        parent._left = child
        next._right = node._right
        node._right._parent = next
      }
      next._parent = node._parent
      next._black = node._black
      node._left._parent = next
      if (red) return true
    }
    else {
      node._left.ok ? child = node._left : child = node._right
      parent = node._parent, red = node._red
      if (child.ok) child._parent = parent
      if (node === this._root) this._root = child
      else parent._left === node ? parent._left = child : parent._right = child
      if (red) return true
    }

    // Reinstate the red-black tree invariants after the delete
    node = child
    while (node !== this._root && node._black) {
      if (node === parent._left) {
        let brother = parent._right
        if (brother._red) {
          brother._black = parent._red = true
          this._leftRotate(parent)
          brother = parent._right
        }
        if (brother._left._black && brother._right._black) {
          brother._red = true
          node = parent
          parent = node._parent
          continue
        }
        if (brother._right._black) {
          brother._left._black = brother._red = true
          this._rightRotate(brother)
          brother = parent._right
        }
        brother._black = parent._black
        parent._black = brother._right._black = true
        this._leftRotate(parent)
        node = this._root
        break
      }
      else {
        let brother = parent._left
        if (brother._red) {
          brother._black = parent._red = true
          this._rightRotate(parent)
          brother = parent._left
        }
        if (brother._left._black && brother._right._black) {
          brother._red = true
          node = parent
          parent = node._parent
          continue
        }
        if (brother._left._black) {
          brother._right._black = brother._red = true
          this._leftRotate(brother)
          brother = parent._left
        }
        brother._black = parent._black
        parent._black = brother._left._black = true
        this._rightRotate(parent)
        node = this._root
        break
      }
    }
    if (node.ok) node._black = true
    return true
  }

  /** @internal */ _leftRotate(node: Node<K, V>): void {
    const child = node._right
    node._right = child._left
    if (child._left.ok) child._left._parent = node
    child._parent = node._parent
    if (node === this._root) this._root = child
    else if (node === node._parent._left) node._parent._left = child
    else node._parent._right = child
    node._parent = child
    child._left = node
  }

  /** @internal */ _rightRotate(node: Node<K, V>): void {
    const child = node._left
    node._left = child._right
    if (child._right.ok) child._right._parent = node
    child._parent = node._parent
    if (node === this._root) this._root = child
    else if (node === node._parent._left) node._parent._left = child
    else node._parent._right = child
    node._parent = child
    child._right = node
  }
}


// type guard (used by assign())
function isIterable(obj: any): obj is Iterable<unknown> {
  return obj && typeof obj[Symbol.iterator] === 'function'
}


// Different from LessOp: second argument is Node, not key!
type Less<K, N> = (key: K, node: N) => boolean

// An abbreviation
type IterIter<R> = IterableIterator<R>

// Interface to expose a few properties of Tree to the iterator
interface IterTree<K, N> {
  _less: Less<K, N>
  _nextNode(node: N): N
  _firstNode(): N
}

// Iterator implementation
// K  key type
// V  value type
// R  iterator result value type, e.g. [K, V] for entries()
// N  tree node type, typically N extends Node<K, V>
// T  tree type, typically T extends IterTree<N>
class Iter<K, V, R, N extends Node<K, V>, T extends IterTree<K, N>>
implements IterIter<R>
{
  /** @internal */ _started: boolean = false
  /** @internal */ _node: N
  /** @internal */ _end: N
  /** @internal */ _tree: T
  /** @internal */ _result: (node: N) => R

  constructor(
    tree: T,
    result: (node: N) => R,
    start: N = Node.nilNode as N,
    end: N = Node.nilNode as N,
  ) {
    this._tree = tree
    this._result = result
    this._node = start
    if (start.ok && end.ok && !tree._less(start.key, end)) end = start
    this._end = end
  }

  [Symbol.iterator](): IterIter<R> { return this }

  next(): IteratorResult<R> {
    if (this._node.nil) this._node = this._tree._firstNode()
    if (this._started) this._node = this._tree._nextNode(this._node)
    this._started = true

    const done = this._node.nil || this._node === this._end
    const value = done ? undefined : this._result(this._node)
    return { done, value } as IteratorResult<R>
    //                     ^^^^^^^^^^^^^^^^^^^^
    // See https://github.com/Microsoft/TypeScript/issues/11375
   }
}


// Create an object structurally compatible to Node but throwing on any access
const throwDead = () => { throw new TypeError('Tree is dead') }
function deadNode(): Node<any, any> {
  const propNames = '_key _value _parent _left _right _black _red ok nil'
  const properties: PropertyDescriptorMap = {}
  for (const propName of propNames.split(' '))
    properties[propName] = { get: throwDead, set: throwDead }
  return Object.defineProperties({}, properties)
}

