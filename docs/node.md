[Typescript Red-Black Tree](README.md) > [Node](node.md)

# Class: Node

Red-black Tree Nodes to maintain the tree's internal order. Each entry in the tree is managed by a node and they are linked by parent and the left and right children. Nodes also are either red or black.

## Type parameters
#### K 
#### V 
## Hierarchy

**Node**

## Index

### Constructors

* [constructor](node.md#constructor)

### Properties

* [black](node.md#black)
* [key](node.md#key)
* [left](node.md#left)
* [parent](node.md#parent)
* [red](node.md#red)
* [right](node.md#right)
* [value](node.md#value)
* [nil](node.md#nil)

### Methods

* [entry](node.md#entry)
* [toString](node.md#tostring)

---

## Constructors

<a id="constructor"></a>

###  constructor

⊕ **new Node**(key: *`K`*, value: *`V`*): [Node](node.md)

*Defined in dist/node.d.ts:5*

Construct a new standalone Node with key and value

**Parameters:**

| Name | Type |
| ------ | ------ |
| key | `K` |
| value | `V` |

**Returns:** [Node](node.md)

___

## Properties

<a id="black"></a>

###  black

**● black**: *`boolean`*

*Defined in dist/node.d.ts:25*

True if Node is black, false if it is red

___
<a id="key"></a>

###  key

**● key**: *`K`*

*Defined in dist/node.d.ts:15*

The key of the entry which the Node represents

___
<a id="left"></a>

###  left

**● left**: *[Node](node.md)<`K`, `V`>*

*Defined in dist/node.d.ts:19*

The left child of the Node

___
<a id="parent"></a>

###  parent

**● parent**: *[Node](node.md)<`K`, `V`>*

*Defined in dist/node.d.ts:23*

The parent of the Node

___
<a id="red"></a>

###  red

**● red**: *`boolean`*

*Defined in dist/node.d.ts:27*

True if Node is red, false if it is black

___
<a id="right"></a>

###  right

**● right**: *[Node](node.md)<`K`, `V`>*

*Defined in dist/node.d.ts:21*

The right child of the Node

___
<a id="value"></a>

###  value

**● value**: *`V`*

*Defined in dist/node.d.ts:17*

The value of the entry which the Node represents, can be mutated

___
<a id="nil"></a>

### `<Static>` nil

**● nil**: *[Node](node.md)<`any`, `any`>*

*Defined in dist/node.d.ts:13*

The nil node (see the Null Object Pattern), used for leaf nodes or for the parent of the root node. Nil nodes are always black and can't be mutated (except for color which is ignored, this simplifies the rebalancing of the tree after an insert or delete).

___

## Methods

<a id="entry"></a>

###  entry

▸ **entry**(): [`K`, `V`]

*Defined in dist/node.d.ts:29*

The entry which the Node represents

**Returns:** [`K`, `V`]

___
<a id="tostring"></a>

###  toString

▸ **toString**(detail?: *`undefined` \| `false` \| `true`*): `string`

*Defined in dist/node.d.ts:31*

Compact display of the node, use `()`for black and `<>` for red nodes

**Parameters:**

| Name | Type |
| ------ | ------ |
| `Optional` detail | `undefined` \| `false` \| `true` |

**Returns:** `string`

___

