<!--
  Input 输入组件

  该组件是一个功能丰富的输入组件，包含以下特性：
  1. 基础输入功能（单行/多行文本输入）
  2. 打字机效果占位符
  3. 可自定义的工具栏（优化按钮、下拉选择等）
  4. 提交按钮
  5. 预设提示词功能

  Props 说明：
  - modelValue: 绑定值，用于 v-model 双向绑定
  - defaultValue: 默认值
  - placeholder: 占位符文本
  - width/height: 组件尺寸
  - fontSize: 字体大小
  - disabled: 是否禁用
  - icon: 输入框图标
  - multiline: 是否为多行文本
  - rows/maxRows: 多行文本行数控制
  - resize: 多行文本调整大小选项
  - autoHeight: 是否自动调整高度
  - paddingBottom: 底部内边距
  - backgroundColor/textColor/placeholderColor: 颜色样式控制
  - enableTypewriter/placeholderArray/typewriterSpeed/typewriterDelay: 打字机效果控制
  - showSubmitButton/submitIcon/submitButtonText/required: 提交按钮控制
  - showFeatureTools/showOptimizeButton/optimizeIcon/optimizeText/isOptimizing: 工具栏控制
  - showDropdownTool/dropdownIcon/dropdownText/dropdownOptions/dropdownValue/dropdownPlaceholder: 下拉选择控制
  - showPresetPrompts/presetPrompts/selectedPrompt/presetPromptsTitle/presetPromptsSubtitle: 预设提示词控制

  Events 说明：
  - update:modelValue: 输入值变化时触发
  - update:dropdownValue: 下拉选择值变化时触发
  - update:selectedPrompt: 选中预设提示词变化时触发
  - focus: 输入框获得焦点时触发
  - blur: 输入框失去焦点时触发
  - submit: 点击提交按钮时触发
  - optimize: 点击优化按钮时触发
  - prompt-select: 选择预设提示词时触发
  - dropdown-change: 下拉选项改变时触发

  使用示例：
  <Input
    v-model="inputValue"
    :show-feature-tools="true"
    :show-optimize-button="true"
    :show-preset-prompts="true"
    :preset-prompts="presetPromptsData"
    @submit="handleSubmit"
    @optimize="handleOptimize"
    @prompt-select="handlePromptSelect"
  />

  const presetPromptsData = [
    { label: '翻译', value: '请将以下内容翻译成英文', description: '翻译成英文' },
    { label: '润色', value: '请润色以下文本', description: '文本润色' }
  ];

  const handleSubmit = (value) => {
    console.log('提交内容:', value);
  };

  const handleOptimize = (value) => {
    console.log('优化内容:', value);
  };

  const handlePromptSelect = (prompt) => {
    console.log('选择预设提示词:', prompt);
  };
-->

<template>
  <div class="input-wrapper">
    <!-- 核心输入框 -->
    <CoreInput
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
      @update:model-value="handleInput"
      @focus="handleFocus"
      @blur="handleBlur"
      @submit="handleSubmit"
    >
      <!-- 工具栏区域 -->
      <template v-if="showFeatureTools" #footer-left>
        <FeatureTools
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
          @update:dropdown-value="handleDropdownValueUpdate"
          @dropdown-change="handleDropdownChange"
        >
          <!-- 自定义工具插槽 -->
          <template #custom-tools>
            <slot name="custom-tools" />
          </template>
        </FeatureTools>
      </template>

      <!-- 提交按钮 -->
      <template v-if="showSubmitButton" #footer-right>
        <button
          :class="['submit-button', { 'disabled': required && !currentValue }]"
          :disabled="disabled || (required && !currentValue)"
          @click="handleSubmit"
        >
          <component :is="submitIcon" v-if="submitIcon" class="submit-icon" />
          <span v-if="submitButtonText" class="submit-text">{{ submitButtonText }}</span>
        </button>
      </template>
    </CoreInput>

    <!-- 预设提示词 -->
    <PromptsArea
      :show-preset-prompts="showPresetPrompts"
      :preset-prompts="presetPrompts"
      :selected-prompt="selectedPrompt"
      :title="presetPromptsTitle"
      :subtitle="presetPromptsSubtitle"
      :disabled="disabled"
      :max-columns="presetPromptsMaxColumns"
      :min-button-height="presetPromptsMinHeight"
      :max-height="presetPromptsMaxHeight"
      @prompt-select="handlePromptSelect"
      @update:selected-prompt="handleSelectedPromptUpdate"
    >
      <!-- 自定义预设提示词插槽 -->
      <template #custom-prompts>
        <slot name="custom-prompts" />
      </template>
    </PromptsArea>
  </div>
</template>

<script setup lang="ts">
import type { Component } from 'vue'
import { computed } from 'vue'
import CoreInput from '@/components/Input/CoreInput/index.vue'
import FeatureTools from '@/components/Input/FeatureTool/index.vue'
import PromptsArea from './PromptsArea/index.vue'

