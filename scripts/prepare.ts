// 为开发环境的入口生成占位 index.html 文件
import { isDev, r, port, log } from './utils'
import fs from 'fs-extra'
import chokidar from 'chokidar'
import { writeManifest } from './manifest'

// 用于开发环境中 Vite 启动的 index.html 占位文件
async function stubIndexHtml() {
  const views = ['popup', 'newtab']

  for (const view of views) {
    // 确保指定路径的目录存在，如果不存在则自动创建该目录及其所有父级目录
    await fs.ensureDir(r(`extension/dist/${view}`))
    let data = await fs.readFile(r(`src/${view}/index.html`), 'utf-8')
    // 将 index.html 中的 "./main.ts" 替换为开发服务器地址
    // 这样做可以通过vite的热更新加载入口文件
    data = data.replace(
      '"./main.ts"',
      `"http://localhost:${port}/${view}/main.ts"`,
    )
    // 生成对应的html文件
    await fs.writeFile(r(`extension/dist/${view}/index.html`), data, 'utf-8')
    log(
      'Vite',
      `${view}: dev server started at http://localhost:${port}/${view}/index.html`,
    )
  }
}

// 复制public目录下的静态资源到extension目录
async function copyPublicAssets() {
  try {
    // 确保extension目录存在
    await fs.ensureDir(r('extension'))

    const publicDir = r('public')

    // 检查public目录是否存在
    const publicExists = await fs.pathExists(publicDir)

    if (publicExists) {
      const files = await fs.readdir(publicDir)

      // 确保extension/assets目录存在
      await fs.ensureDir(r('extension/assets'))

      // 复制public目录下的所有文件到extension/assets目录
      for (const file of files) {
        const srcPath = r('public', file)
        const destPath = r('extension/assets', file)
        await fs.copy(srcPath, destPath, { overwrite: true })
      }

      log('PRE', 'copied public assets to extension directory')
    }
  } catch (error) {
    console.error('Error copying public assets:', error)
  }
}

// 复制background脚本到extension/dist/background目录
async function copyBackground() {
  try {
    await fs.ensureDir(r('extension/dist/background'))
    await fs.copy(
      r('src/background/index.js'),
      r('extension/dist/background/index.js'),
      { overwrite: true },
    )
    log('PRE', 'copied background script')
  } catch (error) {
    console.error('Error copying background script:', error)
  }
}

// 复制 content_scripts 到 extension/dist/content-scripts 目录
async function copyContentScripts() {
  try {
    const srcDir = r('src/content-scripts')
    const exists = await fs.pathExists(srcDir)
    if (!exists) return

    await fs.ensureDir(r('extension/dist/content-scripts'))
    const files = await fs.readdir(srcDir)
    for (const file of files) {
      await fs.copy(
        r('src/content-scripts', file),
        r('extension/dist/content-scripts', file),
        { overwrite: true },
      )
    }
    log('PRE', 'copied content scripts')
  } catch (error) {
    console.error('Error copying content scripts:', error)
  }
}

await Promise.all([
  writeManifest(),
  copyPublicAssets(),
  copyBackground(),
  copyContentScripts(),
])

if (isDev) {
  stubIndexHtml()
  // 监听html文件变化, 重新生成index.html
  chokidar.watch(r('src/**/*.html')).on('change', () => {
    stubIndexHtml()
  })
  // 监听manifest.ts、package.json和scripts/utils.ts变化, 重新生成manifest.json
  chokidar
    .watch([r('src/manifest.ts'), r('package.json'), r('scripts/utils.ts')])
    .on('change', () => {
      writeManifest()
    })
  // 监听public目录变化, 重新复制静态资源
  chokidar.watch(r('public/**/*')).on('change', () => {
    copyPublicAssets()
  })
  // 监听background脚本变化, 重新复制
  chokidar.watch(r('src/background/index.js')).on('change', () => {
    copyBackground()
  })
  // 监听content_scripts变化, 重新复制
  chokidar.watch(r('src/content-scripts/**/*')).on('change', () => {
    copyContentScripts()
  })
}
