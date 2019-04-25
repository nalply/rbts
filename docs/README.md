[Typescript Red-Black Tree main README](../README.md)

Current as of version 0.0.5

#  API Documentation

## Index

### Classes

* [Node](node.md)
* [Tree](tree.md)

### Type aliases

* [LessOp](#lessop)
* [TreeAssignable](#treeassignable)

---

## Type aliases

<a id="lessop"></a>

###  LessOp

**Ƭ LessOp**: *`function`*

*Defined in tree.d.ts:12*

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
<a id="treeassignable"></a>

###  TreeAssignable

**Ƭ TreeAssignable**: *`Iterator`<[`K`, `V`]> \| `Array`<[`K`, `V`]> \| `K extends string ? Record<K, V> : never`*

*Defined in tree.d.ts:7*

Type for assigning to trees, used by the constructor and [Tree.assign](tree.md#assign): iterator or array over key-value tuples or objects but only if K is string.
___

