<a id="top"></a>
[API Documentation](README.md) > [Tree](#top)

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

* [constructor](#constructor)

### Properties

* [__@toStringTag](#___tostringtag)
* [maxNode](#maxnode)
* [minNode](#minnode)
* [size](#size)

### Methods

* [__@iterator](#___iterator)
* [assign](#assign)
* [clear](#clear)
* [delete](#delete)
* [entries](#entries)
* [forEach](#foreach)
* [get](#get)
* [getNode](#getnode)
* [has](#has)
* [keys](#keys)
* [nodes](#nodes)
* [set](#set)
* [toString](#tostring)
* [values](#values)

---

## Constructors

<a id="constructor"></a>

###  constructor

⊕ **new Tree**(source?: *[TreeAssignable](README.md#treeassignable)<`K`, `V`>*, lessOp?: *[LessOp](README.md#lessop)<`K`>*): [Tree](#top)

*Defined in tree.d.ts:20*

Create a new red-black tree optionally with entries from `source` and the sorting criterium `lessOp`.

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| `Optional` source | [TreeAssignable](README.md#treeassignable)<`K`, `V`> |  an array of entries or an iterable of entries or an object |
| `Optional` lessOp | [LessOp](README.md#lessop)<`K`> |  sorting criterum: a function taking two arguments and returning true if the first is less than the second argument, should run in O(1) time to ensure the red-black tree efficiency |

**Returns:** [Tree](#top)

___

## Properties

<a id="___tostringtag"></a>

###  __@toStringTag

**● __@toStringTag**: *`string`*

*Defined in tree.d.ts:50*

Used by [Tree.toString](#tostring)

___
<a id="maxnode"></a>

###  maxNode

**● maxNode**: *[Node](node.md#top)<`K`, `V`>*

*Defined in tree.d.ts:46*

The node with the maximum key, O(log n)

___
<a id="minnode"></a>

###  minNode

**● minNode**: *[Node](node.md#top)<`K`, `V`>*

*Defined in tree.d.ts:44*

The node with the minimum key, O(log n)

___
<a id="size"></a>

###  size

**● size**: *`number`*

*Defined in tree.d.ts:48*

*__returns__*: the number of entries in the tree, O(1)

___

## Methods

<a id="___iterator"></a>

###  __@iterator

▸ **__@iterator**(): `IterIter`<[`K`, `V`]>

*Defined in tree.d.ts:70*

Indicate that Tree is iterable but same as [Tree.entries](#entries)

**Returns:** `IterIter`<[`K`, `V`]>

___
<a id="assign"></a>

###  assign

▸ **assign**(source: *[TreeAssignable](README.md#treeassignable)<`K`, `V`>*): `this`

*Defined in tree.d.ts:32*

Assign all entries from source to the tree

**Parameters:**

| Name | Type |
| ------ | ------ |
| source | [TreeAssignable](README.md#treeassignable)<`K`, `V`> |

**Returns:** `this`

___
<a id="clear"></a>

###  clear

▸ **clear**(): `void`

*Defined in tree.d.ts:62*

Clear the tree, same as `Map.clear()`, O(1)

**Returns:** `void`

___
<a id="delete"></a>

###  delete

▸ **delete**(key: *`K`*): `boolean`

*Defined in tree.d.ts:60*

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

▸ **entries**(start?: *[Node](node.md#top)<`K`, `V`>*, end?: *[Node](node.md#top)<`K`, `V`>*): `IterIter`<[`K`, `V`]>

*Defined in tree.d.ts:72*

Iterator over entries, sorted by key, O(log n) each step

**Parameters:**

| Name | Type |
| ------ | ------ |
| `Optional` start | [Node](node.md#top)<`K`, `V`> |
| `Optional` end | [Node](node.md#top)<`K`, `V`> |

**Returns:** `IterIter`<[`K`, `V`]>

___
<a id="foreach"></a>

###  forEach

▸ **forEach**(f: *`function`*, self?: *`any`*): `void`

*Defined in tree.d.ts:68*

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

*Defined in tree.d.ts:54*

Get an entry with the key, O(log n)

**Parameters:**

| Name | Type |
| ------ | ------ |
| key | `K` |

**Returns:** `V` \| `undefined`

___
<a id="getnode"></a>

###  getNode

▸ **getNode**(key: *`K`*): [Node](node.md#top)<`K`, `V`>

*Defined in tree.d.ts:42*

Get a node with the key, O(log n)

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| key | `K` |  the key |

**Returns:** [Node](node.md#top)<`K`, `V`>

___
<a id="has"></a>

###  has

▸ **has**(key: *`K`*): `boolean`

*Defined in tree.d.ts:52*

**Parameters:**

| Name | Type |
| ------ | ------ |
| key | `K` |

**Returns:** `boolean`
true if an entry with key is found, O(log n)

___
<a id="keys"></a>

###  keys

▸ **keys**(start?: *[Node](node.md#top)<`K`, `V`>*, end?: *[Node](node.md#top)<`K`, `V`>*): `IterIter`<`K`>

*Defined in tree.d.ts:74*

Iterator over keys, sorted, O(log n) each step

**Parameters:**

| Name | Type |
| ------ | ------ |
| `Optional` start | [Node](node.md#top)<`K`, `V`> |
| `Optional` end | [Node](node.md#top)<`K`, `V`> |

**Returns:** `IterIter`<`K`>

___
<a id="nodes"></a>

###  nodes

▸ **nodes**(start?: *[Node](node.md#top)<`K`, `V`>*, end?: *[Node](node.md#top)<`K`, `V`>*): `IterIter`<[Node](node.md#top)<`K`, `V`>>

*Defined in tree.d.ts:38*

Iterator over nodes, sorted by key, O(log n) each step

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| `Optional` start | [Node](node.md#top)<`K`, `V`> |  iteration start with this node (inclusive) |
| `Optional` end | [Node](node.md#top)<`K`, `V`> |  iteration end before this node (exclusive) or [Node.nilNode](node.md#nilnode) to iterate to the end |

**Returns:** `IterIter`<[Node](node.md#top)<`K`, `V`>>

___
<a id="set"></a>

###  set

▸ **set**(key: *`K`*, value: *`V`*): `this`

*Defined in tree.d.ts:56*

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

*Defined in tree.d.ts:30*

**Returns:** `string`
`"[Tree size:<size>]"` with `<size>` as in [[Tree.size]]

___
<a id="values"></a>

###  values

▸ **values**(start?: *[Node](node.md#top)<`K`, `V`>*, end?: *[Node](node.md#top)<`K`, `V`>*): `IterIter`<`V`>

*Defined in tree.d.ts:76*

Iterator over values, sorted by key, O(log n) each step

**Parameters:**

| Name | Type |
| ------ | ------ |
| `Optional` start | [Node](node.md#top)<`K`, `V`> |
| `Optional` end | [Node](node.md#top)<`K`, `V`> |

**Returns:** `IterIter`<`V`>

___

