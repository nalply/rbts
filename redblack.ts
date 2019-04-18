// Overview about the type variables, classes and interfaces
// ----------------------------------------------------------------------------
// K            key type
// V            value type
// R            iterator result value type, for example [K, V] for entries()
// N            tree node type, typically N extends Node<K, V>
// T            tree type, typically T extends IterTree<N>
// LessOp<K>    function of a and b to return true if a < b
// Tree<K, V>   red-black tree implementing Map and TreeEx<N>
// Node<K, V>   red-black node with pointers to parent, left and right
// IterTree<N>  provide Tree.nextNode() and Tree.firstNode() for iterators
// Iter<K, V, R, N, T> iterator implementing IterableIterator<R>
// ----------------------------------------------------------------------------
// Convention: Names starting with _ aren't public. You are on your own if you
// use them. They are excluded from *.d.ts files by @internal anyway.

// Which types can be assigned to a Tree? Objects only if K is string.
export type Assignable<K, V> = Iterator<[K, V]> | Array<[K, V]>
  | (K extends string ? Record<K, V> : never)

export type LessOp<K> = (a: K, b: K) => boolean

export class Tree<K = string, V = any>implements Map<K, V> {
  /** @internal */ _root: Node<K, V> = Node.nil
  /** @internal */ _size: number = 0
  /** @internal */ readonly _less: Less<K, Node<K, V>>

  get less() {
    return this._less
  }

