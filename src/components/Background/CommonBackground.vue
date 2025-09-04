<template>
  <!-- 深色科技风格通用背景组件 -->
  <div class="common-background">
    <!-- 动态背景层 -->
    <div class="background-layer">
      <div class="grid-overlay"></div>
      <div class="floating-particles"></div>
    </div>
    <!-- 内容层 -->
    <div class="content-layer">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 通用背景组件
 * 提供深色科技风格的动态背景效果，包含网格覆盖层和浮动粒子动画
 * 使用方式：<Index><YourContent /></Index>
 * 特点：
 * - 可以直接包裹任何内容使用，无需修改现有页面样式
 * - 背景效果完全独立，不影响内容布局
 * - 支持响应式设计，适配各种屏幕尺寸
 */
</script>

<style scoped>
.common-background {
  position: relative;
  background: #0a0a0a;
  overflow: hidden;
}

.background-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  pointer-events: none;
  overflow: hidden;
}

.content-layer {
  position: relative;
  z-index: 1;
  min-height: inherit;
}

.grid-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
  background-size: 50px 50px;
}

.floating-particles {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background:
    radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
    radial-gradient(circle at 40% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%);
  animation: float 20s ease-in-out infinite;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0px) rotate(0deg);
  }
  33% {
    transform: translateY(-20px) rotate(1deg);
  }
  66% {
    transform: translateY(10px) rotate(-1deg);
  }
}
</style>
