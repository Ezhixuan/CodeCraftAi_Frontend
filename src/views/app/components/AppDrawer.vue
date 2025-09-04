<template>
  <div class="app-drawer">
    <a-drawer
      :open="visible"
      :closable="false"
      placement="left"
      :get-container="false"
      @close="handleClose"
      :style="{ position: 'absolute' }"
    >
      <div class="drawer-content">
        <!-- 顶部区域：新建应用和跳转首页 -->
        <div class="drawer-header">
          <a-space direction="vertical" size="small" style="width: 100%">
            <a-button type="primary" block @click="handleCreateApp">
              <template #icon><PlusOutlined /></template>
              新建应用
            </a-button>
          </a-space>
        </div>

        <!-- 中间区域：应用列表 -->
        <div class="drawer-body" ref="appListRef">
          <div class="app-list-section">
            <h4>我的应用</h4>
            <a-spin :spinning="appListLoading">
              <div v-if="appList.length === 0 && !appListLoading" class="empty-state">
                <div class="empty-icon">📱</div>
                <p>暂无应用</p>
                <a-button type="link" @click="handleCreateApp">创建第一个应用</a-button>
              </div>
              <div v-else>
                <a-list :data-source="appList" size="small">
                  <template #renderItem="{ item }">
                    <a-list-item class="app-item" @click="() => handleAppClick(item)">
                      <a-list-item-meta>
                        <template #avatar>
                          <a-avatar :src="item.cover" shape="square">
                            {{ item.name?.charAt(0) || 'A' }}
                          </a-avatar>
                        </template>
                        <template #title>
                          <div class="app-title">{{ item.name }}</div>
                        </template>
                        <template #description>
                          <div class="app-time">
                            {{ formatAppTime(item.updateTime) }}
                          </div>
                        </template>
                      </a-list-item-meta>
                    </a-list-item>
                  </template>
                </a-list>

                <!-- 加载更多指示器 -->
                <div v-if="appListLoading" class="load-more-indicator">
                  <a-spin size="small" />
                  <span>加载中...</span>
                </div>

                <!-- 没有更多数据指示器 -->
                <div v-if="!hasMore && appList.length > 0" class="no-more-indicator">
                  没有更多应用了
                </div>
              </div>
            </a-spin>
          </div>
        </div>

        <!-- 底部区域：用户信息 -->
        <div class="drawer-footer">
          <div v-if="isLogin" class="user-info">
            <UserAvatar :user-info="loginUser" />
            <div class="user-details">
              <div class="user-name">{{ loginUser.name }}</div>
              <div class="user-role">
                {{ getUserRoleText(loginUser.role) }}
              </div>
            </div>
          </div>
          <div v-else class="login-prompt">
            <a-button type="link" @click="handleLogin">登录</a-button>
          </div>
        </div>
      </div>
    </a-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { PlusOutlined } from '@ant-design/icons-vue'
import { useLoginUserStore } from '@/stores/loginUser'
import { message } from 'ant-design-vue'
import { getAppList } from '@/api/appController.ts'
import { useInfiniteScroll } from '@vueuse/core'
import { useEnumStore } from '@/stores/enum'
import UserAvatar from '@/components/User/UserAvatar.vue'
import DateUtil from '@/utils/DateUtil.ts'

const router = useRouter()
const loginUserStore = useLoginUserStore()
const enumStore = useEnumStore()

const appListRef = ref<HTMLElement | null>(null)
const appList = ref<API.AppInfoCommonResVo[]>([])
const appListLoading = ref(false)
const hasMore = ref(true)
const firstLoad = ref(true)
const pageNo = ref(1)
const pageSize = ref(20)
const loginUser = loginUserStore.loginUser
const isLogin = loginUserStore.isLogin()

// 定义组件属性
const props = defineProps<{
  visible: boolean
}>()

// 定义事件
const emit = defineEmits<{
  (e: 'update:visible', visible: boolean): void
  (e: 'create-app'): void
  (e: 'app-click', app: API.AppInfoCommonResVo): void
  (e: 'login'): void
  (e: 'close'): void
}>()

// 处理关闭事件
const handleClose = () => {
  emit('close')
  emit('update:visible', false)
}

// 处理新建应用
const handleCreateApp = () => {
  handleClose()
  router.push('/')
}

// 处理应用点击
const handleAppClick = (app: API.AppInfoCommonResVo) => {
  handleClose()
  emit('app-click', app)
}

// 处理登录
const handleLogin = () => {
  handleClose()
  emit('login')
}

useInfiniteScroll(
  appListRef,
  async () => {
    pageNo.value += 1
    await fetchAppList()
  },
  {
    distance: 10,
    canLoadMore: () => !firstLoad.value && hasMore.value && !appListLoading.value,
  },
)

// 格式化应用时间
const formatAppTime = (time?: string) => {
  return DateUtil.formatAppTime(time)
}

const getUserRoleText = (role?: string) => {
  return enumStore.getUserRoleText(role)
}

// 监听visible属性变化
watch(
  () => props.visible,
  (newVisible) => {
    // 只有在抽屉打开且是首次加载时才获取数据
    if (newVisible && firstLoad.value) {
      fetchAppList()
    }
  },
)

const fetchAppList = async () => {
  if (!isLogin || appListLoading.value || !hasMore.value) return

  appListLoading.value = true
  try {
    const response = await getAppList({
      queryReqVo: {
        pageNo: pageNo.value,
        pageSize: pageSize.value,
        orderBy: 'desc',
        userId: loginUser.id,
      },
    })
    if (response.data.data?.list) {
      const list = response.data.data.list
      if (firstLoad.value) {
        appList.value = list
        firstLoad.value = false
      } else {
        appList.value = [...appList.value, ...list]
      }
      hasMore.value = list.length >= pageSize.value
    }
  } catch (error) {
    console.error('应用列表获取失败', error)
    message.error('应用列表获取失败')
    if (pageNo.value > 1) {
      pageNo.value -= 1
    }
  } finally {
    appListLoading.value = false
  }
}
</script>

<style scoped>
.drawer-content {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.drawer-header {
  margin-bottom: 16px;
}

.drawer-body {
  flex: 1;
  overflow-y: auto;
  margin-bottom: 16px;
}

.app-list-section h4 {
  margin-bottom: 12px;
  color: #1f2937;
  font-weight: 600;
}

.empty-state {
  text-align: center;
  padding: 24px 0;
  color: #6b7280;
}

.empty-icon {
  font-size: 32px;
  margin-bottom: 8px;
}

.app-item {
  cursor: pointer;
  border-radius: 8px;
  margin-bottom: 8px;
  transition: all 0.2s ease;
}

.app-item:hover {
  background-color: #f3f4f6;
}

.app-title {
  font-weight: 500;
  color: #1f2937;
  font-size: 14px;
}

.app-time {
  color: #6b7280;
  font-size: 12px;
}

/* 加载更多指示器样式 */
.load-more-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  color: #666;
  font-size: 14px;
}

.load-more-indicator .anticon {
  margin-right: 8px;
}

/* 没有更多数据指示器样式 */
.no-more-indicator {
  text-align: center;
  padding: 16px;
  color: #999;
  font-size: 14px;
  border-top: 1px solid #f0f0f0;
}

.drawer-footer {
  border-top: 1px solid #e5e7eb;
  padding-top: 16px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-details {
  flex: 1;
}

.user-name {
  font-weight: 500;
  color: #1f2937;
  font-size: 14px;
  line-height: 1.2;
}

.user-role {
  color: #6b7280;
  font-size: 12px;
  line-height: 1.2;
}

.login-prompt {
  text-align: center;
}
</style>
