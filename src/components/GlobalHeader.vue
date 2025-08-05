<template>
  <div class="global-header">
    <div class="header-left">
      <!-- Logo 和网站标题 -->
      <div class="logo-section">
        <img src="@/assets/logo.svg" alt="Logo" class="logo" />
        <span class="site-title">CodeCraft AI</span>
      </div>
      
      <!-- 导航菜单 -->
      <a-menu
        v-model:selectedKeys="selectedKeys"
        mode="horizontal"
        class="nav-menu"
        :items="menuItems"
      />
    </div>
    
    <div class="header-right">
      <!-- 登录按钮（暂时替代用户头像和昵称） -->
      <a-button type="primary" @click="handleLogin">
        登录
      </a-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { MenuProps } from 'ant-design-vue'

// 选中的菜单项
const selectedKeys = ref<string[]>(['home'])

// 菜单配置
const menuItems: MenuProps['items'] = [
  {
    key: 'home',
    label: '首页',
    title: '首页'
  },
  {
    key: 'about',
    label: '关于',
    title: '关于'
  },
  {
    key: 'features',
    label: '功能',
    title: '功能'
  },
  {
    key: 'contact',
    label: '联系我们',
    title: '联系我们'
  }
]

// 登录处理
const handleLogin = () => {
  console.log('登录功能待实现')
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
    display: none; /* 在小屏幕上隐藏菜单，可以后续添加移动端菜单 */
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