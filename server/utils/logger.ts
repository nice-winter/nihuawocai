import { consola } from 'consola'
import type { ConsolaReporter, LogObject } from 'consola'
import { mkdirSync, appendFileSync } from 'node:fs'
import { join } from 'node:path'
import { format } from 'node:util'

/**
 * 日志文件输出目录
 */
const LOG_DIR = join(process.cwd(), '.logs')

/**
 * 文件 Reporter — 将日志以 JSON Lines 格式写入 .logs/server.log
 */
const fileReporter: ConsolaReporter = {
  log(logObj: LogObject) {
    try {
      mkdirSync(LOG_DIR, { recursive: true })

      // 去除 ANSI 颜色码
      const cleanArgs = logObj.args.map((arg) =>
        typeof arg === 'string' ? arg.replace(/\x1B\[[0-9;]*m/g, '') : arg
      )

      const entry = {
        time: new Date(logObj.date).toISOString(),
        level: logObj.level,
        type: logObj.type,
        tag: logObj.tag,
        message: format(...cleanArgs)
      }

      appendFileSync(join(LOG_DIR, 'server.log'), JSON.stringify(entry) + '\n')
    } catch {
      // 文件写入失败不应影响正常运行
    }
  }
}

// 挂载文件 reporter（dev + prod 都写入 .logs/server.log）
consola.addReporter(fileReporter)

/**
 * 初始化日志等级（运行时覆盖）
 * 优先级：AppConfig.logLevel > CONSOLA_LEVEL（consola 原生） > 默认值
 * @param level 日志等级数字，空字符串或 undefined 则不覆盖
 */
export const initLogLevel = (level: number | '' | undefined) => {
  if (level !== undefined && level !== '') {
    consola.level = Number(level)
  }
}

/**
 * 创建带 Tag 的 Logger 实例
 * 统一使用英文 PascalCase Tag，例如：WebSocket、GameService、RoomHandler
 */
export const createLogger = (tag: string) => consola.withTag(tag)
