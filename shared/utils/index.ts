/** 生成6位随机短 hash（数字+大小写字母） */
function shortHash(uppercase?: boolean) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length))
  }
  return uppercase ? result.toUpperCase() : result
}

export { shortHash }
