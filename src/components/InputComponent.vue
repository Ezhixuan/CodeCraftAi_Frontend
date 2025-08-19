<template>
  <div
    :class="['dark-tech-input-wrapper', { 'is-focused': isFocused, 'is-disabled': disabled }]"
    :style="wrapperStyle"
  >
    <div class="input-area" :style="inputAreaStyle">
      <input
        v-if="!multiline"
        type="text"
        :value="currentValue"
        :placeholder="currentPlaceholder"
        :disabled="disabled"
        class="dark-tech-input-element"
        :style="inputElementStyle"
        @input="handleInput"
        @focus="handleFocus"
        @blur="handleBlur"
        @keyup.enter="handleSubmit"
      />
      <textarea
        v-else
        ref="textareaRef"
        :value="currentValue"
        :placeholder="currentPlaceholder"
        :disabled="disabled"
        :rows="rows"
        :class="['dark-tech-input-element', { 'auto-height': autoHeight }]"
        :style="inputElementStyle"
        @input="handleInput"
        @focus="handleFocus"
        @blur="handleBlur"
        @keyup.ctrl.enter="handleSubmit"
      />
      <div v-if="icon" class="input-icon">
        <component :is="icon" />
      </div>
      <div v-if="showSubmitButton || showFeatureTools" class="action-area">
        <div class="feature-tools">
          <div
            v-if="showFeatureTools"
            class="feature-tool optimize-tool"
            @click="handleOptimize"
            title="优化"
          >
            <svg
              class="tool-icon"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z"
                stroke="currentColor"
                stroke-width="2"
                stroke-linejoin="round"
              />
            </svg>
          </div>
        </div>
        <div v-if="showSubmitButton" class="submit-button" @click="handleSubmit">
          <span class="submit-text">{{ submitButtonText }}</span>
        </div>
      </div>
    </div>

    <div v-if="showPresetPrompts && presetPrompts.length > 0" class="preset-prompts-container">
      <button
        v-for="prompt in presetPrompts"
        :key="prompt.key"
        class="preset-prompt-button"
        :style="promptButtonStyle"
        @click="handlePromptClick(prompt.value)"
      >
        {{ prompt.key }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Component, CSSProperties } from 'vue'
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'

// Props 和 Emits 定义与之前相同，此处省略以保持简洁...
interface Props {
  modelValue?: string
  defaultValue?: string
  placeholder?: string
  width?: string | number
  height?: string | number
  fontSize?: string | number
  disabled?: boolean
  icon?: Component
  showSubmitButton?: boolean
  showFeatureTools?: boolean
  submitButtonText?: string
  enableTypewriter?: boolean
  placeholderArray?: string[]
  typewriterSpeed?: number
  typewriterDelay?: number
  backgroundColor?: string
  textColor?: string
  placeholderColor?: string
  multiline?: boolean
  rows?: number
  maxRows?: number
  resize?: 'none' | 'both' | 'horizontal' | 'vertical'
  autoHeight?: boolean
  /** 是否显示预设提示词 */
  showPresetPrompts?: boolean
  /** 预设提示词数组，格式为 { key: string, value: string }[] */
  presetPrompts?: PresetPrompt[]
  /** 提示词按钮文字颜色 */
  promptTextColor?: string
  /** 提示词按钮背景颜色 */
  promptBackgroundColor?: string
  /** 提示词按钮文字大小 */
  promptFontSize?: string | number
}

// 定义 presetPrompts 数组中对象的类型
interface PresetPrompt {
  key: string
  value: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  defaultValue: '',
  placeholder: '请输入内容...',
  width: '100%',
  height: '56px',
  fontSize: '16px',
  disabled: false,
  icon: undefined,
  showSubmitButton: false,
  showFeatureTools: false,
  submitButtonText: '提交',
  enableTypewriter: false,
  placeholderArray: () => [],
  typewriterSpeed: 100,
  typewriterDelay: 2000,
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
  textColor: '#ffffff',
  placeholderColor: 'rgba(255, 255, 255, 0.4)',
  multiline: false,
  rows: 3,
  maxRows: 10,
  resize: 'vertical',
  autoHeight: false,
  showPresetPrompts: false,
  presetPrompts: () => [],
  promptTextColor: '#E0E0E0',
  promptBackgroundColor: 'rgba(255, 255, 255, 0.1)',
  promptFontSize: '12px',
})
const emit = defineEmits<{
  'update:modelValue': [value: string]
  focus: [event: FocusEvent]
  blur: [event: FocusEvent]
  submit: [value: string]
  optimize: [value: string]
}>()

const isFocused = ref(false)
const textareaRef = ref<HTMLTextAreaElement | null>(null)
const currentPlaceholderIndex = ref(0)
const displayText = ref('')
const typewriterTimer = ref<number | null>(null)

// --- 计算属性 ---

const currentValue = computed(() => props.modelValue || props.defaultValue)

