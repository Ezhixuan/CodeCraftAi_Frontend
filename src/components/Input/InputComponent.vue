<template>
  <!-- 外层容器 -->
  <div class="input-container">
    <!-- 输入框区域 -->
    <div
      :class="['input-wrapper', { 'is-focused': isFocused, 'is-disabled': disabled }]"
      :style="wrapperStyle"
    >
      <!-- 核心输入框组件 -->
      <BaseInputComponent
        :model-value="modelValue"
        :default-value="defaultValue"
        :placeholder="placeholder"
        :width="width"
        :height="height"
        :font-size="fontSize"
        :disabled="disabled"
        :icon="icon"
        :enable-typewriter="enableTypewriter"
        :placeholder-array="placeholderArray"
        :typewriter-speed="typewriterSpeed"
        :typewriter-delay="typewriterDelay"
        :background-color="backgroundColor"
        :text-color="textColor"
        :placeholder-color="placeholderColor"
        :multiline="multiline"
        :rows="rows"
        :max-rows="maxRows"
        :resize="resize"
        :auto-height="autoHeight"
        :padding-bottom="paddingBottom"
        @update:model-value="handleInputChange"
        @focus="handleFocus"
        @blur="handleBlur"
        @submit="handleSubmit"
      />

      <!-- 提交按钮 - 右下角 -->
      <div class="submit-area">
        <button
          :class="['submit-button', { 'disabled': required && !currentValue.trim() }]"
          :disabled="disabled || (required && !currentValue.trim())"
          @click="handleSubmit"
        >
          <component :is="submitIcon" v-if="submitIcon" />
          <span v-if="props.submitButtonText">{{ props.submitButtonText }}</span>
        </button>
      </div>

      <!-- 工具栏区域 - 左下角 -->
      <div class="tools-area">
        <FeatureToolsComponent
          :show-optimize-button="showOptimizeButton"
          :optimize-icon="optimizeIcon"
          :optimize-text="optimizeText"
          :is-optimizing="isOptimizing"
          :show-dropdown-tool="showDropdownTool"
          :dropdown-icon="dropdownIcon"
          :dropdown-text="dropdownText"
          :dropdown-options="dropdownOptions"
          :dropdown-value="dropdownValue"
          :dropdown-placeholder="dropdownPlaceholder"
          :disabled="disabled"
          @optimize="handleOptimize"
          @update:dropdown-value="handleDropdownChange"
          @dropdown-change="handleDropdownSelect"
        />
      </div>
    </div>

    <!-- 预设提示词区域 - 输入框外部正下方 -->
    <PresetPromptsComponent
      :show-preset-prompts="showPresetPrompts"
      :preset-prompts="presetPrompts"
      :selected-prompt="selectedPrompt"
      :title="presetPromptsTitle"
      :subtitle="presetPromptsSubtitle"
      :disabled="disabled"
      :max-columns="presetPromptsMaxColumns"
      :min-button-height="presetPromptsMinHeight"
      :max-height="undefined"
      @prompt-select="handlePromptSelect"
      @update:selected-prompt="handleSelectedPromptChange"
    />
  </div>
</template>

<script setup lang="ts">
import type { Component, CSSProperties } from 'vue'
import { computed, ref } from 'vue'
import BaseInputComponent from './BaseInputComponent.vue'
import FeatureToolsComponent from './FeatureToolsComponent.vue'
import PresetPromptsComponent from './PresetPromptsComponent.vue'

// 预设提示词接口
interface PresetPrompt {
  label: string
  value: string
  description?: string
  icon?: Component
  category?: string
}

// 定义下拉选择框选项的类型
interface DropdownOption {
  label: string
  value: string | number
}

// 按钮样式配置接口
interface ButtonStyleConfig {
  width?: string
  height?: string
  minWidth?: string
  minHeight?: string
  backgroundColor?: string
  borderColor?: string
  textColor?: string
  fontSize?: string
  fontWeight?: string
  borderRadius?: string
  padding?: string
  borderWidth?: string
  // hover状态样式
  hoverBackgroundColor?: string
  hoverBorderColor?: string
  hoverTextColor?: string
  hoverTransform?: string
  // 其他效果
  boxShadow?: string
  backdropFilter?: string
  transition?: string
}

