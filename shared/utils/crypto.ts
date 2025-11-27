const encoder = new TextEncoder()
const decoder = new TextDecoder()

/**
 * 将对象编码为 ArrayBuffer
 * @param data 要编码的数据
 * @returns 编码后的 ArrayBuffer
 */
const encode = <T = unknown>(data: T): ArrayBuffer => {
  const jsonString = JSON.stringify(data)
  return encoder.encode(jsonString).buffer
}

/**
 * 将 ArrayBuffer 解码为对象
 * @param buffer 要解码的 ArrayBuffer
 * @returns 解码后的对象
 */
const decode = <T = unknown>(buffer: ArrayBuffer): T => {
  const jsonString = decoder.decode(new Uint8Array(buffer))
  return JSON.parse(jsonString) as T
}

export { encode, decode }
