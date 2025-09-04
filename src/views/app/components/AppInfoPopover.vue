<template>
  <div class="app-info-popover">
    <a-popover title="应用信息" trigger="hover" placement="bottomLeft">
      <template #content>
        <div class="app-info-popover">
          <div class="info-item">
            <span class="label">应用ID：</span>
            <span class="value">{{ appInfo.id }}</span>
          </div>
          <div class="info-item">
            <span class="label">创建时间：</span>
            <span class="value">{{ formatDate(appInfo.createTime) }}</span>
          </div>
          <div class="info-item">
            <span class="label">更新时间：</span>
            <span class="value">{{ formatDate(appInfo.updateTime) }}</span>
          </div>
          <div v-if="appInfo.deployTime" class="info-item">
            <span class="label">部署时间：</span>
            <span class="value">{{ formatDate(appInfo.deployTime) }}</span>
          </div>
          <div v-if="appInfo.userInfo" class="info-item">
            <span class="label">创建者：</span>
            <span class="value">{{ appInfo.userInfo.name || appInfo.userInfo.account }}</span>
          </div>
          <div v-if="appInfo.codeGenType" class="info-item">
            <span class="label">代码类型：</span>
            <span class="value">{{ formatCodeGenType(appInfo.codeGenType) }}</span>
          </div>
        </div>
      </template>
      <a-button type="text" size="small" class="info-button">
        <template #icon>
          <InfoCircleOutlined />
        </template>
      </a-button>
    </a-popover>
  </div>
</template>

<script setup lang="ts">
import { InfoCircleOutlined } from '@ant-design/icons-vue'
import DateUtil from '@/utils/DateUtil'
import { useEnumStore } from '@/stores/enum'

// 组件属性定义
interface Props {
  /** 应用信息对象 */
  appInfo: API.AppInfoCommonResVo
}

defineProps<Props>()
const enumStore = useEnumStore()

const formatDate = (dateStr?: string): string => {
  if (!dateStr) return '-'
  return DateUtil.formatDate(dateStr, 'YYYY-MM-DD HH:mm')
}

const formatCodeGenType = (codeGenType?: string): string => {
  if (!codeGenType) return '-'
  return enumStore.getCodeGenTypeText(codeGenType)
}
</script>

<style scoped>
.info-button {
  color: #666;
  border: none;
  box-shadow: none;
}

.info-button:hover {
  color: #1890ff;
  background-color: #f0f0f0;
}

.app-info-popover {
  min-width: 250px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
  border-bottom: 1px solid #f0f0f0;
}

.info-item:last-child {
  border-bottom: none;
}

.info-item .label {
  font-weight: 500;
  color: #666;
  min-width: 80px;
}

.info-item .value {
  color: #333;
  word-break: break-all;
  text-align: right;
  max-width: 150px;
}
</style>
