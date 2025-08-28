<template>
  <div class="button-style-test">
    <h1>按钮样式配置测试页面</h1>
    
    <!-- 默认样式测试 -->
    <section class="test-section">
      <h2>默认样式（无配置）</h2>
      <InputComponent
        v-model="testValue1"
        placeholder="测试默认按钮样式"
        :show-preset-prompts="true"
        :preset-prompts="testPrompts"
        :show-feature-tools="true"
        :show-optimize-button="true"
        optimize-text="优化"
        :show-dropdown-tool="true"
        dropdown-text="音乐播放故障"
        :dropdown-options="dropdownOptions"
      />
    </section>

    <!-- 自定义全局样式测试 -->
    <section class="test-section">
      <h2>自定义全局样式</h2>
      <InputComponent
        v-model="testValue2"
        placeholder="测试自定义全局按钮样式"
        :button-styles="globalCustomStyles"
        :show-preset-prompts="true"
        :preset-prompts="testPrompts"
        :show-feature-tools="true"
        :show-optimize-button="true"
        optimize-text="优化"
        :show-dropdown-tool="true"
        dropdown-text="音乐播放故障"
        :dropdown-options="dropdownOptions"
      />
    </section>

    <!-- 分类型自定义样式测试 -->
    <section class="test-section">
      <h2>分类型自定义样式</h2>
      <InputComponent
        v-model="testValue3"
        placeholder="测试分类型自定义按钮样式"
        :button-styles="typeSpecificStyles"
        :show-preset-prompts="true"
        :preset-prompts="testPrompts"
        :show-feature-tools="true"
        :show-optimize-button="true"
        optimize-text="优化"
        :show-dropdown-tool="true"
        dropdown-text="音乐播放故障"
        :dropdown-options="dropdownOptions"
      />
    </section>

    <!-- 混合配置测试 -->
    <section class="test-section">
      <h2>混合配置（全局+特定类型）</h2>
      <InputComponent
        v-model="testValue4"
        placeholder="测试混合配置按钮样式"
        :button-styles="mixedStyles"
        :show-preset-prompts="true"
        :preset-prompts="testPrompts"
        :show-feature-tools="true"
        :show-optimize-button="true"
        optimize-text="优化"
        :show-dropdown-tool="true"
        dropdown-text="音乐播放故障"
        :dropdown-options="dropdownOptions"
      />
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import InputComponent from '@/components/InputComponent.vue'

// 从InputComponent中导入类型定义
type ButtonStyleConfig = {
  width?: string
  height?: string
  minWidth?: string
  backgroundColor?: string
  borderColor?: string
  textColor?: string
  fontSize?: string
  fontWeight?: string
  borderRadius?: string
  padding?: string
  borderWidth?: string
  boxShadow?: string
  backdropFilter?: string
  transition?: string
  hoverBackgroundColor?: string
  hoverBorderColor?: string
  hoverTextColor?: string
  hoverTransform?: string
  hoverBoxShadow?: string
}

type ButtonStyles = {
  global?: ButtonStyleConfig
  submit?: ButtonStyleConfig
  tool?: ButtonStyleConfig
  preset?: ButtonStyleConfig
}

// 测试数据
const testValue1 = ref('')
const testValue2 = ref('')
const testValue3 = ref('')
const testValue4 = ref('')

const testPrompts = [
  {
    id: '1',
    value: 'personal-blog',
    label: '个人博客',
    description: '创建个人博客网站'
  },
  {
    id: '2',
    value: 'music-troubleshoot',
    label: '音乐播放故障',
    description: '解决音乐播放问题'
  }
]

const dropdownOptions = [
  { label: '选项1', value: 'option1' },
  { label: '选项2', value: 'option2' },
  { label: '选项3', value: 'option3' }
]

// 全局自定义样式
const globalCustomStyles: ButtonStyles = {
  global: {
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    borderColor: 'rgba(255, 0, 0, 0.3)',
    textColor: '#ff6b6b',
    borderRadius: '12px',
    hoverBackgroundColor: 'rgba(255, 0, 0, 0.2)',
    hoverBorderColor: 'rgba(255, 0, 0, 0.5)',
    hoverTextColor: '#ff4757'
  }
}

// 分类型自定义样式
const typeSpecificStyles: ButtonStyles = {
  submit: {
    backgroundColor: 'rgba(0, 255, 0, 0.1)',
    borderColor: 'rgba(0, 255, 0, 0.3)',
    textColor: '#2ed573',
    borderRadius: '8px'
  },
  tool: {
    backgroundColor: 'rgba(255, 165, 0, 0.1)',
    borderColor: 'rgba(255, 165, 0, 0.3)',
    textColor: '#ffa502',
    borderRadius: '50%'
  },
  preset: {
    backgroundColor: 'rgba(138, 43, 226, 0.1)',
    borderColor: 'rgba(138, 43, 226, 0.3)',
    textColor: '#8a2be2',
    borderRadius: '16px'
  }
}

// 混合配置样式
const mixedStyles: ButtonStyles = {
  global: {
    fontWeight: '600',
    transition: 'all 0.5s ease',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
  },
  submit: {
    backgroundColor: 'rgba(0, 123, 255, 0.1)',
    borderColor: 'rgba(0, 123, 255, 0.3)',
    textColor: '#007bff',
    hoverTransform: 'scale(1.05)'
  },
  tool: {
    backgroundColor: 'rgba(40, 167, 69, 0.1)',
    borderColor: 'rgba(40, 167, 69, 0.3)',
    textColor: '#28a745'
  }
}
</script>

<style scoped>
.button-style-test {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  color: white;
}

.test-section {
  margin-bottom: 40px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.test-section h2 {
  margin-top: 0;
  margin-bottom: 20px;
  color: #fff;
  font-size: 18px;
  font-weight: 600;
}

h1 {
  text-align: center;
  margin-bottom: 40px;
  font-size: 28px;
  font-weight: 700;
}
</style>