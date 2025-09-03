<template>
  <div class="app-nav-bar">
    <div class="nav-content">
      <div class="left-section">
        <div class="logo-section" @mouseover="handleLogoMouseOver">
          <img
            src="@/assets/codeAi 无背景.png"
            @click="goHome"
            alt="CodeCraft Logo"
            class="logo-img"
          />
          <span class="logo-text">CodeCraft</span>
        </div>

        <div class="app-info-section">
          <div v-if="loading" class="info-loading">
            <a-spin size="small" />
            <span>正在加载应用信息...</span>
          </div>
          <div v-else-if="appInfo" class="info-display">
            <div class="app-name-container">
              <a-input
                v-if="isEditing && isOwnerCurr"
                v-model:value="editingName"
                @blur="saveAppName"
                @pressEnter="saveAppName"
                @keyup.esc="cancelEdit"
                class="app-name-input"
                :maxlength="50"
                ref="nameInputRef"
              />
              <span v-else class="app-name" :class="{ editable: isOwnerCurr }" @click="startEdit">
                {{ appInfo.name }}
              </span>
              <!-- 代码生成类型彩色标签 -->
              <a-tag
                v-if="appInfo.codeGenType"
                :color="getCodeGenTypeConfig(appInfo.codeGenType).color"
                class="code-gen-type-tag"
              >
                <template #icon>
                  <component :is="getCodeGenTypeConfig(appInfo.codeGenType).icon" />
                </template>
                {{ getCodeGenTypeConfig(appInfo.codeGenType).label }}
              </a-tag>
              <span v-if="isOwnerCurr" class="owner-tag">我的应用</span>
            </div>

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
                    <span class="value">{{
                      appInfo.userInfo.name || appInfo.userInfo.account
                    }}</span>
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
          <div v-else class="info-placeholder">
            <span>无法加载应用信息</span>
          </div>
        </div>
      </div>

      <div class="right-section" v-if="isOwnerCurr">
        <a-button
          :type="editMode ? 'default' : 'primary'"
          :loading="editModeLoading"
          :danger="editMode"
          @click="startEditMode"
          class="edit-button"
        >
          <template #icon><EditOutlined /></template>
          {{ editMode ? '退出编辑' : '编辑模式' }}
        </a-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { getAppInfo, putAppUpdate } from '@/api/appController.ts'
import { message } from 'ant-design-vue'
import {
  InfoCircleOutlined,
  CodeOutlined,
  Html5Outlined,
  NodeIndexOutlined,
  FileOutlined,
  BugOutlined,
  EditOutlined,
} from '@ant-design/icons-vue'
import { useRouter } from 'vue-router'
import { useLoginUserStore } from '@/stores/loginUser'

// --- Props and Emits ---
const props = defineProps<{
  appId?: string
  sysAppInfo?: API.AppInfoCommonResVo
  isOwner?: boolean
  editMode?: boolean
  editModeLoading?: boolean
}>()

// MODIFIED: Define the events that this component can emit
const emit = defineEmits(['logoMouseOver', 'logoMouseLeave', 'update:editMode'])

// --- State and Refs ---
const router = useRouter()
const loginUser = useLoginUserStore()
const appInfo = ref<API.AppInfoCommonResVo | null>(null)
const isOwnerCurr = ref<boolean | null>(null)
const loading = ref(true)
const isEditing = ref(false)
const editingName = ref('')
const nameInputRef = ref()

// --- Lifecycle Hooks ---
onMounted(async () => {
  loading.value = true
  try {
    if (props.sysAppInfo) {
      appInfo.value = props.sysAppInfo
    } else if (props.appId) {
      try {
        const response = await getAppInfo({ id: props.appId })
        if (response.data.data) {
          appInfo.value = response.data.data
        }
      } catch (error) {
        message.error('获取应用信息失败')
        console.error(error)
      }
    }
    if (props.isOwner === null && appInfo.value) {
      isOwnerCurr.value = appInfo.value.userId === loginUser.loginUser.id
    } else {
      isOwnerCurr.value = props.isOwner
    }
  } finally {
    loading.value = false
  }
})

// --- Methods ---
const startEdit = () => {
  if (!isOwnerCurr.value) return
  isEditing.value = true
  editingName.value = appInfo.value?.name || ''
  nextTick(() => {
    nameInputRef.value?.focus()
  })
}

const saveAppName = async () => {
  if (!editingName.value.trim()) {
    message.error('应用名称不能为空')
    return
  }
  if (editingName.value === appInfo.value?.name) {
    isEditing.value = false
    return
  }
  try {
    const updateReq: API.AppUpdateCommonReqVo = {
      id: props.appId!,
      name: editingName.value.trim(),
    }
    await putAppUpdate(updateReq)
    if (appInfo.value) {
      appInfo.value.name = editingName.value.trim()
    }
    isEditing.value = false
    message.success('应用名称更新成功')
  } catch (error) {
    message.error('更新应用名称失败')
    console.error('更新应用名称失败:', error)
  }
}

