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
                v-if="isEditing && isOwner"
                v-model:value="editingName"
                @blur="saveAppName"
                @pressEnter="saveAppName"
                @keyup.esc="cancelEdit"
                class="app-name-input"
                :maxlength="50"
                ref="nameInputRef"
              />
              <span v-else class="app-name" :class="{ editable: isOwner }" @click="startEdit">
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
              <span v-if="isOwner" class="owner-tag">我的应用</span>
            </div>

            <AppInfoPopover :app-info="appInfo" />
          </div>
          <div v-else class="info-placeholder">
            <span>无法加载应用信息</span>
          </div>
        </div>
      </div>

      <div class="right-section" v-if="isOwner">
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
import { ref, onMounted, nextTick, computed } from 'vue'
import { putAppUpdate } from '@/api/appController.ts'
import { message } from 'ant-design-vue'
import { CodeOutlined, Html5Outlined, EditOutlined } from '@ant-design/icons-vue'
import { useRouter } from 'vue-router'
import { useLoginUserStore } from '@/stores/loginUser'
import { useEnumStore } from '@/stores/enum'
import AppInfoPopover from '@/views/app/components/AppInfoPopover.vue'

const router = useRouter()
const loginUser = useLoginUserStore()
const enumStore = useEnumStore()
const loading = ref(false)
const isEditing = ref(false)
const editingName = ref('')
const nameInputRef = ref()
const isOwner = computed(() => {
  return props.sysAppInfo.userId === loginUser.loginUser.id
})
const appInfo = computed(() => {
  return props.sysAppInfo
})
const appId = computed(() => {
  return props.sysAppInfo.id
})

// 定义组件属性
const props = defineProps<{
  sysAppInfo: API.AppInfoCommonResVo
  editMode?: boolean
  editModeLoading?: boolean
}>()

// 定义事件
const emit = defineEmits<{
  (e: 'logo-mouse-over'): void
  (e: 'update:edit-mode'): void
}>()

const startEditMode = () => {
  emit('update:edit-mode')
}

const handleLogoMouseOver = () => {
  emit('logo-mouse-over')
}

const goHome = () => {
  router.push('/')
}

onMounted(() => {
  enumStore.loadCodeGenTypeList()
})

// --- Methods ---
const startEdit = () => {
  if (!isOwner.value) return
  isEditing.value = true
  editingName.value = appInfo.value?.name || ''
  nextTick(() => {
    nameInputRef.value?.focus()
  })
}

const saveAppName = async () => {
  if (!appId.value) {
    message.error('应用ID不能为空')
    return
  }
  if (!editingName.value.trim()) {
    message.error('应用名称不能为空')
    return
  }
  if (editingName.value === appInfo.value?.name) {
    return
  }
  const trimmedName = editingName.value.trim()
  try {
    const updateReq: API.AppUpdateCommonReqVo = {
      id: appId.value,
      name: trimmedName,
    }
    await putAppUpdate(updateReq)
    editingName.value = trimmedName
    if (appInfo.value) {
      appInfo.value.name = trimmedName
    }
    message.success('应用名称更新成功')
  } catch (error) {
    message.error('更新应用名称失败')
    console.error('更新应用名称失败:', error)
  } finally {
    isEditing.value = false
  }
}

const cancelEdit = () => {
  isEditing.value = false
  editingName.value = appInfo.value?.name || ''
}

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
    html: {
      color: 'orange',
      icon: Html5Outlined,
      label: 'HTML',
    },
    multi_file: {
      color: 'cyan',
      icon: CodeOutlined,
      label: '多文件',
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
.info-placeholder {
  color: #999;
}

.right-section {
  display: flex;
  align-items: center;
}

.edit-button {
  margin-left: 16px;
}
</style>
