<template>
  <div class="dark-tech-input-container">
    <div class="input-wrapper">
      <!-- 单行输入框 -->
      <input
        v-if="!multiline"
        type="text"
        :value="modelValue || defaultValue"
        :placeholder="currentPlaceholder"
        :disabled="disabled"
        :class="['dark-tech-input', { 'is-disabled': disabled }]"
        :style="{
          width: typeof props.width === 'number' ? `${props.width}px` : props.width,
          height: typeof props.height === 'number' ? `${props.height}px` : props.height,
          fontSize: typeof props.fontSize === 'number' ? `${props.fontSize}px` : props.fontSize,
          backgroundColor: props.backgroundColor,
          color: props.textColor,
          '--placeholder-color': props.placeholderColor,
        }"
        @input="handleInput"
        @focus="handleFocus"
        @blur="handleBlur"
        @keyup.enter="handleSubmit"
      />
      
      <!-- 多行文本框 -->
      <textarea
        v-else
        ref="textareaRef"
        :value="modelValue || defaultValue"
        :placeholder="currentPlaceholder"
        :disabled="disabled"
        :rows="rows"
        :class="['dark-tech-input', 'dark-tech-textarea', { 'is-disabled': disabled, 'auto-height': autoHeight }]"
        :style="{
          width: typeof props.width === 'number' ? `${props.width}px` : props.width,
          height: autoHeight ? 'auto' : (typeof props.height === 'number' ? `${props.height}px` : props.height),
          minHeight: `${rows * 1.6}em`,
          maxHeight: autoHeight ? `${maxRows * 1.6}em` : undefined,
          fontSize: typeof props.fontSize === 'number' ? `${props.fontSize}px` : props.fontSize,
          backgroundColor: props.backgroundColor,
          color: props.textColor,
          '--placeholder-color': props.placeholderColor,
          resize: resize,
        }"
        @input="handleInput"
        @focus="handleFocus"
        @blur="handleBlur"
        @keyup.ctrl.enter="handleSubmit"
      />
      <div v-if="icon" class="input-icon">
        <component :is="icon" />
      </div>
    </div>

    <!-- 固定的按钮和工具区域 -->
    <div v-if="showSubmitButton || showFeatureTools" class="action-area">
      <!-- 小功能工具区域 - 始终存在以保持布局 -->
      <div class="feature-tools">
        <div
          v-if="showFeatureTools"
          class="feature-tool optimize-tool"
          @click="handleOptimize"
          title="优化"
        >
          <svg class="tool-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z"
              stroke="currentColor"
              stroke-width="2"
              stroke-linejoin="round"
            />
          </svg>
        </div>
      </div>

      <!-- 提交按钮 -->
      <div v-if="showSubmitButton" class="submit-button" @click="handleSubmit">
        <span class="submit-text">{{ submitButtonText }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import type { Component } from 'vue'

/**
 * DarkTechInput 组件属性接口
 * 简化版输入框组件，专注于核心功能，支持灵活的尺寸配置
 * 支持提交按钮和小功能组件，支持打字机效果，支持自定义颜色配置
 * 支持单行和多行文本输入，支持滚动查看
 */
interface Props {
  /** 输入框的值，支持 v-model 双向绑定 */
  modelValue?: string
  /** 默认文本内容 */
  defaultValue?: string
  /** 占位符文本 */
  placeholder?: string
  /** 输入框宽度，支持 px、%、rem 等单位 */
  width?: string | number
  /** 输入框高度，支持 px、%、rem 等单位 */
  height?: string | number
  /** 文字大小，支持 px、rem 等单位 */
  fontSize?: string | number
  /** 是否禁用 */
  disabled?: boolean
  /** 右侧图标组件 */
  icon?: Component
  /** 是否显示提交按钮，默认 false */
  showSubmitButton?: boolean
  /** 是否显示小功能工具，默认 false */
  showFeatureTools?: boolean
  /** 提交按钮文本 */
  submitButtonText?: string
  /** 是否启用打字机效果，默认 false */
  enableTypewriter?: boolean
  /** 打字机效果的占位数据数组 */
  placeholderArray?: string[]
  /** 打字机效果的打字速度（毫秒），默认 100ms */
  typewriterSpeed?: number
  /** 打字机效果每条数据显示完成后的停留时间（毫秒），默认 2000ms */
  typewriterDelay?: number
  /** 输入框背景色，默认为透明深色 */
  backgroundColor?: string
  /** 输入框文字颜色，默认为白色 */
  textColor?: string
  /** 占位符文字颜色，默认为半透明白色 */
  placeholderColor?: string
  /** 是否启用多行模式，默认 false */
  multiline?: boolean
  /** 多行模式下的默认行数，默认 3 */
  rows?: number
  /** 多行模式下的最大行数，默认 10 */
  maxRows?: number
  /** 是否允许用户调整大小，默认 'vertical' */
  resize?: 'none' | 'both' | 'horizontal' | 'vertical'
  /** 是否根据内容自动调整高度，默认 false */
  autoHeight?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  defaultValue: '',
  placeholder: '',
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
})

