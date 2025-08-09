<template>
  <div class="global-header">
    <div class="header-left">
      <!-- Logo 和网站标题 -->
      <div class="logo-section">
        <img src="@/assets/logo.svg" alt="Logo" class="logo" />
        <span class="site-title">CodeCraft AI</span>
      </div>

      <!-- 导航菜单 -->
      <a-menu v-model:selectedKeys="selectedKeys" mode="horizontal" class="nav-menu" :items="menuItems"
        @click="handleMenuClick" />
    </div>

    <div class="header-right">
      <div v-if="isLogin">
        <a-dropdown>
          <a-space>
            <a-avatar :src="loginUserStore.loginUser.avatar" :style="{ backgroundColor: '#1890ff' }">
              {{ loginUserStore.loginUser.name?.charAt(0) || loginUserStore.loginUser.account?.charAt(0) }}
            </a-avatar>
            {{ loginUserStore.loginUser.name }}
          </a-space>
          <template #overlay>
            <a-menu>
              <a-menu-item key="logout" @click="handleLogout">
                退出登录
              </a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>
      </div>
      <div v-else>
        <a-button type="primary" @click="handleLogin">
          登录
        </a-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { message, type MenuProps } from 'ant-design-vue'
import { useRouter } from 'vue-router'
import { useLoginUserStore } from '@/stores/loginUser'
import { doLogout } from '@/api/yonghukongzhiqi'
import type { MenuItem, UserRole } from './menu'
import { checkMenuPermission } from './AuthUtil'
import { doJump, getMenuConfig } from '@/config/menuConfig'

const router = useRouter();
const loginUserStore = useLoginUserStore();

const isLogin = computed(() => {
  return loginUserStore.loginUser.id;
});

// 选中的菜单项
const selectedKeys = ref<string[]>(['/']);
// 监听路由变化，更新选中的菜单项
router.afterEach((to) => {
  selectedKeys.value = [to.path]
});

// 从配置文件获取菜单配置
const allMenuItems: MenuItem[] = getMenuConfig();

// 根据用户权限过滤菜单
const menuItems = computed<MenuProps['items']>(() => {
  const userRole = (loginUserStore.loginUser.role as UserRole) || 'GUEST';

  return allMenuItems
    .filter(item => checkMenuPermission(item, userRole))
    .map(item => ({
      key: item.key,
      label: item.label,
      title: item.title
    }));
})

// 登录处理
const handleLogin = () => {
  // 包含回调 如果是从其他页面跳转过来的 则需要在登录成功后跳转回该页面
  const redirect = router.currentRoute.value.fullPath;
  if (!redirect.includes('/login') && !redirect.includes('/register')) {
    router.push('/auth/login?redirect=' + redirect);
  }
}

const handleMenuClick = (menuInfo: { key: string }) => {
  const key = menuInfo.key;
  selectedKeys.value = [key];
  doJump(key);
}

const handleLogout = async () => {
  await doLogout();
  loginUserStore.logout();
  router.push('/auth/login');
  message.success('退出登录成功');
}
</script>

<style scoped>
.global-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 64px;
  padding: 0 24px;
  background: #fff;
}

.header-left {
  display: flex;
  align-items: center;
  flex: 1;
}

.logo-section {
  display: flex;
  align-items: center;
  margin-right: 40px;
}

.logo {
  height: 32px;
  width: 32px;
  margin-right: 12px;
}

.site-title {
  font-size: 18px;
  font-weight: 600;
  color: #1890ff;
  white-space: nowrap;
}

.nav-menu {
  flex: 1;
  border-bottom: none;
  line-height: 64px;
}

.header-right {
  display: flex;
  align-items: center;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .global-header {
    padding: 0 16px;
  }

  .logo-section {
    margin-right: 20px;
  }

  .site-title {
    font-size: 16px;
  }

  .nav-menu {
    display: none;
    /* 在小屏幕上隐藏菜单，可以后续添加移动端菜单 */
  }
}

@media (max-width: 576px) {
  .global-header {
    padding: 0 12px;
  }

  .logo {
    height: 28px;
    width: 28px;
  }

  .site-title {
    font-size: 14px;
  }
}
</style>
