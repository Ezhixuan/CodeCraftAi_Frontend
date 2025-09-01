<template>
  <div class="markdown-content" v-html="renderedHtml"></div>
</template>

<script setup lang="ts">
import { computed, onMounted, nextTick } from 'vue'
import MarkdownIt from 'markdown-it'
import 'highlight.js/lib/common'
import hljs from 'highlight.js'

const props = defineProps<{
  content: string
}>()

// 创建MarkdownIt实例并配置代码高亮功能
var md = MarkdownIt({
  highlight: function (str, lang) {
    // 处理语言别名，特别是 Vue 相关的语言
    const language = getLanguageAlias(lang)

    if (language && hljs.getLanguage(language)) {
      try {
        return hljs.highlight(str, { language }).value
      } catch (__) {}
    }

    // 返回转义后的原始代码
    return md.utils.escapeHtml(str)
  },
})

// 获取语言别名映射
const getLanguageAlias = (lang: string): string => {
  const aliases: Record<string, string> = {
    vue: 'xml',
    html: 'xml',
    xml: 'xml',
    js: 'javascript',
    ts: 'typescript',
    jsx: 'javascript',
    tsx: 'typescript',
    py: 'python',
    bash: 'bash',
    shell: 'bash',
    sh: 'bash',
  }

  return aliases[lang] || lang
}

// 保存原始的 fence 渲染器
const defaultFenceRenderer = md.renderer.rules.fence!

md.renderer.rules.fence = (tokens, idx, options, env, self) => {
  const token = tokens[idx]
  const lang = token.info ? token.info.trim() : 'plaintext'

  // 使用原始渲染器获取高亮后的 HTML
  const highlightedCode = defaultFenceRenderer(tokens, idx, options, env, self)

  // 生成唯一的 ID
  const id = `code-block-${Math.random().toString(36).substring(2, 9)}`
  const rawCodeId = `raw-code-${id}`

  // 创建自定义的 HTML 结构
  return `
    <div class="code-block-wrapper">
      <div class="code-block-header">
        <span class="language-tag">${lang || 'plaintext'}</span>
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
    // 添加点击事件监听器实现代码复制功能
    const copyButtons = document.querySelectorAll('.copy-code-btn')
    copyButtons.forEach((button) => {
      button.addEventListener('click', () => {
        const targetId = button.getAttribute('data-clipboard-target')
        if (targetId) {
          const targetElement = document.querySelector(targetId)
          if (targetElement) {
            const textToCopy = (targetElement as HTMLTextAreaElement).value

            // 尝试使用现代 Clipboard API
            if (navigator.clipboard) {
              navigator.clipboard
                .writeText(textToCopy)
                .then(() => {
                  const originalText = button.textContent
                  button.textContent = '已复制!'
                  setTimeout(() => {
                    button.textContent = originalText
                  }, 2000)
                })
                .catch(() => {
                  fallbackCopyTextToClipboard(textToCopy, button)
                })
            } else {
              fallbackCopyTextToClipboard(textToCopy, button)
            }
          }
        }
      })
    })
  })
})

// 降级复制功能实现
function fallbackCopyTextToClipboard(text: string, button: Element) {
  const textArea = document.createElement('textarea')
  textArea.value = text

  // 避免滚动到底部
  textArea.style.top = '0'
  textArea.style.left = '0'
  textArea.style.position = 'fixed'
  textArea.style.opacity = '0'

  document.body.appendChild(textArea)
  textArea.focus()
  textArea.select()

  try {
    const successful = document.execCommand('copy')
    const originalText = button.textContent
    button.textContent = successful ? '已复制!' : '复制失败'
    setTimeout(() => {
      button.textContent = originalText
    }, 2000)
  } catch (err) {
    const originalText = button.textContent
    button.textContent = '复制失败'
    setTimeout(() => {
      button.textContent = originalText
    }, 2000)
  }

  document.body.removeChild(textArea)
}
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
  background-color: #1e1e1e;
  /* 深色背景 */
  color: #d4d4d4;
  /* 亮色文字 */
  border-radius: 8px;
  margin: 1em 0;
  overflow: hidden;
  /* 确保子元素圆角生效 */
  position: relative;
  max-width: 100%;
  /* 确保代码块容器不会超出父容器 */
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
  font-family: 'SF Mono', 'Monaco', 'Consolas', monospace;
  font-size: 14px;
  line-height: 1.5;
}

.markdown-content :deep(.code-block-header) {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background-color: #2d2d30;
  /* 稍亮的头部背景 */
  font-size: 12px;
}

.markdown-content :deep(.language-tag) {
  color: #94a3b8;
  font-family: monospace;
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.markdown-content :deep(.copy-code-btn) {
  background-color: #334155;
  color: #e2e8f0;
  border: none;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s ease;
  outline: none;
}

.markdown-content :deep(.copy-code-btn:hover) {
  background-color: #475569;
  transform: translateY(-1px);
}

.markdown-content :deep(.copy-code-btn:active) {
  transform: translateY(0);
}

.markdown-content :deep(.code-block-content) {
  margin: 0;
  padding: 16px;
  overflow-x: auto;
  background-color: #1e1e1e;
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

/* 行内代码样式增强 */
.markdown-content :deep(code) {
  background: rgba(128, 128, 128, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'SF Mono', 'Monaco', monospace;
  font-size: 0.9em;
  color: #333;
  border: 1px solid rgba(128, 128, 128, 0.15);
}

/* 代码高亮样式增强 */
.markdown-content :deep(.hljs-comment),
.markdown-content :deep(.hljs-quote) {
  color: #6a9955;
  font-style: italic;
}

.markdown-content :deep(.hljs-keyword),
.markdown-content :deep(.hljs-selector-tag),
.markdown-content :deep(.hljs-literal),
.markdown-content :deep(.hljs-type),
.markdown-content :deep(.hljs-addition) {
  color: #569cd6;
}

.markdown-content :deep(.hljs-number),
.markdown-content :deep(.hljs-class .hljs-title) {
  color: #b5cea8;
}

.markdown-content :deep(.hljs-string),
.markdown-content :deep(.hljs-meta-string) {
  color: #ce9178;
}

.markdown-content :deep(.hljs-regexp),
.markdown-content :deep(.hljs-template-tag) {
  color: #d16969;
}

.markdown-content :deep(.hljs-subst),
.markdown-content :deep(.hljs-function),
.markdown-content :deep(.hljs-title),
.markdown-content :deep(.hljs-params),
.markdown-content :deep(.hljs-formula) {
  color: #dcdcaa;
}

.markdown-content :deep(.hljs-name),
.markdown-content :deep(.hljs-selector-id),
.markdown-content :deep(.hljs-selector-class),
.markdown-content :deep(.hljs-section),
.markdown-content :deep(.hljs-type) {
  color: #d7ba7d;
}

.markdown-content :deep(.hljs-attribute),
.markdown-content :deep(.hljs-variable),
.markdown-content :deep(.hljs-template-variable),
.markdown-content :deep(.hljs-link),
.markdown-content :deep(.hljs-selector-attr),
.markdown-content :deep(.hljs-selector-pseudo) {
  color: #9cdcfe;
}

.markdown-content :deep(.hljs-built_in),
.markdown-content :deep(.hljs-deletion) {
  color: #4ec9b0;
}

.markdown-content :deep(.hljs-emphasis) {
  font-style: italic;
}

.markdown-content :deep(.hljs-strong) {
  font-weight: bold;
}
</style>
