# A red-black tree implementation in Typescript

A red-black tree is a datastructure for sorted storage of key-value pairs.
Items are stored in tree nodes and sorted after a criterium (`LessOp`).
Search, insertion, deletion and traversal are performed in $O(\log n)$ time.
This implementation has the same interface as JavaScript's built-in type
`Map`, so it can be used as replacement for `Map`.

Currently this module does not work correctly. There's a bug with the
rebalancing of the tree. Items are found, but not in an efficient way.
Also, no other guarantees of efficiency are given. I suspect, for example,
that the `less` parameter is not good for performance, for example.

## Todos

- Fix the rebalancing bug
- Test the red-black tree in the browser
- Profiling
