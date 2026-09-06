import fs from 'fs-extra'
import type { Manifest } from 'webextension-polyfill'

import { isDev, port } from '../scripts/utils'

// 生成manifest配置文件
export async function getManifest() {
  const pkg = await fs.readJson('package.json')

  const manifest: Manifest.WebExtensionManifest = {
    manifest_version: 3,
    name: pkg.displayName || pkg.name,
    version: pkg.version,
    description: pkg.description,
    action: {
      default_icon: './assets/logo.png',
      default_popup: './dist/popup/index.html',
    },
    // 如需覆盖新标签页，保留以下配置；不需要时可删除
    chrome_url_overrides: {
      newtab: './dist/newtab/index.html',
    },
    icons: {
      16: './assets/logo.png',
      48: './assets/logo.png',
      128: './assets/logo.png',
    },
    // 按需声明权限。常用权限说明：
    // - storage: 扩展本地/同步存储
    // - tabs: 标签页查询与操作
    // - activeTab: 当前激活标签页的临时权限
    // - scripting: 动态注入脚本
    permissions: ['tabs', 'storage', 'activeTab', 'scripting'],
    background: {
      service_worker: './dist/background/index.js',
      type: 'module',
    },
    // 内容脚本示例：按需修改 matches 与 js 路径
    content_scripts: [
      {
        matches: ['<all_urls>'],
        js: ['./dist/content-scripts/index.js'],
        run_at: 'document_idle',
      },
    ],
    content_security_policy: {
      extension_pages: isDev
        ? // 开发模式下，允许加载本地开发服务器脚本以方便调试
          `script-src 'self' http://localhost:${port}; object-src 'self'`
        : "script-src 'self'; object-src 'self'",
    },
    web_accessible_resources: [
      {
        resources: ['assets/*'],
        // 仅允许扩展自身页面访问资源，防止外部网站指纹识别
        matches: ['chrome-extension://*/*'],
      },
    ],
  }

  return manifest
}
