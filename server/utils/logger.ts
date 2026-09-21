import { consola } from 'consola'
import type { ConsolaReporter, LogObject } from 'consola'
import { mkdirSync, appendFileSync, readdirSync, renameSync, statSync, unlinkSync } from 'node:fs'
import { join } from 'node:path'
import { format } from 'node:util'

/**
 * 日志文件输出目录
 */
const LOG_DIR = join(process.cwd(), '.logs')
const LOG_FILE = 'server.log'

/**
 * 日志等级 → 可读标签
 */
const LEVEL_LABELS: Record<number, string> = {
  0: 'FATAL',
  1: 'ERROR',
  2: 'WARN ',
  3: 'INFO ',
  4: 'DEBUG',
  5: 'TRACE',
  // 3.x 兼容：verbose / silly
  999: 'VERBOSE',
}

/**
 * 去除字符串中的 ANSI 颜色转义码
 */
const stripAnsi = (s: string) =>
  s.replace(new RegExp(String.fromCharCode(0x1b) + '\\[[0-9;]*m', 'g'), '')

/**
 * 格式化时间戳为本地可读格式：YYYY-MM-DD HH:mm:ss
 */
const formatTimestamp = (date: Date): string => {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

/**
 * 归档旧日志文件
 * 将 server.log 重命名为 server.YYYY-MM-DD_HH-mm-ss.log
 */
const archiveOldLog = () => {
  const logPath = join(LOG_DIR, LOG_FILE)
  try {
    const stats = statSync(logPath)
    if (stats.size === 0) return // 空文件不归档

    const mtime = new Date(stats.mtimeMs)
    const pad = (n: number) => String(n).padStart(2, '0')
    const ts = `${mtime.getFullYear()}-${pad(mtime.getMonth() + 1)}-${pad(mtime.getDate())}_${pad(mtime.getHours())}-${pad(mtime.getMinutes())}-${pad(mtime.getSeconds())}`
    const archiveName = `server.${ts}.log`

    renameSync(logPath, join(LOG_DIR, archiveName))
  } catch {
    // 文件不存在则跳过
  }
}

/**
 * 清理超过指定天数的归档日志
 */
const cleanOldArchives = (maxAgeDays = 30) => {
  try {
    const cutoff = Date.now() - maxAgeDays * 86400_000
    const files = readdirSync(LOG_DIR)
    for (const file of files) {
      if (!file.startsWith('server.') || file === LOG_FILE) continue
      // 匹配 server.YYYY-MM-DD_HH-mm-ss.log
      const match = file.match(/^server\.\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}\.log$/)
      if (!match) continue
      try {
        const filePath = join(LOG_DIR, file)
        if (statSync(filePath).mtimeMs < cutoff) {
          unlinkSync(filePath)
        }
      } catch {
        // 单文件删除失败不影响整体
      }
    }
  } catch {
    // 目录读取失败不影响启动
  }
}

// ── 启动时执行归档 ──────────────────────────────────────────────

mkdirSync(LOG_DIR, { recursive: true })
archiveOldLog()
cleanOldArchives()

/**
 * 写入启动分隔线，便于肉眼定位重启边界
 */
const writeStartupBanner = () => {
  const line = '═'.repeat(60)
  const ts = formatTimestamp(new Date())
  appendFileSync(join(LOG_DIR, LOG_FILE), `\n${line}\n  Server started at ${ts}\n${line}\n`)
}

writeStartupBanner()

/**
 * 文件 Reporter — 将日志以可读文本格式写入 .logs/server.log
 *
 * 格式示例：
 * [2026-09-21 08:58:32] [INFO ] [Storage  ] 存储层初始化完成: fs，4 张表
 */
const fileReporter: ConsolaReporter = {
  log(logObj: LogObject) {
    try {
      // 去除 ANSI 颜色码并格式化参数
      const cleanArgs = logObj.args.map((arg) =>
        typeof arg === 'string' ? stripAnsi(arg) : arg
      )
      const message = format(...cleanArgs).replace(/\n/g, ' ↵ ') // 多行内容折叠到一行

      const ts = formatTimestamp(new Date(logObj.date))
      const level = LEVEL_LABELS[logObj.level] ?? `LV${logObj.level}`
      const tag = (logObj.tag ?? '').padEnd(10)

      appendFileSync(join(LOG_DIR, LOG_FILE), `[${ts}] [${level}] [${tag}] ${message}\n`)
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
