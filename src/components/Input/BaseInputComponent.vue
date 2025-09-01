<template>
  <div
    :class="['base-input-wrapper', { 'is-focused': isFocused, 'is-disabled': disabled }]"
    :style="wrapperStyle"
  >
    <div class="input-area" :style="inputAreaStyle">
      <input
        v-if="!multiline"
        type="text"
        :value="currentValue"
        :placeholder="currentPlaceholder"
        :disabled="disabled"
        class="base-input-element"
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
        :class="['base-input-element', { 'auto-height': autoHeight }]"
        :style="inputElementStyle"
        @input="handleInput"
        @focus="handleFocus"
        @blur="handleBlur"
        @keyup.ctrl.enter="handleSubmit"
      />
      <div v-if="icon" class="input-icon">
        <component :is="icon" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Component, CSSProperties } from 'vue'
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'

// Props 接口定义
interface Props {
  modelValue?: string
  defaultValue?: string
  placeholder?: string
  width?: string | number
  height?: string | number
  fontSize?: string | number
  disabled?: boolean
  icon?: Component
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
  paddingBottom?: string
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
  paddingBottom: '16px',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  focus: [event: FocusEvent]
  blur: [event: FocusEvent]
  submit: [value: string]
}>()

// 响应式状态
const isFocused = ref(false)
const textareaRef = ref<HTMLTextAreaElement | null>(null)
const currentPlaceholderIndex = ref(0)
const displayText = ref('')
const typewriterTimer = ref<number | null>(null)

// 计算属性
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

const wrapperStyle = computed<CSSProperties>(() => ({
  width: typeof props.width === 'number' ? `${props.width}px` : props.width,
  backgroundColor: props.backgroundColor,
  '--placeholder-color': props.placeholderColor,
  minHeight: props.autoHeight
    ? undefined
    : typeof props.height === 'number'
      ? `${props.height}px`
      : props.height,
}))

const inputAreaStyle = computed<CSSProperties>(() => ({
  height: props.autoHeight
    ? 'auto'
    : typeof props.height === 'number'
      ? `${props.height}px`
      : props.height,
  minHeight: props.multiline ? `${props.rows * 1.6}em` : undefined,
  maxHeight: props.multiline && props.autoHeight ? `${props.maxRows * 1.6}em` : undefined,
}))

const inputElementStyle = computed<CSSProperties>(() => ({
  fontSize: typeof props.fontSize === 'number' ? `${props.fontSize}px` : props.fontSize,
  color: props.textColor,
  resize: props.multiline ? props.resize : 'none',
  paddingBottom: props.paddingBottom,
}))

// 打字机效果方法
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

// 事件处理方法
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

const adjustTextareaHeight = () => {
  if (props.autoHeight && textareaRef.value) {
    const textarea = textareaRef.value
    textarea.style.height = 'auto'
    textarea.style.height = `${textarea.scrollHeight}px`
  }
}

// 生命周期钩子和监听器
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
/* 基础输入组件样式 */
.base-input-wrapper {
  position: relative;
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  transition: all 0.3s ease;
  box-sizing: border-box;
  overflow: hidden;
}

.base-input-wrapper:hover {
  border-color: rgba(0, 212, 255, 0.3);
}

.base-input-wrapper:focus-within {
  border-color: #00d4ff;
  box-shadow: 0 0 0 2px rgba(0, 212, 255, 0.2);
}

.base-input-wrapper.is-disabled {
  opacity: 0.5;
  background: rgba(255, 255, 255, 0.02);
  cursor: not-allowed;
}

.input-area {
  position: relative;
  display: flex;
  flex-shrink: 0;
}

/* 输入元素样式 */
.base-input-element {
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
  color: #ffffff;
}

.base-input-element::placeholder {
  color: var(--placeholder-color, rgba(255, 255, 255, 0.4));
}

.base-input-element.auto-height {
  resize: none;
  overflow-y: hidden;
}

/* 滚动条样式 */
.base-input-element::-webkit-scrollbar {
  width: 8px;
}

.base-input-element::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
}

.base-input-element::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
}

.base-input-element::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}

.base-input-element {
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.2) rgba(255, 255, 255, 0.05);
}

/* 图标样式 */
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

@media (max-width: 768px) {
  .base-input-element {
    font-size: 16px;
  }
}
</style>