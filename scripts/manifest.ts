import fs from 'fs-extra'
import { fileURLToPath } from 'node:url'
import { getManifest } from '../src/manifest'
import { log, r } from './utils'

// 生成manifest.json文件
export async function writeManifest() {
  await fs.writeJSON(r('extension/manifest.json'), await getManifest(), {
    spaces: 2,
  })
  log('PRE', 'write manifest.json')
}

// 直接运行时执行（被 import 时不执行）
const isDirectRun = process.argv[1] === fileURLToPath(import.meta.url)
if (isDirectRun) {
  writeManifest()
}
