<a id="top"></a>
[API Documentation](README.md) > [Node](#top)

# Class: Node

Node has two tasks: first they are used to maintain the red-black tree's internal order. For that properties starting with \_ (underscore) are used, these are internal and not officially documented, for example `_black` and `_red` for the node's color. The second task is as a pointer into the tree, for example to define iteration start and end, but also to mutate the value in-place. Keys shouldn't be modified (there is no public writable property anyway).

## Type parameters
#### K 
#### V 
## Hierarchy

**Node**

## Index

### Constructors

* [constructor](#constructor)

### Properties

* [key](#key)
* [nil](#nil)
* [ok](#ok)
* [value](#value)
* [nilNode](#nilnode)

### Methods

* [entry](#entry)
* [toString](#tostring)

---

## Constructors

<a id="constructor"></a>

###  constructor

⊕ **new Node**(key: *`K`*, value: *`V`*): [Node](#top)

*Defined in node.d.ts:9*

Construct a new standalone Node with key and value

**Parameters:**

| Name | Type |
| ------ | ------ |
| key | `K` |
| value | `V` |

**Returns:** [Node](#top)

___

## Properties

<a id="key"></a>

###  key

**● key**: *`K`*

*Defined in node.d.ts:15*

The key of the entry which the Node represents

___
<a id="nil"></a>

###  nil

**● nil**: *`boolean`*

*Defined in node.d.ts:19*

True if node is nil

___
<a id="ok"></a>

###  ok

**● ok**: *`boolean`*

*Defined in node.d.ts:21*

True if node is not nil

___
<a id="value"></a>

###  value

**● value**: *`V`*

*Defined in node.d.ts:17*

The value of the entry which the Node represents, can be mutated

___
<a id="nilnode"></a>

### `<Static>` nilNode

**● nilNode**: *[Node](#top)<`any`, `any`>*

*Defined in node.d.ts:13*

The one and only nil Node
___

## Methods

<a id="entry"></a>

###  entry

▸ **entry**(): [`K`, `V`]

*Defined in node.d.ts:23*

The entry which the Node represents

**Returns:** [`K`, `V`]

___
<a id="tostring"></a>

###  toString

▸ **toString**(maxLength?: *`undefined` \| `number`*): `string`

*Defined in node.d.ts:25*

Compact display of the node

**Parameters:**

| Name | Type |
| ------ | ------ |
| `Optional` maxLength | `undefined` \| `number` |

**Returns:** `string`

___

