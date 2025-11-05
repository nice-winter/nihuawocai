/**
 * 将对象编码为 ArrayBuffer
 * @param data 要编码的数据
 * @returns 编码后的 ArrayBuffer
 */
function encode<T = unknown>(data: T): ArrayBuffer {
  const jsonString = JSON.stringify(data)
  const encoder = new TextEncoder()
  return encoder.encode(jsonString).buffer
}

/**
 * 将 ArrayBuffer 解码为对象
 * @param buffer 要解码的 ArrayBuffer
 * @returns 解码后的对象
 */
function decode<T = unknown>(buffer: ArrayBuffer): T {
  const decoder = new TextDecoder()
  const jsonString = decoder.decode(buffer)
  return JSON.parse(jsonString) as T
}

/**
 * 将 ArrayBuffer 转换为 Base64 字符串
 * @param buffer ArrayBuffer
 * @returns Base64 字符串
 */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]!)
  }
  return btoa(binary)
}

/**
 * 将 Base64 字符串转换回 ArrayBuffer
 * @param base64 Base64 字符串
 * @returns ArrayBuffer
 */
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes.buffer
}

export { encode, decode, arrayBufferToBase64, base64ToArrayBuffer }
