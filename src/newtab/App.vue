<script setup lang="ts">
import { ref } from 'vue'
import { useGlobalStore } from './store/modules/global'

const globalStore = useGlobalStore()
const isDark = ref(false)

const toggleTheme = () => {
  isDark.value = !isDark.value
}
</script>

<template>
  <div
    class="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100"
    :class="{ dark: isDark }"
  >
    <h1 class="text-3xl font-bold mb-2">New Tab</h1>
    <p class="text-sm text-gray-500 dark:text-gray-400">
      v{{ globalStore.appVersion }} · {{ globalStore.buildTime }}
    </p>

    <button
      class="mt-6 px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded text-sm"
      @click="toggleTheme"
    >
      切换主题
    </button>
  </div>
</template>