// 按钮样式集合接口
interface ButtonStyles {
  submit?: ButtonStyleConfig
  tool?: ButtonStyleConfig
  preset?: ButtonStyleConfig
  // 全局配置，会被具体类型覆盖
  global?: ButtonStyleConfig
}

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
  
  // 提交按钮相关
  submitIcon?: Component
  submitButtonText?: string
  required?: boolean
  
  // 工具栏相关
  showOptimizeButton?: boolean
  optimizeIcon?: Component
  optimizeText?: string
  isOptimizing?: boolean
  showDropdownTool?: boolean
  dropdownIcon?: Component
  dropdownText?: string
  dropdownOptions?: DropdownOption[]
  dropdownValue?: string | number
  dropdownPlaceholder?: string
  
  // 预设提示词相关
  showPresetPrompts?: boolean
  presetPrompts?: PresetPrompt[]
  selectedPrompt?: string
  presetPromptsTitle?: string
  presetPromptsSubtitle?: string
  presetPromptsMaxColumns?: number
  presetPromptsMinHeight?: string
  
  // 按钮样式配置
  buttonStyles?: ButtonStyles
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
  
  // 提交按钮相关
  submitButtonText: '',
  required: true,
  
  // 工具栏相关
  showOptimizeButton: false,
  optimizeText: '优化',
  isOptimizing: false,
  showDropdownTool: false,
  dropdownText: '选择',
  dropdownOptions: () => [],
  dropdownValue: undefined,
  dropdownPlaceholder: '请选择...',
  
  // 预设提示词相关
  showPresetPrompts: false,
  presetPrompts: () => [],
  selectedPrompt: '',
  presetPromptsTitle: '预设提示词',
  presetPromptsSubtitle: '选择一个预设提示词快速开始',
  presetPromptsMaxColumns: 3,
  presetPromptsMinHeight: '32px',
  
  // 按钮样式配置
  buttonStyles: () => ({}),
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'update:dropdownValue': [value: string | number]
  'update:selectedPrompt': [value: string]
  focus: [event: FocusEvent]
  blur: [event: FocusEvent]
  submit: [value: string]
  optimize: [value: string]
  'prompt-select': [value: string]
  'dropdown-change': [option: DropdownOption]
}>()

const isFocused = ref(false)
const currentValue = computed(() => props.modelValue || props.defaultValue)

// 注释：PresetPromptsComponent现在在外部容器中，不再需要高度限制

/**
 * 生成按钮样式的CSS变量
 * 支持全局配置和特定类型配置的合并
 */
const buttonCSSVariables = computed(() => {
  const variables: Record<string, string> = {}
  
  // 默认样式配置
  const defaultStyles = {
    submit: {
      width: 'auto',
      height: '32px',
      minWidth: '32px',
      backgroundColor: 'rgba(0, 212, 255, 0.1)',
      borderColor: 'rgba(0, 212, 255, 0.3)',
      textColor: 'white',
      fontSize: '14px',
      fontWeight: '500',
      borderRadius: '6px',
      padding: '0 12px',
      borderWidth: '1px',
      hoverBackgroundColor: 'rgba(0, 212, 255, 0.2)',
      hoverBorderColor: 'rgba(0, 212, 255, 0.5)',
      hoverTransform: 'translateY(-2px)',
      boxShadow: '0 4px 12px rgba(0, 212, 255, 0.2)',
      backdropFilter: 'blur(10px)',
      transition: 'all 0.3s ease'
    },
    tool: {
      width: '32px',
      height: '32px',
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      borderColor: 'rgba(255, 255, 255, 0.1)',
      textColor: 'rgba(255, 255, 255, 0.6)',
      fontSize: '14px',
      fontWeight: '500',
      borderRadius: '6px',
      padding: '8px 12px',
      borderWidth: '1px',
      hoverBackgroundColor: 'rgba(0, 212, 255, 0.1)',
      hoverBorderColor: 'rgba(0, 212, 255, 0.3)',
      hoverTextColor: '#00d4ff',
      hoverTransform: 'translateY(-2px)',
      boxShadow: '0 4px 12px rgba(0, 212, 255, 0.1)',
      backdropFilter: 'blur(10px)',
      transition: 'all 0.3s ease'
    },
    preset: {
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      borderColor: 'rgba(255, 255, 255, 0.1)',
      textColor: 'rgba(255, 255, 255, 0.8)',
      fontSize: '14px',
      fontWeight: '500',
      borderRadius: '8px',
      padding: '16px',
      borderWidth: '1px',
      hoverBackgroundColor: 'rgba(255, 255, 255, 0.08)',
      hoverBorderColor: 'rgba(0, 212, 255, 0.3)',
      hoverTextColor: 'rgba(255, 255, 255, 0.95)',
      hoverTransform: 'translateY(-1px)',
      transition: 'all 0.2s ease'
    }
  }
  
  // 合并用户配置和默认配置
  const mergeStyles = (type: keyof typeof defaultStyles) => {
    const globalConfig = props.buttonStyles?.global || {}
    const typeConfig = props.buttonStyles?.[type] || {}
    return { ...defaultStyles[type], ...globalConfig, ...typeConfig }
  }
  
  // 生成各类型按钮的CSS变量
  const buttonTypes = ['submit', 'tool', 'preset'] as const
  buttonTypes.forEach(type => {
    const styles = mergeStyles(type)
    Object.entries(styles).forEach(([key, value]) => {
      // 将驼峰命名转换为CSS变量命名
      const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase()
      variables[`--button-${type}-${cssKey}`] = value
    })
  })
  
  return variables
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
  // 合并按钮CSS变量
  ...buttonCSSVariables.value,
}))

// 事件处理方法
const handleInputChange = (value: string) => {
  emit('update:modelValue', value)
}

const handleFocus = (event: FocusEvent) => {
  isFocused.value = true
  emit('focus', event)
}

const handleBlur = (event: FocusEvent) => {
  isFocused.value = false
  emit('blur', event)
}

