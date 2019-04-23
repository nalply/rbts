/** Red-black Tree Nodes to maintain the tree's internal order. Each entry in
 * the tree is managed by a node and they are linked by parent and the left
 * and right children. Nodes also are either red or black.
 */
export class Node<K, V> {
  /** @internal */ _key: K
  /** @internal */ _value: V
  /** @internal */ _parent: Node<K, V> = Node.nil as Node<K, V>
  /** @internal */ _left: Node<K, V> = Node.nil as Node<K, V>
  /** @internal */ _right: Node<K, V> = Node.nil as Node<K, V>
  /** @internal */ _black: boolean = true

  /** @internal */ get _red() { return !this._black }
  /** @internal */ set _red(value: boolean) { this._black = !value }

  /** Construct a new standalone Node with key and value */
  constructor(key: K, value: V) {
    this._key = key
    this._value = value
  }

  /** The nil node (see the Null Object Pattern), used for leaf nodes or
   * for the parent of the root node. Nil nodes are always black and can't be
   * mutated (except for color which is ignored, this simplifies the
   * rebalancing of the tree after an insert or delete).
   */
  static readonly nil = nilNode()

  /** The key of the entry which the Node represents */
  get key(): K { return this._key }

  /** The value of the entry which the Node represents, can be mutated */
  get value(): V { return this._value }
  set value(value: V) { this._value = value }

  /** The left child of the Node */
  get left(): Node<K, V> { return this._left }

  /** The right child of the Node */
  get right(): Node<K, V> { return this._right }

  /** The parent of the Node */
  get parent(): Node<K, V> { return this._parent }

  /** True if Node is black, false if it is red */
  get black(): boolean { return this._black }

  /** True if Node is red, false if it is black */
  get red(): boolean { return !this._black }

  /** The entry which the Node represents */
  entry(): [K, V] { return [ this.key, this.value ] }

  /** Compact display of the node, use `()`for black and `<>` for red nodes */
  toString(detail = false): string {
    const o = detail ? this.black ? '(' : '<' : '['
    const c = detail ? this.black ? ')' : '>' : ']'
    const key = ('' + this.key).substr(0, 20)
    const value = ('' + this.value).substr(0, 20)
    const left = detail ? (nil(this.left) ? '·' : this.left.key) + ' ' : ''
    const right = detail ? ' ' + (nil(this.right) ? '·' : this.right.key) : ''
    return `${o}${left}${key}:${value}${right}${c}`
  }

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
  /** @internal */ static _depth(node: Node<unknown, unknown>): number {
    const walked = new Set<Node<unknown, unknown>>()
    let depth = 0
    while (ok(node)) {
      if (walked.has(node)) return Infinity // cycle detected
      walked.add(node)
      depth++
      node = node.parent
    }
    return depth
  }
}


// Node.nil is unmodifiable but ignores changing color
function nilNode(): Node<any, any> {
  if (nilNode.already) throw new TypeError('nilNode() already invoked')
  nilNode.already = true
  return Object.freeze(
    new class extends Node<any, any> {
      toString() { return '·' }
      get _black() { return true }
      set _black(value: boolean) {}

      constructor() {
        super(Symbol('rbts.Node.nil.key'), Symbol('rbts.Node.nil.value'))
        this._parent = this._left = this._right = this
      }
    },
  )
}
nilNode.already = false


/** @returns true if Node is nil */
export function nil(node: Node<unknown, unknown>): boolean {
  return node === Node.nil
}


/** @returns true if Node is not nil */
export function ok(node: Node<unknown, unknown>): boolean {
  return node !== Node.nil
}

