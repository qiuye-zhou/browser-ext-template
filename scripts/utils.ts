import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { resolve, dirname } from 'node:path'
import { bgCyan, black } from 'kolorist'

const __dirname = dirname(fileURLToPath(import.meta.url))

// 获取端口号，优先使用环境变量 PORT
export const port = Number(process.env.PORT || '') || 2233

// 返回项目根目录下的目标路径
export const r = (...args: string[]) => resolve(__dirname, '..', ...args)

// 判断当前是否为开发环境
export const isDev = process.env.NODE_ENV !== 'production'

// 判断当前是否为 Firefox 扩展环境
export const isFirefox = process.env.EXTENSION === 'firefox'

// 打印
export function log(name: string, message: string) {
  console.log(black(bgCyan(` ${name} `)), message)
}
