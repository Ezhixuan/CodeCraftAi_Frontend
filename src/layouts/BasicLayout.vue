<template>
  <a-layout class="basic-layout">
    <!-- 顶部导航栏 -->
    <a-layout-header class="header">
      <GlobalHeader />
    </a-layout-header>

    <!-- 中间内容区域 -->
    <a-layout-content class="content">
      <router-view />
    </a-layout-content>

    <!-- 底部版权信息 -->
    <a-layout-footer class="footer">
      <GlobalFooter />
    </a-layout-footer>
  </a-layout>
</template>

<script setup lang="ts">
import GlobalHeader from '../components/GlobalHeader.vue'
import GlobalFooter from '../components/GlobalFooter.vue'
</script>

<style scoped>
.basic-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  padding: 0;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.content {
  flex: 1;
  padding: 24px;
  background: #f0f2f5;
  min-height: calc(100vh - 64px - 70px);
  /* 减去 header 和 footer 高度 */
}

.footer {
  padding: 0;
  background: #fff;
  border-top: 1px solid #e8e8e8;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .content {
    padding: 16px;
  }
}

@media (max-width: 576px) {
  .content {
    padding: 12px;
  }
}
</style>
