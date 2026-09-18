# browser-ext-template

浏览器扩展（Chrome Extension MV3）开发模板，基于 **Vue 3 + Vite + TypeScript + Pinia + Tailwind CSS** 。

抽离自实际项目的通用架构，开箱即用，专注于"快速启动一个新扩展"。内置 popup、newtab、background、content script 四类扩展入口，以及消息通信、存储封装、自动导入等基础设施。

## 特性

- **Manifest V3**：通过 `src/manifest.ts` 以代码方式声明，构建时生成 `extension/manifest.json`
- **多入口 Vue 应用**：popup 与 newtab 各自独立挂载，共享 `src/style`、`src/utils`、`src/auto-imports.d.ts`
- **Background Service Worker**：`src/background/index.js`，处理跨页面消息与长生命周期逻辑
- **Content Script**：`src/content-scripts/index.js`，注入目标页面操作 DOM
- **消息通信示例**：Popup / Content Script → Background 的 `runtime.sendMessage` 链路
- **存储封装**：`src/utils/storage.ts`，local 优先 + sync 回退，带类型的 get/set
- **自动导入**：Vue 组合式 API 与 `browser`（webextension-polyfill）无需手动 import
- **Tailwind CSS v4**：通过 `@tailwindcss/vite` 接入，深色模式基于 `.dark` class 策略
- **Dev HMR**：`prepare.ts` 为 popup/newtab 生成指向 `http://localhost:{port}` 的 stub `index.html`，实现扩展内热更新

## 🛠 技术栈

| 类别 | 技术 |
| --- | --- |
| 框架 | Vue 3.5、Pinia 3 |
| 构建 | Vite 7、TypeScript 5.9 |
| 样式 | Tailwind CSS 4（`@tailwindcss/vite`） |
| 扩展 API | webextension-polyfill 0.12 |
| 工具链 | ESLint 9、Prettier 3、unplugin-auto-import、husky、lint-staged |

## 环境要求

- Node.js >= 18
- pnpm（推荐）

## 快速开始

```bash
# 安装依赖
pnpm install

# 生产构建（产物输出到 extension/）
pnpm build

# 开发模式（两个终端）
# 终端 1：vite build --watch，监听并打包入口
pnpm build:web
# 终端 2：生成 manifest、复制静态资源与 background/content-scripts、dev stub
pnpm build:prepare
```

构建完成后，打开 Chrome → `chrome://extensions` → 开启「开发者模式」→「加载已解压的扩展程序」→ 选择项目下的 `extension/` 目录。

> 开发模式下 popup / newtab 会从本地 dev server（默认 `http://localhost:2233`）加载脚本以获得 HMR。修改代码后需在扩展管理页点击刷新按钮使 background / content script 变更生效。

## 项目结构

```
browser-ext-template/
├── extension/                # 构建产物（加载到浏览器的目录，已 gitignore）
├── public/
│   └── logo.png              # 扩展图标（manifest 引用）
├── scripts/                  # 构建辅助脚本
│   ├── utils.ts              # 路径 r()、端口、isDev、log 等
│   ├── manifest.ts           # 调用 src/manifest.ts 写出 extension/manifest.json
│   └── prepare.ts            # 复制 background/content-scripts/public、dev stub、文件监听
├── src/
│   ├── manifest.ts           # MV3 manifest 定义（改权限/入口改这里）
│   ├── background/
│   │   └── index.js          # service worker（消息中枢）
│   ├── content-scripts/
│   │   └── index.js          # 注入页面的 content script
│   ├── popup/                # 弹窗页面（独立 Vue 应用）
│   │   ├── index.html
│   │   ├── main.ts
│   │   ├── App.vue
│   │   └── store/            # 该入口独立的 Pinia 实例
│   ├── newtab/               # 新标签页（独立 Vue 应用，结构同 popup）
│   ├── style/
│   │   └── main.css          # Tailwind 引入 + 滚动条样式
│   ├── utils/
│   │   ├── index.ts
│   │   └── storage.ts        # 浏览器存储封装
│   ├── auto-imports.d.ts     # unplugin-auto-import 生成
│   └── vite-env.d.ts
├── vite.config.ts
├── tsconfig*.json
├── eslint.config.js
├── .prettierrc.js
└── package.json
```

## 架构说明

### 四类扩展入口

