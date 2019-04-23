[Typescript Red-Black Tree](README.md) > [Tree](tree.md)

# Class: Tree

A red-black tree written in TypeScript. The entries are stored sorted after the criterium `lessOp` passed tp the constructor or by default by the comparison operator `<` (less). Insertion, deletion and iteration have O(log n) time complexity where n is the number of entries in the tree.

## Type parameters
#### K 

key type, entries are sorted by key

#### V 

value type

## Hierarchy

**Tree**

## Implements

* `Map`<`K`, `V`>

## Index

### Constructors

* [constructor](tree.md#constructor)

### Properties

* [__@toStringTag](tree.md#___tostringtag)
* [size](tree.md#size)

### Methods

* [__@iterator](tree.md#___iterator)
* [assign](tree.md#assign)
* [clear](tree.md#clear)
* [delete](tree.md#delete)
* [entries](tree.md#entries)
* [forEach](tree.md#foreach)
* [get](tree.md#get)
* [has](tree.md#has)
* [keys](tree.md#keys)
* [set](tree.md#set)
* [toString](tree.md#tostring)
* [values](tree.md#values)

---

## Constructors

<a id="constructor"></a>

###  constructor

⊕ **new Tree**(source?: *[Assignable](../#assignable)<`K`, `V`>*, lessOp?: *[LessOp](../#lessop)<`K`>*): [Tree](tree.md)

*Defined in dist/tree.d.ts:19*

Create a new red-black tree optionally with entries from `source` and the sorting criterium `lessOp`.

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| `Optional` source | [Assignable](../#assignable)<`K`, `V`> |  an array of entries or an iterable of entries or an object |
| `Optional` lessOp | [LessOp](../#lessop)<`K`> |  sorting criterum: a function taking two arguments and returning true if the first is less than the second argument, should run in O(1) time to ensure the red-black tree efficiency |

**Returns:** [Tree](tree.md)

___

## Properties

<a id="___tostringtag"></a>

###  __@toStringTag

**● __@toStringTag**: *`string`*

*Defined in dist/tree.d.ts:35*

Used by [Tree.toString](tree.md#tostring)

___
<a id="size"></a>

###  size

**● size**: *`number`*

*Defined in dist/tree.d.ts:33*

*__returns__*: the number of entries in the tree, O(1)

___

## Methods

<a id="___iterator"></a>

###  __@iterator

▸ **__@iterator**(): `IterableIterator`<[`K`, `V`]>

*Defined in dist/tree.d.ts:55*

Indicate that Tree is iterable but same as [Tree.entries](tree.md#entries)

**Returns:** `IterableIterator`<[`K`, `V`]>

___
<a id="assign"></a>

###  assign

▸ **assign**(source: *[Assignable](../#assignable)<`K`, `V`>*): `this`

*Defined in dist/tree.d.ts:31*

Assign all entries from source to the tree

**Parameters:**

| Name | Type |
| ------ | ------ |
| source | [Assignable](../#assignable)<`K`, `V`> |

**Returns:** `this`

___
<a id="clear"></a>

###  clear

▸ **clear**(): `void`

*Defined in dist/tree.d.ts:47*

Clear the tree, same as `Map.clear()`, O(1)

**Returns:** `void`

___
<a id="delete"></a>

###  delete

▸ **delete**(key: *`K`*): `boolean`

*Defined in dist/tree.d.ts:45*

Delete an entry with the key from the tree, O(log n)

**Parameters:**

| Name | Type |
| ------ | ------ |
| key | `K` |

**Returns:** `boolean`
true if there was a key

___
<a id="entries"></a>

###  entries

▸ **entries**(): `IterableIterator`<[`K`, `V`]>

*Defined in dist/tree.d.ts:57*

Iterator over entries, sorted by key, O(log n) each step

**Returns:** `IterableIterator`<[`K`, `V`]>

___
<a id="foreach"></a>

###  forEach

▸ **forEach**(f: *`function`*, self?: *`any`*): `void`

*Defined in dist/tree.d.ts:53*

Invoke `f` over all entries sorted by key, same as `Map.forEach()`

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| f | `function` |  Function taking value, key and container as parameters which will be called for all entries of the tree in their order |
| `Optional` self | `any` |  \`this\` inside f |

**Returns:** `void`

___
<a id="get"></a>

###  get

▸ **get**(key: *`K`*): `V` \| `undefined`

*Defined in dist/tree.d.ts:39*

Get an entry with the key, O(log n)

**Parameters:**

| Name | Type |
| ------ | ------ |
| key | `K` |

**Returns:** `V` \| `undefined`

___
<a id="has"></a>

###  has

▸ **has**(key: *`K`*): `boolean`

*Defined in dist/tree.d.ts:37*

**Parameters:**

| Name | Type |
| ------ | ------ |
| key | `K` |

**Returns:** `boolean`
true if an entry with key is found, O(log n)

___
<a id="keys"></a>

###  keys

▸ **keys**(): `IterableIterator`<`K`>

*Defined in dist/tree.d.ts:59*

Iterator over keys, sorted, O(log n) each step

**Returns:** `IterableIterator`<`K`>

___
<a id="set"></a>

###  set

▸ **set**(key: *`K`*, value: *`V`*): `this`

*Defined in dist/tree.d.ts:41*

Set an entry, O(log n)

**Parameters:**

| Name | Type |
| ------ | ------ |
| key | `K` |
| value | `V` |

**Returns:** `this`

___
<a id="tostring"></a>

###  toString

▸ **toString**(): `string`

*Defined in dist/tree.d.ts:29*

**Returns:** `string`
`"[Tree size:<size>]"` with `<size>` as in [[Tree.size]]

___
<a id="values"></a>

###  values

▸ **values**(): `IterableIterator`<`V`>

*Defined in dist/tree.d.ts:61*

Iterator over values, sorted by key, O(log n) each step

**Returns:** `IterableIterator`<`V`>

___

