export class Node<K, V> {
  /** @internal */ _key: K
  /** @internal */ _value: V          // Node.nil is Readonly<Node<K, V>>
  /** @internal */ _parent: Node<K, V> = Node.nil as Node<K, V>
  /** @internal */ _left: Node<K, V> = Node.nil as Node<K, V>
  /** @internal */ _right: Node<K, V> = Node.nil as Node<K, V>
  /** @internal */ _black: boolean = true

  /** @internal */ get _red() { return !this._black }
  /** @internal */ set _red(value: boolean) { this._black = !value }

  constructor(key: K, value: V) {
    this._key = key
    this._value = value
  }

  static readonly nil = nilNode()

  get key(): K { return this._key }
  get value(): V { return this._value }
  set value(value: V) { this._value = value }
  get left(): Node<K, V> { return this._left }
  get right(): Node<K, V> { return this._right }
  get parent(): Node<K, V> { return this._parent }
  get black(): boolean { return this._black }
  get red(): boolean { return !this._black }

  entry(): [K, V] { return [ this.key, this.value ] }

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


export function nil(node: Node<unknown, unknown>): boolean {
  return node === Node.nil
}


export function ok(node: Node<unknown, unknown>): boolean {
  return node !== Node.nil
}

