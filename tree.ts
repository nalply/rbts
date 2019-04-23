// Convention: Names starting with _ aren't public. You are on your own if you
// use them. They are excluded from *.d.ts files by anyway (by internal tag)

// Todo: iteration from-to (pagination not neccessary)
// Todo: return something which can update its value

import { nil, Node, ok } from './node'

/** Type for assigning to trees, used by the constructor and [[Tree.assign]]:
 * iterator or array over key-value tuples or objects but only if K is string.
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
  /** @internal */ _root: Node<K, V> = Node.nil
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
      this._insert(entry[0], entry[1])
    return this
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
    return ok(this._findNode(key))
  }

  /** Get an entry with the key, O(log n) */
  get(key: K): V | undefined {
    const node = this._findNode(key)

    return ok(node) ? node.value : undefined
  }

  /** Set an entry, O(log n) */
  set(key: K, value: V): this {
    const node = this._findNode(key)
    ok(node) ?  node.value = value : this._insert(key, value)
    return this
  }

  /** Delete an entry with the key from the tree, O(log n)
   * @returns true if there was a key
   */
  delete(key: K): boolean {
    return this._deleteNode(this._findNode(key))
  }

  /** Clear the tree, same as `Map.clear()`, O(1) */
  clear(): void {
    this._root = Node.nil
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
  [Symbol.iterator](): IterableIterator<[K, V]> {
    return this.entries()
  }

  /** Iterator over entries, sorted by key, O(log n) each step */
  entries(): IterableIterator<[K, V]> {
    return this._iterator<[K, V]>(node => node.entry())
  }

  /** Iterator over keys, sorted, O(log n) each step */
  keys(): IterableIterator<K> {
    return this._iterator<K>(node => node.key)
  }

  /** Iterator over values, sorted by key, O(log n) each step */
  values(): IterableIterator<V> {
    return this._iterator<V>(node => node.value)
  }

  // TODO perhaps: https://github.com/tc39/proposal-collection-methods

  // --- End implementing Map ---

  // --------------------------------------------------------------------------
  // From here: not part of the public API, no documentation comments any more

  // get    function to map from node to iterator value R
  // start  start node for iterating over a tree subset (inclusive)
  // end    end node for iterating over a tree subset (exclusive)
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

  // Always make sure that node is member of the tree! If not, the tree can
  // get broken, for example by violating the invariant that for all nodes
  // the left child's key is never larger.
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


// type guard (used by assign())
function isIterable(obj: any): obj is Iterable<unknown> {
  return obj && typeof obj[Symbol.iterator] === 'function'
}


// different from LessOp: second argument is Node, not key!
type Less<K, N> = (key: K, node: N) => boolean


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
implements IterableIterator<R>
{
  /** @internal */ _started: boolean = false
  /** @internal */ _node: N
  /** @internal */ _end: N
  /** @internal */ _tree: T
  /** @internal */ _result: (node: N) => R

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
    if (nil(this._node)) this._node = this._tree._firstNode()
    if (this._started) this._node = this._tree._nextNode(this._node)
    this._started = true

    const done = nil(this._node) || this._node === this._end
    const value = done ? undefined : this._result(this._node)
    return { done, value } as IteratorResult<R>
    //                     ^^^^^^^^^^^^^^^^^^^^
    // See https://github.com/Microsoft/TypeScript/issues/11375
   }
}
