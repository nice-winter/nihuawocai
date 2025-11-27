import * as cbor from 'cbor2'

/**
 * 将对象编码为 ArrayBuffer
 */
const encode = <T = unknown>(data: T): ArrayBuffer => {
  const encoded = cbor.encode(data)
  return encoded.buffer as ArrayBuffer
}

/**
 * 将 ArrayBuffer 解码为对象
 */
const decode = <T = unknown>(buffer: Uint8Array<ArrayBufferLike>): T => {
  const decoded = cbor.decode(buffer) as T
  return decoded
}

export { encode, decode }
