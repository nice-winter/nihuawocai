import { describe, expect, it } from 'vitest'
import { encode, decode } from '../../shared/utils/crypto'

describe('crypto encode/decode', () => {
  it('往返编解码：简单对象', () => {
    const original = { name: '冬冬', score: 100 }
    const encoded = encode(original)
    const decoded = decode(new Uint8Array(encoded))
    expect(decoded).toEqual(original)
  })

  it('往返编解码：嵌套对象', () => {
    const original = {
      player: { id: 'abc', stats: { wins: 10, losses: 2 } },
      tags: ['pro', 'champion'],
    }
    const encoded = encode(original)
    const decoded = decode(new Uint8Array(encoded))
    expect(decoded).toEqual(original)
  })

  it('往返编解码：数组', () => {
    const original = [1, 'two', { three: 3 }]
    const encoded = encode(original)
    const decoded = decode(new Uint8Array(encoded))
    expect(decoded).toEqual(original)
  })

  it('往返编解码：空对象', () => {
    const original = {}
    const encoded = encode(original)
    const decoded = decode(new Uint8Array(encoded))
    expect(decoded).toEqual(original)
  })

  it('往返编解码：数值边界', () => {
    const original = {
      zero: 0,
      negative: -1,
      float: 3.14159,
      big: 9007199254740991, // Number.MAX_SAFE_INTEGER
    }
    const encoded = encode(original)
    const decoded = decode<typeof original>(new Uint8Array(encoded))
    expect(decoded).toEqual(original)
  })

  it('encode 返回 ArrayBuffer', () => {
    const encoded = encode({ test: true })
    expect(encoded).toBeInstanceOf(ArrayBuffer)
    expect(encoded.byteLength).toBeGreaterThan(0)
  })

  it('不同输入产生不同编码结果', () => {
    const a = encode({ v: 1 })
    const b = encode({ v: 2 })
    expect(Buffer.from(a)).not.toEqual(Buffer.from(b))
  })
})
