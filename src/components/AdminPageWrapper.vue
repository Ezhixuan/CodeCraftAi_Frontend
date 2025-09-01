<template>
  <div class="admin-page-wrapper">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>{{ title }}</h2>
    </div>

    <!-- 搜索表单 -->
    <a-card v-if="$slots.searchForm" class="search-card" title="搜索条件">
      <slot name="searchForm"></slot>
    </a-card>

    <!-- 操作按钮区域 -->
    <a-card v-if="$slots.actions" class="action-card">
      <slot name="actions"></slot>
    </a-card>

    <!-- 主要内容区域 -->
    <a-card class="content-card" :title="contentTitle">
      <slot></slot>
    </a-card>

    <!-- 模态框区域 -->
    <slot name="modals"></slot>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  title: string
  contentTitle?: string
}

const props = withDefaults(defineProps<Props>(), {
  contentTitle: '列表'
})
</script>

<style scoped>
.admin-page-wrapper {
  padding: 24px;
}

.page-header {
  margin-bottom: 24px;
}

.page-header h2 {
  margin: 0;
  color: #262626;
  font-size: 24px;
  font-weight: 600;
}

.search-card,
.action-card,
.content-card {
  margin-bottom: 16px;
}

:deep(.ant-table) .ant-table-thead > tr > th {
  background-color: #fafafa;
  font-weight: 600;
}

:deep(.ant-descriptions-item-label) {
  font-weight: 600;
  background-color: #fafafa;
}
</style>