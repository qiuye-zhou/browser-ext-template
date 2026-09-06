/**
 * 浏览器存储工具函数
 */

import webExtensionPolyfill from 'webextension-polyfill'

const browser = webExtensionPolyfill

/**
 * 从存储中获取数据，优先从 local 获取，没有则从 sync 获取
 * @param keys 要获取的键名数组
 * @returns Promise<Record<string, unknown>>
 */
export const getStorage = async (
  keys: string[],
): Promise<Record<string, unknown>> => {
  try {
    // 先尝试从 local 存储获取
    const localResult = await browser.storage.local.get(keys)

    // 检查是否所有 key 都获取到了数据
    const hasAllLocalData = keys.every((key) => localResult[key] !== undefined)
    if (hasAllLocalData) {
      return localResult
    }

    // local 数据不完整，尝试从 sync 存储补充缺失的 key
    const missingKeys = keys.filter((key) => localResult[key] === undefined)
    if (missingKeys.length > 0) {
      const syncResult = await browser.storage.sync.get(missingKeys)
      // 将从 sync 读取到的数据回写到 local，避免下次重复查询
      if (Object.keys(syncResult).length > 0) {
        try {
          await browser.storage.local.set(syncResult)
        } catch {
          // 回写失败不影响返回结果
        }
      }
      return { ...syncResult, ...localResult }
    }

    return localResult
  } catch (error) {
    console.warn('获取存储数据失败:', error)
    return {}
  }
}

/**
 * 设置存储数据到 local
 * @param data 要存储的数据
 * @returns Promise<void>
 */
export const setStorage = async (
  data: Record<string, unknown>,
): Promise<void> => {
  try {
    await browser.storage.local.set(data)
  } catch (error) {
    console.error('设置存储数据失败:', error)
    throw error
  }
}

/**
 * 获取单个存储值
 * @param key 键名
 * @param defaultValue 默认值
 * @returns Promise<T>
 */
export const getStorageValue = async <T>(
  key: string,
  defaultValue: T,
): Promise<T> => {
  const result = await getStorage([key])
  return result[key] !== undefined ? (result[key] as T) : defaultValue
}

/**
 * 设置单个存储值
 * @param key 键名
 * @param value 值
 * @returns Promise<void>
 */
export const setStorageValue = async <T>(
  key: string,
  value: T,
): Promise<void> => {
  await setStorage({ [key]: value })
}