  get root() {
    return this._root
  }

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
    return ok(this.findNode(key))
  }

  get(key: K): V | undefined {
    return this.find(key)
  }

  set(key: K, value: V): this {
    const node = this.findNode(key)
    ok(node) ?  node.value = value : this.insert(key, value)
    return this
  }

  delete(key: K): boolean {
    return this.deleteNode(this.findNode(key))
  }

  clear(): void {
    this._root = Node.nil
    this._size = 0
  }

  forEach(f: (value: V, key: K, map: Map<K, V>) => void, self: any): void {
    for (const key of this.keys()) f.call(f, self, key, this)
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

  // @param get    function to map from node to iterator value R
  // @param start  start node for iterating over a tree subset (inclusive)
  // @param end    end node for iterating over a tree subset (exclusive)
  /** @internal */ _iterator<R>(
    get: (node: Node<K, V>) => R, start?: Node<K, V>, end?: Node<K, V>,
  ): IterableIterator<R> {
    return new Iter<K, V, R, Node<K, V>, Tree<K, V>>(this, get, start, end)
  }

  nodes(start?: Node<K, V>, end?: Node<K, V>): IterableIterator<Node<K, V>> {
    return this._iterator<Node<K, V>>(node => node, start, end)
  }

  // assign all entries from source to the tree
  assign(source: Assignable<K, V>): this {
    if (!isIterable(source))
      source = Object.entries(source) as any

    for (const entry of source as Iterable<[K, V]>)
      this.insert(entry[0], entry[1])
    return this
  }

  firstNode(node: Node<K, V> = this.root): Node<K, V> {
    while (ok(node.left)) node = node.left
    return node
  }

  lastNode(node: Node<K, V> = this.root): Node<K, V> {
    while (ok(node.right)) node = node.right
    return node
  }

  nextNode(node: Node<K, V>): Node<K, V> {
    if (nil(node)) return node
    if (ok(node.right)) return this.firstNode(node.right)
    let parent = node.parent
    while (ok(parent) && node === parent.right) {
      node = parent
      parent = parent.parent
    }
    return parent
  }

  prevNode(node: Node<K, V>): Node<K, V> {
    if (nil(node)) return node
    if (ok(node.left)) return this.lastNode(node.left)
    let parent = node.parent
    while (ok(parent) && node === parent.left) {
      node = parent
      parent = parent.parent
    }
    return parent
  }

  findNode(
    key: K,
    node: Node<K, V> = this.root,
  ): Node<K, V> {
    while (ok(node) && node.key !== key)
      node = this._less(key, node) ? node.left : node.right

    return node
  }

  find(
    key: K,
    node: Node<K, V> = this.root,
  ): V | undefined {
    node = this.findNode(key, node)

    return ok(node) ? node.value : undefined
  }

  insert(key: K, value: V): this {
    let node = new Node<K, V>(key, value)
    this._size++
    if (nil(this.root)) {
      this._root = node
      return this
    }

    let parent, n
    parent = n = this.root
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
    this.root._black = true
    return this
  }

  deleteNode(node: Node<K, V>): boolean {
    if (nil(node)) return false

    let next = node
    this._size--
    if (ok(node.left) && ok(node.right)) {
      next = this.nextNode(node)
      node._key = next.key
      node.value = next.value
    }
    const child = next.left || next.right
    if (ok(child)) child._parent = next.parent
    if (nil(next.parent)) this._root = child
    else if (next === next.parent.left) next.parent._left = child
    else next.parent._right = child

    if (next.red) return true

    // Reinstate the red-black tree invariants after the delete
    node = child
    let parent = next.parent
    while (node !== this.root && node.red) {
      if (parent.left === node) {
        let brother = parent.right
        if (brother.red) {
          brother._black = parent._red = true
          this._leftRotate(parent)
          brother = parent.right
        }
        if (brother.left.red && brother.right.red) {
          brother._red = true
          node = parent
        }
        else {
          if (brother.right.black) {
            brother.left._black = brother._red = true
            this._rightRotate(brother)
            brother = parent.right
          }
          brother._black = parent.black
          parent._black = brother.right._black = true
          this._leftRotate(parent)
          node = this.root
        }
      } else {
        let brother = parent.left
        if (brother && brother.red) {
          brother._black = parent._red = true
          this._rightRotate(parent)
          brother = parent.left
        }
        if (brother.left.red && brother.right.red) {
          brother._red = true
          node = parent
        }
        else {
          if (brother.left.red) {
            brother.right._black = brother._red = true
            this._leftRotate(brother)
            brother = parent.left
          }
          brother._black = parent.black
          parent._black = brother.left._black = true
          this._rightRotate(parent)
          node = this.root
        }
      }
      parent = node.parent
    }
    if (node.red) node._black = true // nil is black and can't be assigned
    return true
  }

  /** @internal */ _leftRotate(node: Node<K, V>): void {
    const child = node.right
    node._right = child.left
    if (ok(child.left)) child.left._parent = node
    child._parent = node.parent
    if (node === this.root) this._root = child
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
    if (node === this.root) this._root = child
    else if (node === node.parent.left) node.parent._left = child
    else node.parent._right = child
    node._parent = child
    child._right = node
  }

  // return false or description of violated invariant, not efficient
  /** @internal */ _invariantViolated(): string | false {
    const walked = new Set<Node<K, V>>()
    let maxDepth = 0, minDepth = Infinity

    // in order traversal
    let node = this.firstNode()
    while (ok(node)) {
      const depth = Node._depth(node) // see comment below at walkup!
      if (nil(node.left) || nil(node.right)) {
        if (depth > maxDepth) maxDepth = depth
        if (depth < minDepth) minDepth = depth
      }

      const p = node.parent, r = node.right, l = node.left
      const key = node.key.toString().substr(0, 20)
      const s = ` (at key ${key}, depth ${depth})`
      const notChild = 'not parent\'s child' + s
      if (depth < 0 || walked.has(node)) return `cycle` + s
      if (node.red) {
        if (l.red) return 'left of red not black' + s
        if (r.red) return 'right of red not black' + s
      }
      if (ok(p) && node !== p.left && node !== p.right) return notChild
      if (ok(r) && node !== r.parent) return 'not left\'s child' + s
      if (ok (l) && node !== l.parent) return 'not right\'s child' + s
      if (ok(r) && this._less(r.key, node)) return 'right is greater' + s
      if (ok(l) && this._less(node.key, l)) return 'left is smaller' + s

      // Check whether the number of black nodes in all paths is same
      let blackDepth = null
      if (nil(node.left) && nil(node.right)) {
        let walkup = node, blackDepth2 = +node.black
        // we already walked up in Node._depth(), no need to check for cycles
        while (ok(walkup = walkup.parent)) blackDepth2 += +node.black

        const bad = `black depth ${blackDepth2}, expected ${blackDepth}` + s
        if (null === blackDepth) blackDepth = blackDepth2
        else if (blackDepth !== blackDepth2) return bad
      }

      walked.add(node)
      node = this.nextNode(node)
    }

    if (this.size > 3) {
      const logSize = (1 + Math.log(this.size)).toPrecision(3)
      const diffDepth = maxDepth - minDepth
      const unbalanced = 'unbalanced tree of size ' + this.size
      const formula = `diffDepth ${diffDepth} > logSize ${logSize}`
      if (diffDepth > +logSize)
        return `${unbalanced}: ${formula}`
    }

    // no violated invariants have been found
    return false
  }
}

