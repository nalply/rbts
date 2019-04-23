# Typescript Red-Black Tree

## Index

### Classes

* [Tree](tree.md)

### Type aliases

* [Assignable](#assignable)
* [LessOp](#lessop)

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
