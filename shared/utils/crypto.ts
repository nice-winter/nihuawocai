import { encode as _encode, decode as _decode } from 'cbor2'

/**
 * 将对象编码为 ArrayBuffer
 */
const encode = <T = unknown>(data: T): ArrayBuffer => {
  const encoded = _encode(data)
  return encoded.buffer.slice(
    encoded.byteOffset,
    encoded.byteOffset + encoded.byteLength
  ) as ArrayBuffer
}

/**
 * 将 ArrayBuffer 解码为对象
 */
const decode = <T = unknown>(buffer: Uint8Array<ArrayBufferLike>): T => {
  const decoded = _decode(buffer) as T
  return decoded
}

export { encode, decode }