| 入口 | 位置 | 职责 |
| --- | --- | --- |
| Popup | `src/popup/` | 点击扩展图标弹出的 UI，独立 Vue 应用 |
| New Tab | `src/newtab/` | 覆盖 `chrome://newtab`，独立 Vue 应用 |
| Background | `src/background/index.js` | Service Worker，消息中枢、跨页面状态、长生命周期逻辑 |
| Content Script | `src/content-scripts/index.js` | 注入目标网页，操作页面 DOM |

> Popup 与 Newtab 是**两个独立的 Vue 应用**，各自创建 Pinia 实例；如需共享状态，通过 `browser.storage` 或 Background 消息中转。

### 构建流程

1. `vite build` 以 `src/popup/index.html`、`src/newtab/index.html` 为多入口，输出到 `extension/dist/`
2. `scripts/prepare.ts` 负责：
   - 调用 `src/manifest.ts` 生成 `extension/manifest.json`
   - 复制 `public/*` → `extension/assets/`
   - 复制 `src/background/index.js` → `extension/dist/background/`
   - 复制 `src/content-scripts/*` → `extension/dist/content-scripts/`
   - 开发模式下为 popup/newtab 生成指向 dev server 的 stub `index.html`，并监听文件变化

### 消息通信

Popup / Content Script → Background：

```ts
// popup 或 content-script 中
const res = await browser.runtime.sendMessage({ type: 'get-time' })
```

```js
// src/background/index.js
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'get-time') {
    sendResponse({ ok: true, time: new Date().toISOString() })
  }
})
```

## 常用定制

### 1. 修改扩展权限 / 匹配规则

编辑 `src/manifest.ts`，修改 `permissions`、`content_scripts[].matches`、`host_permissions` 等字段，重新运行 `pnpm build:prepare` 即可。

不需要覆盖新标签页时，删除 `chrome_url_overrides` 字段即可。

### 2. 新增一个扩展页面（如 options 页）

1. 在 `src/` 下新建 `options/` 目录，结构参考 `popup/`
2. 在 `vite.config.ts` 的 `build.rollupOptions.input` 中增加 `options: r('src/options/index.html')`
3. 在 `scripts/prepare.ts` 的 `views` 数组中加入 `'options'`（dev stub）
4. 在 `src/manifest.ts` 中声明 `options_page` 或 `options_ui`

### 3. 新增 content script 文件

1. 在 `src/content-scripts/` 下新增文件（如 `sidebar.js`）
2. `prepare.ts` 会自动复制整个目录到 `extension/dist/content-scripts/`
3. 在 `src/manifest.ts` 的 `content_scripts` 数组中追加一条，`js` 指向 `./dist/content-scripts/sidebar.js`

### 4. 深色模式

模板使用 Tailwind 的 `.dark` class 策略（`@custom-variant dark (&:where(.dark, .dark *))`）。在根元素切换 `dark` class 即可：

```vue
<div :class="{ dark: isDark }">...</div>
```

### 5. 全局变量

`vite.config.ts` 通过 `define` 注入以下常量，可在任意 TS/Vue 中使用：

| 变量 | 含义 |
| --- | --- |
| `__DEV__` | 是否开发环境 |
| `__NAME__` | package.json 的 name |
| `__VERSION__` | package.json 的 version |
| `__BUILD_TIME__` | 构建时间 ISO 字符串 |

## 可用脚本

| 命令 | 说明 |
| --- | --- |
| `pnpm build` | 生产构建（clear + build:web + build:prepare） |
| `pnpm build:web` | `vite build`，打包 popup/newtab 入口 |
| `pnpm build:prepare` | 生成 manifest、复制静态资源与 background/content-scripts |
| `pnpm typecheck` | `tsc --noEmit` 类型检查 |
| `pnpm lint` | ESLint 修复 |
| `pnpm format` | Prettier 格式化 |
| `pnpm clear` | 清理 `extension/` 构建产物 |

## 开发约定

- **路径别名**：`@/` 指向 `src/`（在 `vite.config.ts` 与 `tsconfig.app.json` 中均已配置）
- **自动导入**：Vue 组合式 API（`ref`、`computed`、`watch` 等）与 `browser` 全局可用，无需 import
- **Store**：每个入口（popup / newtab）各自 `createPinia()`，通过 `defineStore` 定义模块；跨入口共享请走 storage
- **代码风格**：无分号、单引号、尾逗号，由 Prettier + ESLint 强制
- **类型**：`tsconfig.app.json` 开启 `strict`、`noUnusedLocals`、`noUnusedParameters`

## License

MIT