/**
 * 组件事件定义
 */
const emit = defineEmits<{
  /** 值更新事件，用于 v-model 双向绑定 */
  'update:modelValue': [value: string]
  /** 获得焦点事件 */
  focus: [event: FocusEvent]
  /** 失去焦点事件 */
  blur: [event: FocusEvent]
  /** 提交事件 */
  submit: [value: string]
  /** 优化功能事件 */
  optimize: [value: string]
}>()

const isFocused = ref(false)
const textareaRef = ref<HTMLTextAreaElement | null>(null)

// 打字机效果相关状态
const currentPlaceholderIndex = ref(0)
const displayText = ref('')
const typewriterTimer = ref<number | null>(null)
const isTyping = ref(false)

/**
 * 计算当前显示的占位符文本
 */
const currentPlaceholder = computed(() => {
  if (props.enableTypewriter && props.placeholderArray.length > 0) {
    return displayText.value
  }
  return props.placeholder
})

/**
 * 启动打字机效果
 */
const startTypewriter = () => {
  if (!props.enableTypewriter || isFocused.value) {
    return
  }
  
  // 确定要显示的文本数组
  let textArray: string[] = []
  if (props.placeholderArray.length > 0) {
    textArray = props.placeholderArray
  } else if (props.placeholder) {
    textArray = [props.placeholder]
  } else {
    return // 没有可显示的文本
  }
  
  stopTypewriter()
  isTyping.value = true
  displayText.value = ''
  
  const currentText = textArray[currentPlaceholderIndex.value]
  let charIndex = 0
  
  const typeNextChar = () => {
    if (charIndex < currentText.length) {
      displayText.value += currentText[charIndex]
      charIndex++
      typewriterTimer.value = setTimeout(typeNextChar, props.typewriterSpeed)
    } else {
      // 当前文本打字完成，等待一段时间后切换到下一条
      isTyping.value = false
      typewriterTimer.value = setTimeout(() => {
        currentPlaceholderIndex.value = (currentPlaceholderIndex.value + 1) % textArray.length
        startTypewriter()
      }, props.typewriterDelay)
    }
  }
  
  typeNextChar()
}

/**
 * 停止打字机效果
 */
const stopTypewriter = () => {
  if (typewriterTimer.value) {
    clearTimeout(typewriterTimer.value)
    typewriterTimer.value = null
  }
  isTyping.value = false
}

/**
 * 自动调整textarea高度
 */
const adjustTextareaHeight = () => {
  if (props.autoHeight && textareaRef.value) {
    const textarea = textareaRef.value
    textarea.style.height = 'auto'
    const scrollHeight = textarea.scrollHeight
    const minHeight = props.rows * 24 // 假设行高为24px
    const maxHeight = props.maxRows * 24
    const newHeight = Math.min(Math.max(scrollHeight, minHeight), maxHeight)
    textarea.style.height = `${newHeight}px`
  }
}

/**
 * 处理输入事件，更新组件值
 */
const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  // 用户开始输入时停止打字机效果
  if (target.value && props.enableTypewriter) {
    stopTypewriter()
    displayText.value = ''
  }
  emit('update:modelValue', target.value)
  
  // 如果是多行模式且启用自动高度，调整高度
  if (props.multiline && props.autoHeight) {
    adjustTextareaHeight()
  }
}

/**
 * 处理获得焦点事件
 */
const handleFocus = (event: FocusEvent) => {
  isFocused.value = true
  stopTypewriter()
  displayText.value = ''
  emit('focus', event)
}

/**
 * 处理失去焦点事件
 */
const handleBlur = (event: FocusEvent) => {
  isFocused.value = false
  // 如果输入框为空且启用打字机效果，重新启动
  if (!props.modelValue && !props.defaultValue && props.enableTypewriter) {
    setTimeout(() => {
      if (!isFocused.value) {
        startTypewriter()
      }
    }, 500)
  }
  emit('blur', event)
}