const cancelEdit = () => {
  isEditing.value = false
  editingName.value = appInfo.value?.name || ''
}

const formatDate = (dateStr?: string) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString('zh-CN')
}

/**
 * 格式化代码生成类型为用户友好的显示文本
 * @param codeGenType 代码生成类型
 * @returns 格式化后的显示文本
 */
const formatCodeGenType = (codeGenType?: string) => {
  if (!codeGenType) return '-'
  const typeMap: Record<string, string> = {
    vue_project: 'Vue项目',
    multi_file: '多文件项目',
    single_file: '单文件项目',
    react_project: 'React项目',
    html_project: 'HTML项目',
  }
  return typeMap[codeGenType] || codeGenType
}

/**
 * 获取代码生成类型的配置信息（颜色、图标、标签文本）
 * @param codeGenType 代码生成类型
 * @returns 包含颜色、图标和标签的配置对象
 */
const getCodeGenTypeConfig = (codeGenType?: string) => {
  if (!codeGenType) {
    return {
      color: 'default',
      icon: CodeOutlined,
      label: '未知类型',
    }
  }

  const configMap: Record<string, { color: string; icon: typeof CodeOutlined; label: string }> = {
    vue_project: {
      color: 'green',
      icon: CodeOutlined,
      label: 'Vue',
    },
    react_project: {
      color: 'blue',
      icon: CodeOutlined,
      label: 'React',
    },
    angular_project: {
      color: 'red',
      icon: CodeOutlined,
      label: 'Angular',
    },
    html: {
      color: 'orange',
      icon: Html5Outlined,
      label: 'HTML',
    },
    node_project: {
      color: 'lime',
      icon: NodeIndexOutlined,
      label: 'Node.js',
    },
    python_project: {
      color: 'purple',
      icon: FileOutlined,
      label: 'Python',
    },
    java_project: {
      color: 'volcano',
      icon: BugOutlined,
      label: 'Java',
    },
    multi_file: {
      color: 'cyan',
      icon: CodeOutlined,
      label: '多文件',
    },
    single_file: {
      color: 'geekblue',
      icon: CodeOutlined,
      label: '单文件',
    },
  }

  return (
    configMap[codeGenType] || {
      color: 'default',
      icon: CodeOutlined,
      label: codeGenType,
    }
  )
}

const goHome = () => {
  router.push('/')
}

const startEditMode = () => {
  emit('update:editMode')
  console.log('edit', props.editMode)
}

const handleLogoMouseOver = () => {
  emit('logoMouseOver')
}
</script>
<style scoped>
/* Styles are unchanged */
.app-nav-bar {
  background: #ffffff;
  border-bottom: 1px solid #e8e8e8;
  padding: 0 24px;
  height: 64px;
  display: flex;
  align-items: center;
}
.nav-content {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.left-section {
  display: flex;
  align-items: center;
  gap: 24px;
  flex: 1;
}
.logo-section {
  display: flex;
  align-items: center;
  gap: 8px;
  /* Add padding to make the hover area larger and more stable */
  padding: 8px;
  margin: -8px; /* Counteract padding to maintain layout */
  cursor: pointer;
}
.logo-img {
  height: 32px;
  transition: transform 0.2s ease;
}
.logo-img:hover {
  transform: scale(1.05);
}
.logo-text {
  font-size: 20px;
  font-weight: 600;
  color: #333;
}
.app-info-section {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #555;
}
.info-loading {
  display: flex;
  align-items: center;
  gap: 8px;
}
.info-display {
  display: flex;
  align-items: center;
  gap: 12px;
}
.app-name-container {
  display: flex;
  align-items: center;
  gap: 8px;
}
.app-name {
  font-size: 16px;
  font-weight: 500;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.2s ease;
}
.app-name.editable {
  cursor: pointer;
  border: 1px solid transparent;
}
.app-name.editable:hover {
  background-color: #f5f5f5;
  border-color: #d9d9d9;
}
.app-name-input {
  width: 200px;
}
.owner-tag {
  background-color: #e6f7ff;
  border: 1px solid #91d5ff;
  color: #1890ff;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
}

.code-gen-type-tag {
  font-size: 12px;
  font-weight: 500;
  border-radius: 6px;
  margin-left: 8px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  white-space: nowrap;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

.code-gen-type-tag:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
}
.info-button {
  color: #666;
  border: none;
  box-shadow: none;
}
.info-button:hover {
  color: #1890ff;
  background-color: #f0f0f0;
}
.info-placeholder {
  color: #999;
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

.right-section {
  display: flex;
  align-items: center;
}

.edit-button {
  margin-left: 16px;
}
</style>
