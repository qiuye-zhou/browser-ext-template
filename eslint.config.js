import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import pluginVue from 'eslint-plugin-vue'
import prettier from 'eslint-plugin-prettier'
import prettierConfig from 'eslint-config-prettier'
import qiuyeConfig from 'eslint-config-qiuye'

export default [
  ...qiuyeConfig,
  // JavaScript 推荐规则
  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts,vue}'],
    ...js.configs.recommended,
  },
  // prettier 插件注册（全局）
  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts,vue}'],
    plugins: {
      prettier: prettier,
    },
  },
  // 全局变量设置 - 源码仅使用浏览器全局变量
  {
    files: ['src/**/*.{js,mjs,cjs,ts,mts,cts,vue}'],
    languageOptions: {
      globals: { ...globals.browser },
    },
  },
  // 全局变量设置 - 构建脚本使用 Node 全局变量
  {
    files: ['scripts/**/*.{js,mjs,cjs,ts,mts,cts}'],
    languageOptions: {
      globals: { ...globals.node },
    },
  },
  // Vue 推荐规则
  ...pluginVue.configs['flat/essential'],
  // Vue 文件解析器设置
  {
    files: ['**/*.vue'],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
      },
    },
  },
  // 自定义规则
  {
    rules: {
      ...prettierConfig.rules,
      'prettier/prettier': 'error',
      'no-unused-vars': 'off', // 由 @typescript-eslint/no-unused-vars 接管
      '@typescript-eslint/no-explicit-any': 'warn', // 允许使用 any 但给警告
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ], // 允许以下划线开头的未使用变量
      'vue/multi-word-component-names': 'off', // 关闭组件名必须多个单词的规则
      'vue/no-unused-vars': 'off', // script setup 中模板使用的变量会被误报
      semi: ['error', 'never'], // 禁止使用分号
    },
  },
  // 忽略的文件和目录
  {
    ignores: ['dist/', 'extension/dist/', 'extension/manifest.json'],
  },
]
