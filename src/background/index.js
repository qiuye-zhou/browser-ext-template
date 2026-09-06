/* global chrome */
/**
 * Background Service Worker 示例
 *
 * 职责：长生命周期逻辑、跨页面状态、消息中枢。
 * 注意：MV3 service worker 会被休眠，不要依赖全局变量持久状态，
 * 需持久化请使用 chrome.storage。
 */

// 安装时的初始化逻辑
chrome.runtime.onInstalled.addListener((details) => {
  console.log('[background] onInstalled:', details.reason)
})

// 消息通信示例：Popup / Content Script -> Background
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  switch (message?.type) {
    case 'ping': {
      sendResponse({ ok: true, pong: true, time: Date.now() })
      return false
    }
    case 'get-time': {
      sendResponse({ ok: true, time: new Date().toISOString() })
      return false
    }
    // 在此添加更多消息类型处理
    default:
      break
  }
})
