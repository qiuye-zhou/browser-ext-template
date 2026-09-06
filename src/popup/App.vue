<script setup lang="ts">
import { ref } from 'vue'
import { useGlobalStore } from './store/modules/global'

// browser 由 unplugin-auto-import 自动注入（来自 webextension-polyfill）
const globalStore = useGlobalStore()

const isDark = ref(false)
const bgTime = ref('')

const toggleTheme = () => {
  isDark.value = !isDark.value
}

// 向 Background 发送消息示例
const pingBackground = async () => {
  try {
    const res = (await browser.runtime.sendMessage({
      type: 'get-time',
    })) as { ok: boolean; time: string }
    bgTime.value = res.time
  } catch (err) {
    console.error('sendMessage failed:', err)
  }
}
</script>

<template>
  <div
    class="w-80 p-4 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
    :class="{ dark: isDark }"
  >
    <h1 class="text-lg font-bold mb-2">Popup</h1>
    <p class="text-sm text-gray-500 dark:text-gray-400">
      v{{ globalStore.appVersion }} · {{ globalStore.buildTime }}
    </p>

    <div class="mt-4 flex flex-col gap-2">
      <button
        class="px-3 py-1.5 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
        @click="pingBackground"
      >
        Ping Background
      </button>
      <p v-if="bgTime" class="text-xs text-gray-500">bg time: {{ bgTime }}</p>

      <button
        class="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 rounded text-sm"
        @click="toggleTheme"
      >
        切换主题
      </button>
    </div>
  </div>
</template>