const typewriterTextArray = computed(() => {
  if (props.placeholderArray.length > 0) return props.placeholderArray
  if (props.placeholder) return [props.placeholder]
  return []
})

const currentPlaceholder = computed(() => {
  if (props.enableTypewriter && typewriterTextArray.value.length > 0) {
    return displayText.value
  }
  return props.placeholder
})

/**
 * @description 计算【整体包裹层】的动态样式
 */
const wrapperStyle = computed<CSSProperties>(() => ({
  width: typeof props.width === 'number' ? `${props.width}px` : props.width,
  backgroundColor: props.backgroundColor,
  '--placeholder-color': props.placeholderColor,
  // 当自动高度时，总高度由内容决定
  minHeight: props.autoHeight
    ? undefined
    : typeof props.height === 'number'
      ? `${props.height}px`
      : props.height,
}))

/**
 * @description 计算【输入区域】的动态样式
 */
const inputAreaStyle = computed<CSSProperties>(() => ({
  height: props.autoHeight
    ? 'auto'
    : typeof props.height === 'number'
      ? `${props.height}px`
      : props.height,
  minHeight: props.multiline ? `${props.rows * 1.6}em` : undefined,
  maxHeight: props.multiline && props.autoHeight ? `${props.maxRows * 1.6}em` : undefined,
}))

/**
 * @description 计算【内部输入元素】的动态样式
 */
const inputElementStyle = computed<CSSProperties>(() => ({
  fontSize: typeof props.fontSize === 'number' ? `${props.fontSize}px` : props.fontSize,
  color: props.textColor,
  resize: props.multiline ? props.resize : 'none',
  paddingBottom: props.showSubmitButton || props.showFeatureTools ? '52px' : '16px',
}))

/**
 * @description 计算【预设提示词按钮】的动态样式
 */
const promptButtonStyle = computed<CSSProperties>(() => ({
  color: props.promptTextColor,
  backgroundColor: props.promptBackgroundColor,
  fontSize:
    typeof props.promptFontSize === 'number' ? `${props.promptFontSize}px` : props.promptFontSize,
}))

// --- 方法 ---

/**
 * @description 处理点击预设提示词按钮的事件
 */
const handlePromptClick = (value: string) => {
  emit('update:modelValue', value)
  // 点击后自动聚焦到输入框，优化体验
  textareaRef.value?.focus()
}

const startTypewriter = () => {
  if (!props.enableTypewriter || isFocused.value || typewriterTextArray.value.length === 0) return
  stopTypewriter()
  displayText.value = ''
  const textArray = typewriterTextArray.value
  const currentText = textArray[currentPlaceholderIndex.value]
  let charIndex = 0
  const typeNextChar = () => {
    if (charIndex < currentText.length) {
      displayText.value += currentText[charIndex]
      charIndex++
      typewriterTimer.value = window.setTimeout(typeNextChar, props.typewriterSpeed)
    } else {
      typewriterTimer.value = window.setTimeout(() => {
        currentPlaceholderIndex.value = (currentPlaceholderIndex.value + 1) % textArray.length
        startTypewriter()
      }, props.typewriterDelay)
    }
  }
  typeNextChar()
}

const stopTypewriter = () => {
  if (typewriterTimer.value) clearTimeout(typewriterTimer.value)
  typewriterTimer.value = null
}

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement | HTMLTextAreaElement
  if (target.value && props.enableTypewriter) {
    stopTypewriter()
    displayText.value = ''
  }
  emit('update:modelValue', target.value)
  if (props.multiline && props.autoHeight) {
    adjustTextareaHeight()
  }
}

const handleFocus = (event: FocusEvent) => {
  isFocused.value = true
  stopTypewriter()
  displayText.value = ''
  emit('focus', event)
}

const handleBlur = (event: FocusEvent) => {
  isFocused.value = false
  if (!currentValue.value && props.enableTypewriter) {
    setTimeout(() => {
      if (!isFocused.value) startTypewriter()
    }, 300)
  }
  emit('blur', event)
}
const handleSubmit = () => emit('submit', currentValue.value)
const handleOptimize = () => emit('optimize', currentValue.value)
const adjustTextareaHeight = () => {
  if (props.autoHeight && textareaRef.value) {
    const textarea = textareaRef.value
    textarea.style.height = 'auto'
    textarea.style.height = `${textarea.scrollHeight}px`
  }
}

// --- 生命周期钩子 & 监听 ---

watch(
  () => [props.enableTypewriter, typewriterTextArray.value],
  () => {
    if (props.enableTypewriter && !isFocused.value && !currentValue.value) {
      currentPlaceholderIndex.value = 0
      startTypewriter()
    } else {
      stopTypewriter()
      displayText.value = ''
    }
  },
  { immediate: true },
)

watch(currentValue, () => {
  if (props.multiline && props.autoHeight) {
    nextTick(adjustTextareaHeight)
  }
})

