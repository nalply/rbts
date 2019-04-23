# Typescript Red-Black Tree

## Index

### Classes

* [Node](node.md)
* [Tree](tree.md)

### Type aliases

* [Assignable](#assignable)
* [LessOp](#lessop)

### Functions

* [nil](#nil)
* [ok](#ok)

---

## Type aliases

<a id="assignable"></a>

###  Assignable

**Ƭ Assignable**: *`Iterator`<[`K`, `V`]> \| `Array`<[`K`, `V`]> \| `K extends string ? Record<K, V> : never`*

*Defined in tree.d.ts:6*

Type for assigning to trees, used by the constructor and [Tree.assign](classes/tree.md#assign): iterator or array over key-value tuples or objects but only if K is string.
___
<a id="lessop"></a>

###  LessOp

**Ƭ LessOp**: *`function`*

*Defined in tree.d.ts:11*

Type for the less-than criterium after which the entries will be sorted: a function to return true if entry `a` is less than entry `b`.

#### Type declaration
▸(a: *`K`*, b: *`K`*): `boolean`

**Parameters:**

| Name | Type |
| ------ | ------ |
| a | `K` |
| b | `K` |

**Returns:** `boolean`
___
## Functions

<a id="nil"></a>

###  nil

▸ **nil**(node: *[Node](classes/node.md)<`unknown`, `unknown`>*): `boolean`

*Defined in node.d.ts:34*

**Parameters:**

| Name | Type |
| ------ | ------ |
| node | [Node](classes/node.md)<`unknown`, `unknown`> |

**Returns:** `boolean`
true if Node is nil

___
<a id="ok"></a>

###  ok

▸ **ok**(node: *[Node](classes/node.md)<`unknown`, `unknown`>*): `boolean`

*Defined in dist/node.d.ts:36*

**Parameters:**

| Name | Type |
| ------ | ------ |
| node | [Node](classes/node.md)<`unknown`, `unknown`> |

**Returns:** `boolean`
true if Node is not nil


