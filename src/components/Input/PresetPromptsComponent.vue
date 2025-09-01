<template>
  <div v-if="showPresetPrompts && presetPrompts.length > 0" class="preset-prompts">
    <div class="preset-prompts-grid">
      <button
        v-for="(prompt, index) in presetPrompts"
        :key="index"
        :class="['preset-prompt-button', { selected: selectedPrompt === prompt.value }]"
        :disabled="disabled"
        @click="selectPrompt(prompt)"
      >
        <div v-if="prompt.icon" class="prompt-icon">
          <component :is="prompt.icon" />
        </div>
        <div class="prompt-content">
          <div class="prompt-label">{{ prompt.label }}</div>
          <div v-if="prompt.description" class="prompt-description">
            {{ prompt.description }}
          </div>
        </div>
      </button>
    </div>

    <!-- 自定义预设提示词插槽 -->
    <slot name="custom-prompts" />
  </div>
</template>

<script setup lang="ts">
import type { Component } from 'vue'

// 预设提示词接口
interface PresetPrompt {
  label: string
  value: string
  description?: string
  icon?: Component
  category?: string
}

// Props 接口定义
interface Props {
  showPresetPrompts?: boolean
  presetPrompts?: PresetPrompt[]
  selectedPrompt?: string
  title?: string
  subtitle?: string
  disabled?: boolean
  maxColumns?: number
  minButtonHeight?: string
  maxHeight?: string // 新增：最大高度限制
}

const props = withDefaults(defineProps<Props>(), {
  showPresetPrompts: false,
  presetPrompts: () => [],
  selectedPrompt: '',
  title: '预设提示词',
  subtitle: '',
  disabled: false,
  maxColumns: 3,
  minButtonHeight: '32px',
  maxHeight: '200px', // 默认最大高度
})

const emit = defineEmits<{
  'prompt-select': [prompt: PresetPrompt]
  'update:selectedPrompt': [value: string]
}>()

// 事件处理方法
const selectPrompt = (prompt: PresetPrompt) => {
  if (!props.disabled) {
    emit('update:selectedPrompt', prompt.value)
    emit('prompt-select', prompt)
  }
}
</script>

<style scoped>
/* 预设提示词容器 */
.preset-prompts {
  padding: 5px 20px 20px 20px; /* 移除顶部padding，实现与输入框紧密贴合 */
  background: rgba(255, 255, 255, 0.02);
  border-top: none; /* 完全移除顶部边框，避免与输入框产生间距 */
  border-radius: 0 0 8px 8px;
  max-height: v-bind(maxHeight);
  overflow-y: auto;
  box-sizing: border-box;
  margin-top: 0;
}

/* 标题区域 */
.preset-prompts-header {
  margin-bottom: 16px;
}

.preset-title {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
}

.preset-subtitle {
  margin: 0;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
  line-height: 1.4;
}

/* 预设提示词网格 */
.preset-prompts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 12px;
  max-width: 100%;
}

/* 预设提示词按钮 */
.preset-prompt-button {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: var(--button-preset-padding, 16px);
  background: var(--button-preset-background-color, rgba(255, 255, 255, 0.05));
  border: var(--button-preset-border-width, 1px) solid
    var(--button-preset-border-color, rgba(255, 255, 255, 0.1));
  border-radius: var(--button-preset-border-radius, 8px);
  color: var(--button-preset-text-color, rgba(255, 255, 255, 0.8));
  text-align: left;
  cursor: pointer;
  transition: var(--button-preset-transition, all 0.2s ease);
  min-height: v-bind(minButtonHeight);
  box-sizing: border-box;
  font-size: var(--button-preset-font-size, 14px);
  font-weight: var(--button-preset-font-weight, 500);
}

.preset-prompt-button:hover:not(:disabled) {
  background: var(--button-preset-hover-background-color, rgba(255, 255, 255, 0.08));
  border-color: var(--button-preset-hover-border-color, rgba(0, 212, 255, 0.3));
  color: var(--button-preset-hover-text-color, rgba(255, 255, 255, 0.95));
  transform: var(--button-preset-hover-transform, translateY(-1px));
}

.preset-prompt-button:active:not(:disabled) {
  transform: translateY(0);
}

.preset-prompt-button.selected {
  background: rgba(0, 212, 255, 0.15);
  border-color: #00d4ff;
  color: #00d4ff;
}

.preset-prompt-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 提示词图标 */
.prompt-icon {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.6);
  margin-top: 2px;
}

.preset-prompt-button.selected .prompt-icon {
  color: #00d4ff;
}

/* 提示词内容 */
.prompt-content {
  flex: 1;
  min-width: 0;
}

.prompt-label {
  font-size: 14px;
  font-weight: 500;
  line-height: 1.4;
  margin-bottom: 4px;
  word-wrap: break-word;
}

.prompt-description {
  font-size: 12px;
  line-height: 1.4;
  color: rgba(255, 255, 255, 0.5);
  word-wrap: break-word;
}

.preset-prompt-button.selected .prompt-description {
  color: rgba(0, 212, 255, 0.8);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .preset-prompts {
    padding: 16px;
  }

  .preset-prompts-grid {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .preset-prompt-button {
    padding: 14px;
    gap: 10px;
    min-height: 32px;
  }

  .preset-title {
    font-size: 15px;
  }

  .preset-subtitle {
    font-size: 13px;
  }

  .prompt-icon {
    width: 20px;
    height: 20px;
  }

  .prompt-label {
    font-size: 13px;
  }

  .prompt-description {
    font-size: 11px;
  }
}

@media (max-width: 480px) {
  .preset-prompts {
    padding: 12px;
  }

  .preset-prompts-grid {
    gap: 8px;
  }

  .preset-prompt-button {
    padding: 12px;
    gap: 8px;
    min-height: 32px;
  }

  .preset-prompts-header {
    margin-bottom: 12px;
  }
}

/* 网格列数限制 */
@media (min-width: 1200px) {
  .preset-prompts-grid {
    grid-template-columns: repeat(v-bind(maxColumns), 1fr);
  }
}

/* 滚动条样式 */
.preset-prompts::-webkit-scrollbar {
  width: 6px;
}

.preset-prompts::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 3px;
}

.preset-prompts::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}

.preset-prompts::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}

.preset-prompts {
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.2) rgba(255, 255, 255, 0.05);
}
</style>
