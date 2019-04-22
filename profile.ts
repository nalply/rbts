import { debug } from 'debug'
import { Tree } from './tree'

// https://stackoverflow.com/a/47593316
const M = 1597334677
const N = 2 ** 32

// tslint:disable-next-line: no-bitwise
const lcg = (s: number) => (max = 1) => ((s = Math.imul(M, s)) >>> 0) / (N / max)

const rand: (max?: number) => number = lcg(42)

// tslint:disable-next-line: no-bitwise
const irand = (max: number) => rand(max) | 0

function randString(n: number) {
  let s = ''
  for (let i = 0; i < n; i++) {
    s += String.fromCodePoint(97 + irand(26))
  }
  return s
}

const dbg = debug('rbts:profile')

// Create a large red-black tree for profiling.
const tree = new Tree([], (a, b) => a.toUpperCase() < b.toUpperCase())
dbg('memory', process.memoryUsage())
for (let i = 0; i < 1000000; i++)
  tree.set(randString(6), null)

dbg('tree size', tree.size, 'memory', process.memoryUsage())

// $ DEBUG=rbts:* ts-node profile.ts
//   rbts:profile memory { rss: 152043520,
//   heapTotal: 116736000,
//   heapUsed: 87377136,
//   external: 17334 } +0ms
//   rbts:profile tree size 998715 memory { rss: 262221824,
//   heapTotal: 310722560,
//   heapUsed: 180906072,
//   external: 9110 } +5s