// 定义接口
interface PresetPrompt {
  label: string
  value: string
  description?: string
  icon?: Component
  category?: string
}

interface DropdownOption {
  label: string
  value: string | number
}

// 定义Props
interface Props {
  // 基础输入属性
  modelValue?: string
  defaultValue?: string
  placeholder?: string
  width?: string | number
  height?: string | number
  fontSize?: string | number
  disabled?: boolean
  icon?: Component
  multiline?: boolean
  rows?: number
  maxRows?: number
  resize?: 'none' | 'both' | 'horizontal' | 'vertical'
  autoHeight?: boolean
  paddingBottom?: string

  // 样式属性
  backgroundColor?: string
  textColor?: string
  placeholderColor?: string

  // 打字机效果
  enableTypewriter?: boolean
  placeholderArray?: string[]
  typewriterSpeed?: number
  typewriterDelay?: number

  // 提交按钮相关
  showSubmitButton?: boolean
  submitIcon?: Component
  submitButtonText?: string
  required?: boolean

  // 工具栏相关
  showFeatureTools?: boolean
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
  presetPromptsMaxHeight?: string
}

// 设置默认Props值
const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  defaultValue: '',
  placeholder: '请输入内容...',
  width: '100%',
  height: '56px',
  fontSize: '16px',
  disabled: false,
  icon: undefined,
  multiline: false,
  rows: 3,
  maxRows: 10,
  resize: 'vertical',
  autoHeight: false,
  paddingBottom: '16px',
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
  textColor: '#ffffff',
  placeholderColor: 'rgba(255, 255, 255, 0.4)',
  enableTypewriter: false,
  placeholderArray: () => [],
  typewriterSpeed: 100,
  typewriterDelay: 2000,
  showSubmitButton: true,
  submitButtonText: '',
  required: true,
  showFeatureTools: false,
  showOptimizeButton: false,
  optimizeText: '优化',
  isOptimizing: false,
  showDropdownTool: false,
  dropdownText: '选择',
  dropdownOptions: () => [],
  dropdownValue: '',
  dropdownPlaceholder: '请选择...',
  showPresetPrompts: false,
  presetPrompts: () => [],
  selectedPrompt: '',
  presetPromptsTitle: '预设提示词',
  presetPromptsSubtitle: '选择一个预设提示词快速开始',
  presetPromptsMaxColumns: 3,
  presetPromptsMinHeight: '32px',
  presetPromptsMaxHeight: '200px'
})

// 定义Emits事件
const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'update:dropdownValue', value: string | number): void
  (e: 'update:selectedPrompt', value: string): void
  (e: 'focus', event: FocusEvent): void
  (e: 'blur', event: FocusEvent): void
  (e: 'submit', value: string): void
  (e: 'optimize', value: string): void
  (e: 'prompt-select', prompt: PresetPrompt): void
  (e: 'dropdown-change', option: DropdownOption): void
}>()

// 计算属性
const currentValue = computed(() => props.modelValue || props.defaultValue)

// 事件处理函数
const handleInput = (value: string) => {
  emit('update:modelValue', value)
}

const handleFocus = (event: FocusEvent) => {
  emit('focus', event)
}

const handleBlur = (event: FocusEvent) => {
  emit('blur', event)
}

const handleSubmit = () => {
  emit('submit', currentValue.value)
}

const handleOptimize = () => {
  emit('optimize', currentValue.value)
}

const handleDropdownValueUpdate = (value: string | number) => {
  emit('update:dropdownValue', value)
}

const handleDropdownChange = (option: DropdownOption) => {
  emit('dropdown-change', option)
}

const handlePromptSelect = (prompt: PresetPrompt) => {
  emit('prompt-select', prompt)
  // 修复：当用户点击预设提示词时，将提示词内容填入输入框
  emit('update:modelValue', prompt.value)
}

const handleSelectedPromptUpdate = (value: string) => {
  emit('update:selectedPrompt', value)
}
</script>

<style scoped>
.input-wrapper {
  position: relative;
  width: 100%;
}

.submit-button {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  height: 32px;
  padding: 0 12px;
  background: rgba(0, 212, 255, 0.1);
  border: 1px solid rgba(0, 212, 255, 0.3);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  color: white;
  font-size: 14px;
  font-weight: 500;
}

.submit-button:hover:not(.disabled) {
  background: rgba(0, 212, 255, 0.2);
  border-color: rgba(0, 212, 255, 0.5);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 212, 255, 0.2);
}

.submit-button.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.submit-icon {
  width: 16px;
  height: 16px;
  margin-right: 4px;
}

@media (max-width: 768px) {
  .submit-button {
    padding: 6px 12px;
    min-width: 28px;
  }

  .submit-text {
    font-size: 12px;
  }
}
</style>
