<template>
  <div class="feature-tools">
    <!-- 优化工具按钮 -->
    <button
      v-if="showOptimizeButton"
      :class="['feature-tool', { 'active': isOptimizing }]"
      :disabled="disabled || isOptimizing"
      @click="handleOptimize"
    >
      <component :is="optimizeIcon" class="tool-icon" />
      <span class="tool-text">{{ optimizeText }}</span>
    </button>

    <!-- 下拉选择工具 -->
    <div
      v-if="showDropdownTool"
      :class="['dropdown-tool', { 'active': isDropdownOpen }]"
      ref="dropdownRef"
    >
      <button
        :class="['feature-tool', { 'active': isDropdownOpen }]"
        :disabled="disabled"
        @click="toggleDropdown"
      >
        <component :is="dropdownIcon" class="tool-icon" />
        <span class="tool-text">{{ dropdownText }}</span>
      </button>
      
      <div v-if="isDropdownOpen" class="dropdown-options">
        <div
          v-for="(option, index) in dropdownOptions"
          :key="index"
          :class="['dropdown-option', { 'selected': option.value === dropdownValue }]"
          @click="selectOption(option)"
        >
          {{ option.label }}
        </div>
      </div>
    </div>

    <!-- 自定义工具插槽 -->
    <slot name="custom-tools" />
  </div>
</template>

<script setup lang="ts">
import type { Component } from 'vue'
import { onMounted, onUnmounted, ref } from 'vue'

// 下拉选项接口
interface DropdownOption {
  label: string
  value: string | number
}

// Props 接口定义
interface Props {
  // 优化工具相关
  showOptimizeButton?: boolean
  optimizeIcon?: Component
  optimizeText?: string
  isOptimizing?: boolean
  
  // 下拉选择工具相关
  showDropdownTool?: boolean
  dropdownIcon?: Component
  dropdownText?: string
  dropdownOptions?: DropdownOption[]
  dropdownValue?: string | number
  dropdownPlaceholder?: string
  
  // 通用属性
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showOptimizeButton: false,
  optimizeIcon: undefined,
  optimizeText: '优化',
  isOptimizing: false,
  
  showDropdownTool: false,
  dropdownIcon: undefined,
  dropdownText: '选择',
  dropdownOptions: () => [],
  dropdownValue: '',
  dropdownPlaceholder: '请选择...',
  
  disabled: false,
})

const emit = defineEmits<{
  optimize: []
  'update:dropdownValue': [value: string | number]
  'dropdown-change': [option: DropdownOption]
}>()

// 响应式状态
const isDropdownOpen = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)

// 事件处理方法
const handleOptimize = () => {
  if (!props.disabled && !props.isOptimizing) {
    emit('optimize')
  }
}

const toggleDropdown = () => {
  if (!props.disabled) {
    isDropdownOpen.value = !isDropdownOpen.value
  }
}

const selectOption = (option: DropdownOption) => {
  emit('update:dropdownValue', option.value)
  emit('dropdown-change', option)
  isDropdownOpen.value = false
}

const closeDropdown = (event: MouseEvent) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    isDropdownOpen.value = false
  }
}

// 生命周期钩子
onMounted(() => {
  document.addEventListener('click', closeDropdown)
})

onUnmounted(() => {
  document.removeEventListener('click', closeDropdown)
})
</script>

<style scoped>
/* 工具栏容器 */
.feature-tools {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 16px;
  height: 100%;
}

/* 工具按钮基础样式 */
.feature-tool {
  display: flex;
  align-items: center;
  gap: var(--button-tool-gap, 6px);
  padding: var(--button-tool-padding, 8px 12px);
  background: var(--button-tool-background-color, rgba(255, 255, 255, 0.05));
  border: var(--button-tool-border-width, 1px) solid var(--button-tool-border-color, rgba(255, 255, 255, 0.1));
  border-radius: var(--button-tool-border-radius, 6px);
  color: var(--button-tool-text-color, rgba(255, 255, 255, 0.7));
  font-size: var(--button-tool-font-size, 14px);
  font-weight: var(--button-tool-font-weight, 500);
  cursor: pointer;
  transition: var(--button-tool-transition, all 0.2s ease);
  white-space: nowrap;
  min-height: var(--button-tool-height, 32px); /* 统一与提交按钮的高度 */
  box-sizing: border-box;
  backdrop-filter: var(--button-tool-backdrop-filter, blur(10px));
  box-shadow: var(--button-tool-box-shadow, none);
}

.feature-tool:hover:not(:disabled) {
  background: var(--button-tool-hover-background-color, rgba(255, 255, 255, 0.1));
  border-color: var(--button-tool-hover-border-color, rgba(0, 212, 255, 0.3));
  color: var(--button-tool-hover-text-color, rgba(255, 255, 255, 0.9));
  transform: var(--button-tool-hover-transform, none);
  box-shadow: var(--button-tool-hover-box-shadow, none);
}

.feature-tool:active:not(:disabled) {
  transform: var(--button-tool-active-transform, translateY(1px));
}

.feature-tool.active {
  background: var(--button-tool-active-background-color, rgba(0, 212, 255, 0.2));
  border-color: var(--button-tool-active-border-color, #00d4ff);
  color: var(--button-tool-active-text-color, #00d4ff);
}

.feature-tool:disabled {
  opacity: var(--button-tool-disabled-opacity, 0.5);
  cursor: not-allowed;
}

/* 工具图标样式 */
.tool-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.tool-text {
  font-weight: 500;
}

/* 下拉工具容器 */
.dropdown-tool {
  position: relative;
  display: inline-block;
}

/* 下拉选项容器 */
.dropdown-options {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background: rgba(30, 30, 30, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  z-index: 9999; /* 提高z-index层级，确保显示在最上层 */
  max-height: 200px;
  overflow-y: auto;
  backdrop-filter: blur(10px);
}

/* 下拉选项样式 */
.dropdown-option {
  padding: 10px 12px;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  transition: all 0.2s ease;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  font-size: 14px;
}

.dropdown-option:last-child {
  border-bottom: none;
}

.dropdown-option:hover {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.95);
}

.dropdown-option.selected {
  background: rgba(0, 212, 255, 0.2);
  color: #00d4ff;
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

.dropdown-options {
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.2) rgba(255, 255, 255, 0.05);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .feature-tools {
    gap: 6px;
    padding: 0 12px;
  }
  
  .feature-tool {
    padding: 6px 10px;
    font-size: 13px;
    min-height: 32px;
  }
  
  .tool-icon {
    width: 14px;
    height: 14px;
  }
  
  .tool-text {
    display: none;
  }
}

@media (max-width: 480px) {
  .feature-tools {
    gap: 4px;
    padding: 0 8px;
  }
  
  .feature-tool {
    padding: 6px 8px;
    min-height: 32px;
  }
}
</style>