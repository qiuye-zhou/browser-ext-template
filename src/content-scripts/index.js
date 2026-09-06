/* global chrome */
/**
 * Content Script 示例
 *
 * 运行在目标网页上下文，可操作页面 DOM。
 * 通过 chrome.runtime.sendMessage 与 Background 通信。
 */

console.log('[content-script] loaded on:', window.location.href)

// 示例：向 Background 发送一条 ping 消息
chrome.runtime.sendMessage({ type: 'ping' }, (response) => {
  if (chrome.runtime.lastError) {
    console.warn('[content-script] message error:', chrome.runtime.lastError.message)
    return
  }
  console.log('[content-script] background response:', response)
})
