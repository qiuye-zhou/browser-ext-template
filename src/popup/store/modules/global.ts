import { defineStore } from 'pinia'
import { ref } from 'vue'

declare const __VERSION__: string
declare const __BUILD_TIME__: string

export const useGlobalStore = defineStore('global', () => {
  const appVersion = ref(__VERSION__)
  const buildTime = ref(__BUILD_TIME__)

  return { appVersion, buildTime }
})