/**
 * 处理提交事件
 */
const handleSubmit = () => {
  const currentValue = props.modelValue || props.defaultValue || ''
  emit('submit', currentValue)
}

/**
 * 处理优化功能事件
 */
const handleOptimize = () => {
  const currentValue = props.modelValue || props.defaultValue || ''
  emit('optimize', currentValue)
}

// 监听打字机相关属性变化
watch(
  () => [props.enableTypewriter, props.placeholderArray, props.placeholder],
  () => {
    if (props.enableTypewriter && !isFocused.value && !props.modelValue && !props.defaultValue) {
      // 检查是否有可显示的文本（placeholderArray 或 placeholder）
      const hasText = props.placeholderArray.length > 0 || props.placeholder
      if (hasText) {
        currentPlaceholderIndex.value = 0
        startTypewriter()
      } else {
        stopTypewriter()
        displayText.value = ''
      }
    } else {
      stopTypewriter()
      displayText.value = ''
    }
  },
  { immediate: true }
)

// 监听modelValue变化，自动调整高度
watch(
  () => props.modelValue,
  () => {
    if (props.multiline && props.autoHeight) {
      setTimeout(() => {
        adjustTextareaHeight()
      }, 0)
    }
  }
)

// 组件挂载时启动打字机效果
onMounted(() => {
  if (props.enableTypewriter && !props.modelValue && !props.defaultValue) {
    const hasText = props.placeholderArray.length > 0 || props.placeholder
    if (hasText) {
      startTypewriter()
    }
  }
  
  // 如果是多行模式且启用自动高度，初始化高度
  if (props.multiline && props.autoHeight) {
    setTimeout(() => {
      adjustTextareaHeight()
    }, 0)
  }
})

// 组件卸载时清理定时器
onUnmounted(() => {
  stopTypewriter()
})
</script>

<style scoped>
.dark-tech-input-container {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

/* 基础输入框样式 */
.dark-tech-input {
  width: 100%;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: #ffffff;
  line-height: 1.6;
  transition: all 0.3s ease;
  outline: none;
  padding: 16px 20px;
  padding-right: 50px;
}

.dark-tech-input::placeholder {
  color: var(--placeholder-color, rgba(255, 255, 255, 0.4));
}

.dark-tech-input:hover {
  border-color: rgba(0, 212, 255, 0.3);
}

.dark-tech-input:focus {
  border-color: #00d4ff;
  box-shadow: 0 0 0 2px rgba(0, 212, 255, 0.2);
}

.dark-tech-input.is-disabled {
  opacity: 0.5;
  background: rgba(255, 255, 255, 0.02);
  cursor: not-allowed;
}

/* 多行文本框特殊样式 */
.dark-tech-textarea {
  line-height: 1.6;
  resize: vertical;
  overflow-y: auto;
  word-wrap: break-word;
  white-space: pre-wrap;
}
/* 自动高度模式 */
.dark-tech-textarea.auto-height {
  resize: none;
  overflow-y: hidden;
}

/* 自定义滚动条样式 */
.dark-tech-textarea::-webkit-scrollbar {
  width: 8px;
}

.dark-tech-textarea::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
}

.dark-tech-textarea::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  transition: background 0.3s ease;
}

.dark-tech-textarea::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* Firefox 滚动条样式 */
.dark-tech-textarea {
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.2) rgba(255, 255, 255, 0.05);
}

/* 图标样式 */
.input-icon {
  position: absolute;
  right: 16px;
  display: flex;
  align-items: center;
  color: rgba(255, 255, 255, 0.4);
  pointer-events: none;
}

/* 按钮和工具区域样式 */
.action-area {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
  padding: 0 4px;
}

/* 小功能工具样式 */
.feature-tools {
  display: flex;
  gap: 8px;
}

/* 提交按钮样式 */
.submit-button {
  background: rgba(0, 212, 255, 0.1);
  border: 1px solid rgba(0, 212, 255, 0.3);
  border-radius: 6px;
  padding: 8px 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  margin-left: auto; /* 确保按钮始终靠右显示 */
}

.submit-button:hover {
  background: rgba(0, 212, 255, 0.2);
  border-color: rgba(0, 212, 255, 0.5);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 212, 255, 0.2);
}

.submit-text {
  color: #00d4ff;
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
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

/* 响应式设计 */
@media (max-width: 768px) {
  .dark-tech-input {
    font-size: 16px; /* 防止iOS缩放 */
  }

  .action-area {
    margin-top: 8px;
    padding: 0 2px;
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
