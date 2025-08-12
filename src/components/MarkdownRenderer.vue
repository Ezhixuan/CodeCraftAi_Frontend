<template>
  <div class="markdown-content" v-html="renderedHtml"></div>
</template>

<script setup lang="ts">
import { computed, onMounted, nextTick } from 'vue'
import MarkdownIt from 'markdown-it'
import Prism from 'prismjs'
import Clipboard from 'clipboard'
import 'prismjs/themes/prism-tomorrow.css'
import 'prismjs/components/prism-javascript'
import 'prismjs/components/prism-typescript'
import 'prismjs/components/prism-python'
import 'prismjs/components/prism-java'
import 'prismjs/components/prism-css'
import 'prismjs/components/prism-json'
import 'prismjs/components/prism-bash'
import 'prismjs/components/prism-sql'

const props = defineProps<{
  content: string
}>()

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  highlight: (str, lang) => {
    if (lang && Prism.languages[lang]) {
      try {
        return Prism.highlight(str, Prism.languages[lang], lang)
      } catch {
        // ignore
      }
    }
    return '' // use external default escaping
  }
})

// 保存原始的 fence 渲染器
const defaultFenceRenderer = md.renderer.rules.fence!

md.renderer.rules.fence = (tokens, idx, options, env, self) => {
  const token = tokens[idx]
  const lang = token.info ? token.info.split(' ')[0] : 'plaintext'

  // 使用原始渲染器获取高亮后的 HTML
  const highlightedCode = defaultFenceRenderer(tokens, idx, options, env, self)

  // 生成唯一的 ID
  const id = `code-block-${Math.random().toString(36).substring(2, 9)}`
  const rawCodeId = `raw-code-${id}`

  // 创建自定义的 HTML 结构
  return `
    <div class="code-block-wrapper">
      <div class="code-block-header">
        <span class="language-tag">${lang}</span>
        <button class="copy-code-btn" data-clipboard-target="#${rawCodeId}">复制</button>
      </div>
      <div class="code-block-content">${highlightedCode}</div>
      <textarea id="${rawCodeId}" style="position: absolute; left: -9999px; opacity: 0;">${token.content.trim()}</textarea>
    </div>
  `
}

const renderedHtml = computed(() => md.render(props.content))

onMounted(() => {
  nextTick(() => {
    const clipboard = new Clipboard('.copy-code-btn')
    clipboard.on('success', (e) => {
      e.trigger.textContent = '已复制!'
      setTimeout(() => {
        e.trigger.textContent = '复制'
      }, 2000)
      e.clearSelection()
    })
    clipboard.on('error', (e) => {
      e.trigger.textContent = '复制失败'
      setTimeout(() => {
        e.trigger.textContent = '复制'
      }, 2000)
    })
  })
})
</script>

<style scoped>
.markdown-content {
  line-height: 1.7;
  font-size: 14px;
  word-break: break-word;
  /* 解决长单词或URL溢出问题 */
  overflow-wrap: break-word;
  /* 确保长内容能够换行 */
}

.markdown-content :deep(p:first-child),
.markdown-content :deep(h1:first-child),
.markdown-content :deep(h2:first-child),
.markdown-content :deep(h3:first-child) {
  margin-top: 0;
}

.markdown-content :deep(p:last-child) {
  margin-bottom: 0;
}

.markdown-content :deep(h1),
.markdown-content :deep(h2),
.markdown-content :deep(h3) {
  margin: 1.2em 0 0.6em;
  font-weight: 600;
  color: #111827;
}

.markdown-content :deep(pre) {
  margin: 0;
  padding: 16px;
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-word;
  background: transparent;
  color: inherit;
  max-width: 100%;
  /* 确保代码块不会超出容器宽度 */
}

/* 代码块容器 */
.markdown-content :deep(.code-block-wrapper) {
  background-color: #0f172a;
  /* 深色背景 */
  color: #e2e8f0;
  /* 亮色文字 */
  border-radius: 8px;
  margin: 1em 0;
  overflow: hidden;
  /* 确保子元素圆角生效 */
  position: relative;
  max-width: 100%;
  /* 确保代码块容器不会超出父容器 */
}

.markdown-content :deep(.code-block-header) {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background-color: #1e293b;
  /* 稍亮的头部背景 */
  font-size: 12px;
}

.markdown-content :deep(.language-tag) {
  color: #94a3b8;
  font-family: monospace;
}

.markdown-content :deep(.copy-code-btn) {
  background-color: #334155;
  color: #e2e8f0;
  border: none;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: background-color 0.2s;
}

.markdown-content :deep(.copy-code-btn:hover) {
  background-color: #475569;
}

.markdown-content :deep(code) {
  background: rgba(0, 0, 0, 0.05);
  padding: 2px 5px;
  border-radius: 4px;
  font-family: 'SF Mono', 'Monaco', monospace;
  font-size: 0.9em;
}

.markdown-content :deep(pre code) {
  background: none;
  padding: 0;
  font-size: inherit;
  color: inherit;
}
</style>
