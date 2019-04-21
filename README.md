# Red-Black Tree in Typescript

![Red Black Tree SVG](https://upload.wikimedia.org/wikipedia/commons/1/10/Red-black_tree_example_nN.svg)

---

[![npm version](https://badge.fury.io/js/rbts.svg)](https://badge.fury.io/js/rbts)
[![Dependencies](https://david-dm.org/nalply/rbts.svg)](https://david-dm.org/nalply/rbts)
[![Build Status](https://travis-ci.com/nalply/rbts.svg?branch=master)](https://travis-ci.com/nalply/rbts)
[![codecov](https://codecov.io/gh/nalply/rbts/branch/master/graph/badge.svg)](https://codecov.io/gh/nalply/rbts)

A red-black tree is a datastructure for sorted storage of key-value pairs.
Items are stored in tree nodes and sorted after a criterium (`LessOp`).
Search, insertion, deletion and traversal are performed in $O(\log n)$ time.
This implementation has the same interface as JavaScript's built-in type
`Map`, so it can be used as replacement for `Map`.

Currently no guarantees of efficiency are given. I suspect, for example,
that the `less` parameter is not good for performance.