function isIterable(obj: any): obj is Iterable<unknown> {
  return obj && typeof obj[Symbol.iterator] === 'function'
}

interface NodeWalk { parent: NodeWalk }

export class Node<K, V> {
  /** @internal */ _key: K
  /** @internal */ _value: V          // Node.nil is Readonly<Node<K, V>>
  /** @internal */ _parent: Node<K, V> = Node.nil as Node<K, V>
  /** @internal */ _left: Node<K, V> = Node.nil as Node<K, V>
  /** @internal */ _right: Node<K, V> = Node.nil as Node<K, V>
  /** @internal */ _black: boolean = true

  /** @internal */ set _red(value: boolean) { this._black = !value }

  constructor(key: K, value: V) {
    this._key = key
    this._value = value
  }

  get key(): K { return this._key }
  get value(): V { return this._value }
  set value(value: V) { this._value = value }
  get left(): Node<K, V> { return this._left }
  get right(): Node<K, V> { return this._right }
  get parent(): Node<K, V> { return this._parent }
  get black(): boolean { return this._black }
  get red(): boolean { return !this._black }

  /** @internal */static readonly _nilKey = Symbol('rbts.Node.nil.key')
  /** @internal */static readonly _nilValue = Symbol('rbts.Node.nil.value')

  static readonly nil = (() => {
    const node = new Node<any, any>(Node._nilKey, Node._nilValue)
    node.toString = () => '·'

    // Node.nil must not be modified
    return Object.freeze(node._parent = node._left = node._right = node)
  })()

  /** @internal */ _dump(check: Set<Node<K, V>> = new Set): string {
    if (nil(this)) return '·'

    const key = this.key.toString().substr(0, 10)
    const o = this.black ? '(' : '<'
    const c = this.black ? ')' : '>'
    if (check.has(this)) return '@' + o + this.key + c
    check.add(this)
    const left = nil(this.left) ? '' : this.left._dump(check)
    const right = nil(this.right) ? '' : this.right._dump(check)

    return o + left + key + right + c
  }

  // Node depth (0 if nil and Infinity if there was a cycle), not efficient
  /** @internal */ static _depth(node: NodeWalk): number {
    const walked = new Set<NodeWalk>()
    let depth = 0
    while (ok(node)) {
      if (walked.has(node)) return Infinity // cycle detected
      walked.add(node)
      depth++
      node = node.parent
    }
    return depth
  }

  entry(): [K, V] { return [ this.key, this.value ] }

  toString(detail = false): string {
    const o = detail ? this.black ? '(' : '<' : '['
    const c = detail ? this.black ? ')' : '>' : ']'
    const key = this.key.toString().substr(0, 20)
    const value = this.value.toString().substr(0, 20)
    const left = detail ? (nil(this.left) ? '·' : this.left.key) + ' ' : ''
    const right = detail ? ' ' + (nil(this.right) ? '·' : this.right.key) : ''
    return `${o}${left}${key}:${value}${right}${c}`
  }
}

type NilCheckParameter = Node<unknown, unknown> | NodeWalk

function nil(node: NilCheckParameter): boolean {
  return node === Node.nil
}

function ok(node: NilCheckParameter): boolean {
  return node !== Node.nil
}

type Less<K, N> = (key: K, node: N) => boolean

interface IterTree<K, N> {
  less: Less<K, N>
  nextNode(node: N): N
  firstNode(): N
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
    if (ok(start) && ok(end) && !tree.less(start.key, end)) end = start
    this._end = end
  }

  [Symbol.iterator](): IterableIterator<R> { return this }

  next(): IteratorResult<R> {
    if (nil(this.node)) this._node = this._tree.firstNode()
    if (this._started) this._node = this._tree.nextNode(this.node)
    this._started = true

    const done = nil(this.node) || this.node === this._end
    const value = done ? undefined : this._result(this.node)
    return { done, value } as IteratorResult<R>
    //                     ^^^^^^^^^^^^^^^^^^^^
    // See https://github.com/Microsoft/TypeScript/issues/11375
   }
}