const handleSubmit = () => {
  emit('submit', currentValue.value)
}

const handleOptimize = () => {
  emit('optimize', currentValue.value)
}

const handleDropdownChange = (value: string | number) => {
  emit('update:dropdownValue', value)
}

const handleDropdownSelect = (option: DropdownOption) => {
  emit('dropdown-change', option)
}

const handlePromptSelect = (prompt: PresetPrompt) => {
  emit('prompt-select', prompt.value)
  emit('update:modelValue', prompt.value)
}

const handleSelectedPromptChange = (value: string) => {
  emit('update:selectedPrompt', value)
}


</script>

<style scoped>
/* 外层容器样式 */
.input-container {
  position: relative;
  width: 100%;
}

/* 确保PresetPromptsComponent紧密贴合输入框 */
.input-container :deep(.preset-prompts) {
  margin-top: -1px !important;
  border-top-left-radius: 0 !important;
  border-top-right-radius: 0 !important;
  border-top: none !important;
}

/* 输入框包装器样式 */
.input-wrapper {
  position: relative; /* 确保绝对定位的子元素相对于此容器定位 */
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  transition: all 0.3s ease;
  box-sizing: border-box;
  overflow: visible; /* 修改为visible，允许下拉选项显示在容器外 */
}

.input-wrapper:hover {
  border-color: rgba(0, 212, 255, 0.3);
}

.input-wrapper.is-focused {
  border-color: #00d4ff;
  box-shadow: 0 0 0 2px rgba(0, 212, 255, 0.2);
}

.input-wrapper.is-disabled {
  opacity: 0.5;
  background: rgba(255, 255, 255, 0.02);
  cursor: not-allowed;
}

/* 提交按钮区域 - 移到右下角 */
.submit-area {
  position: absolute;
  bottom: 12px;
  right: 12px;
  z-index: 10;
}

.submit-button {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: var(--button-submit-min-width, 32px);
  width: var(--button-submit-width, auto);
  height: var(--button-submit-height, 32px);
  padding: var(--button-submit-padding, 0 12px);
  background: var(--button-submit-background-color, rgba(0, 212, 255, 0.1));
  border: var(--button-submit-border-width, 1px) solid var(--button-submit-border-color, rgba(0, 212, 255, 0.3));
  border-radius: var(--button-submit-border-radius, 6px);
  cursor: pointer;
  transition: var(--button-submit-transition, all 0.3s ease);
  backdrop-filter: var(--button-submit-backdrop-filter, blur(10px));
  color: var(--button-submit-text-color, white);
  font-size: var(--button-submit-font-size, 14px);
  font-weight: var(--button-submit-font-weight, 500);
  box-shadow: var(--button-submit-box-shadow, none);
}

.submit-button:hover:not(.disabled) {
  background: var(--button-submit-hover-background-color, rgba(0, 212, 255, 0.2));
  border-color: var(--button-submit-hover-border-color, rgba(0, 212, 255, 0.5));
  color: var(--button-submit-hover-text-color, white);
  transform: var(--button-submit-hover-transform, translateY(-2px));
  box-shadow: var(--button-submit-hover-box-shadow, 0 4px 12px rgba(0, 212, 255, 0.2));
}

.submit-button.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 工具栏区域 - 移到左下角 */
.tools-area {
  position: absolute;
  bottom: 12px;
  left: 12px;
  z-index: 10;
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
  flex-direction: column;
  gap: 0; /* 移除间距，让PresetPromptsComponent完全控制自己的布局 */
  padding: 0; /* 移除内部留白，让PresetPromptsComponent自己控制 */
  /* 移除border-top，避免与PresetPromptsComponent的border重复 */
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
/* 旧的action-area样式已移除，现在使用submit-area和tools-area */

.feature-tools {
  display: flex;
  gap: 8px;
}

/* 旧的submit-button样式已移除，使用新的样式定义 */

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

/* 下拉框工具样式 */
.dropdown-tool {
  position: relative;
}

.dropdown-options {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: rgba(30, 30, 30, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  backdrop-filter: blur(20px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  z-index: 1000;
  margin-top: 4px;
  max-height: 200px;
  overflow-y: auto;
  min-width: 120px;
}

.dropdown-option {
  padding: 8px 12px;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  transition: all 0.2s ease;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  font-size: 14px;
  white-space: nowrap;
}

.dropdown-option:last-child {
  border-bottom: none;
}

.dropdown-option:hover {
  background: rgba(0, 212, 255, 0.1);
  color: #00d4ff;
}

.dropdown-option.active {
  background: rgba(0, 212, 255, 0.2);
  color: #00d4ff;
  font-weight: 500;
}

/* 下拉选项滚动条样式 */
.dropdown-options::-webkit-scrollbar {
  width: 6px;
}
.dropdown-options::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 3px;
}
.dropdown-options::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}
.dropdown-options::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}

@media (max-width: 768px) {
  .dark-tech-input-element {
    font-size: 16px;
  }
  .submit-button {
    padding: 6px 12px;
    min-width: 28px;
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