onMounted(() => {
  if (props.enableTypewriter && !currentValue.value) startTypewriter()
  if (props.multiline && props.autoHeight) nextTick(adjustTextareaHeight)
})

onUnmounted(() => {
  stopTypewriter()
})
</script>

<style scoped>
/* 视觉包裹层样式 */
.dark-tech-input-wrapper {
  position: relative;
  display: flex;
  flex-direction: column; /* 垂直布局 */
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  transition: all 0.3s ease;
  box-sizing: border-box;
  overflow: hidden; /* 防止子元素圆角溢出 */
}

.dark-tech-input-wrapper:hover {
  border-color: rgba(0, 212, 255, 0.3);
}
.dark-tech-input-wrapper:focus-within {
  border-color: #00d4ff;
  box-shadow: 0 0 0 2px rgba(0, 212, 255, 0.2);
}
.dark-tech-input-wrapper.is-disabled {
  opacity: 0.5;
  background: rgba(255, 255, 255, 0.02);
  cursor: not-allowed;
}

.input-area {
  position: relative;
  display: flex; /* 让textarea能撑满 */
  flex-shrink: 0; /* 防止被压缩 */
}

/* 内部输入元素样式，本身是“透明”的 */
.dark-tech-input-element {
  width: 100%;
  height: 100%;
  padding: 16px 50px 16px 20px;
  background: transparent;
  border: none;
  outline: none;
  line-height: 1.6;
  font-family: inherit;
  box-sizing: border-box;
  word-wrap: break-word;
  white-space: pre-wrap;
  color: #ffffff; /* 确保颜色不从wrapper继承 */
}

.dark-tech-input-element::placeholder {
  color: var(--placeholder-color, rgba(255, 255, 255, 0.4));
}

.dark-tech-input-element.auto-height {
  resize: none;
  overflow-y: hidden;
}

.preset-prompts-container {
  display: flex;
  flex-wrap: wrap; /* 关键：自动换行 */
  gap: 8px; /* 按钮之间的间距 */
  padding: 8px 12px 12px; /* 内部留白 */
  border-top: 1px solid rgba(255, 255, 255, 0.08); /* 与输入区 slight 分隔 */
}
.preset-prompt-button {
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 4px 10px;
  border-radius: 16px; /* 胶囊形状 */
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap; /* 按钮文字不换行 */
  flex-shrink: 0;
}
.preset-prompt-button:hover {
  transform: translateY(-2px);
  border-color: #00d4ff;
  background-color: rgba(0, 212, 255, 0.2) !important;
}

/* 滚动条样式 */
.dark-tech-input-element::-webkit-scrollbar {
  width: 8px;
}
.dark-tech-input-element::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
}
.dark-tech-input-element::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
}
.dark-tech-input-element::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}
.dark-tech-input-element {
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.2) rgba(255, 255, 255, 0.05);
}

/* 图标样式 */
.input-icon {
  position: absolute;
  right: 16px;
  top: 16px; /* 固定在顶部，不再垂直居中，避免自适应高度时位置不确定 */
  display: flex;
  align-items: center;
  color: rgba(255, 255, 255, 0.4);
  pointer-events: none;
  height: 24px;
}

/* 操作区样式 */
.input-icon {
  position: absolute;
  right: 16px;
  top: 16px;
  display: flex;
  align-items: center;
  color: rgba(255, 255, 255, 0.4);
  pointer-events: none;
  height: 24px;
}
.action-area {
  position: absolute;
  bottom: 12px;
  left: 12px;
  right: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  pointer-events: none;
}
.action-area > * {
  pointer-events: auto;
}

.feature-tools {
  display: flex;
  gap: 8px;
}

.submit-button {
  background: rgba(0, 212, 255, 0.1);
  border: 1px solid rgba(0, 212, 255, 0.3);
  border-radius: 6px;
  padding: 6px 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}
.submit-text {
  color: #00d4ff;
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
}

.submit-button:hover {
  background: rgba(0, 212, 255, 0.2);
  border-color: rgba(0, 212, 255, 0.5);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 212, 255, 0.2);
}

.feature-tool {
  width: 32px;
  height: 32px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}
.feature-tool:hover {
  background: rgba(0, 212, 255, 0.1);
  border-color: rgba(0, 212, 255, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 212, 255, 0.1);
}
.tool-icon {
  width: 16px;
  height: 16px;
  color: rgba(255, 255, 255, 0.6);
  transition: color 0.3s ease;
}
.feature-tool:hover .tool-icon {
  color: #00d4ff;
}

@media (max-width: 768px) {
  .dark-tech-input-element {
    font-size: 16px;
  }
  .submit-button {
    padding: 6px 12px;
  }
  .submit-text {
    font-size: 12px;
  }
  .feature-tool {
    width: 28px;
    height: 28px;
  }
  .tool-icon {
    width: 14px;
    height: 14px;
  }
}
</style>
