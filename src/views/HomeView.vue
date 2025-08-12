<template>
  <div class="home-container">
    <!-- 英雄区域 -->
    <section class="hero">
      <div class="hero-background">
        <div class="gradient-orb orb-1"></div>
        <div class="gradient-orb orb-2"></div>
        <div class="gradient-orb orb-3"></div>
      </div>
      <div class="hero-content">
        <h1 class="hero-title">
          AI 驱动的零代码应用
          <span class="gradient-text">生成平台</span>
        </h1>
        <p class="hero-subtitle">
          只需一句话，AI 即可为您生成完整的应用程序
          <br />
          从设计到部署，全程自动化，让创意即刻成真
        </p>
        <div class="hero-actions">
          <a-input-search v-model:value="prompt" placeholder="描述您想要的应用，例如：一个电商网站..." size="large" class="prompt-input"
            @search="handleGenerate">
            <template #enterButton>
              <a-button type="primary" size="large" :loading="generating">
                <SendOutlined />
                立即生成
              </a-button>
            </template>
          </a-input-search>
        </div>
        <div class="hero-stats">
          <div class="stat">
            <span class="stat-number">10万+</span>
            <span class="stat-label">应用已生成</span>
          </div>
          <div class="stat">
            <span class="stat-number">50+</span>
            <span class="stat-label">模板类型</span>
          </div>
          <div class="stat">
            <span class="stat-number">99%</span>
            <span class="stat-label">用户满意度</span>
          </div>
        </div>
      </div>
    </section>

    <!-- 功能特性 -->
    <section id="features" class="features">
      <div class="container">
        <h2 class="section-title">
          <span class="gradient-text">强大功能</span>
          助力创意实现
        </h2>
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">
              <CodeOutlined />
            </div>
            <h3>智能代码生成</h3>
            <p>基于自然语言描述，AI 自动生成高质量的前端代码</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">
              <LayoutOutlined />
            </div>
            <h3>可视化编辑</h3>
            <p>拖拽式界面设计，所见即所得，无需编码经验</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">
              <CloudUploadOutlined />
            </div>
            <h3>一键部署</h3>
            <p>自动生成可部署的应用包，支持多种云平台</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">
              <ApiOutlined />
            </div>
            <h3>API 集成</h3>
            <p>智能集成第三方服务，自动配置 API 连接</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 产品演示 -->
    <section id="demo" class="demo">
      <div class="container">
        <h2 class="section-title">
          <span class="gradient-text">演示体验</span>
          见证 AI 的力量
        </h2>
        <div class="demo-showcase">
          <div class="demo-input">
            <h3>输入需求</h3>
            <div class="demo-prompt">
              "创建一个现代化的博客网站，支持文章发布、分类管理、
              用户评论，要有响应式设计，采用深色主题"
            </div>
          </div>
          <div class="demo-arrow">
            <ArrowRightOutlined />
          </div>
          <div class="demo-output">
            <h3>AI 生成结果</h3>
            <div class="demo-preview">
              <div class="preview-frame">
                <div class="preview-header">
                  <div class="preview-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
                <div class="preview-content">
                  <div class="preview-navbar">
                    <div class="preview-logo">Blog</div>
                    <div class="preview-nav">
                      <span>首页</span>
                      <span>文章</span>
                      <span>关于</span>
                    </div>
                  </div>
                  <div class="preview-hero">
                    <h1>欢迎来到我的博客</h1>
                    <p>分享技术，记录成长</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 模板展示 -->
    <section class="templates">
      <div class="container">
        <h2 class="section-title">
          <span class="gradient-text">丰富模板</span>
          满足各种需求
        </h2>
        <div class="templates-grid">
          <div class="template-card">
            <div class="template-preview">
              <div class="template-mockup ecommerce">
                <div class="mockup-header">
                  <div class="mockup-logo">Shop</div>
                  <div class="mockup-cart">🛒</div>
                </div>
                <div class="mockup-products">
                  <div class="product-card"></div>
                  <div class="product-card"></div>
                  <div class="product-card"></div>
                </div>
              </div>
            </div>
            <h3>电商网站</h3>
            <p>完整的购物车、支付、订单管理系统</p>
          </div>
          <div class="template-card">
            <div class="template-preview">
              <div class="template-mockup dashboard">
                <div class="mockup-sidebar"></div>
                <div class="mockup-main">
                  <div class="mockup-chart"></div>
                  <div class="mockup-stats">
                    <div class="stat-box"></div>
                    <div class="stat-box"></div>
                    <div class="stat-box"></div>
                  </div>
                </div>
              </div>
            </div>
            <h3>管理后台</h3>
            <p>数据可视化、用户管理、权限控制</p>
          </div>
          <div class="template-card">
            <div class="template-preview">
              <div class="template-mockup landing">
                <div class="mockup-hero">
                  <h1>产品标题</h1>
                  <button>立即开始</button>
                </div>
                <div class="mockup-features">
                  <div class="feature"></div>
                  <div class="feature"></div>
                  <div class="feature"></div>
                </div>
              </div>
            </div>
            <h3>落地页</h3>
            <p>产品展示、营销转化、用户引导</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 页脚 -->
    <footer class="footer">
      <div class="container">
        <div class="footer-content">
          <div class="footer-section">
            <div class="logo">
              <img src="@/assets/codeAi 无背景.png" alt="CodeCraftAI" />
              <span>CodeCraftAI</span>
            </div>
            <p>让每个人都能成为应用开发者</p>
          </div>
          <div class="footer-section">
            <h4>产品</h4>
            <a href="#">功能特性</a>
            <a href="#">价格方案</a>
            <a href="#">更新日志</a>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  SendOutlined,
  CodeOutlined,
  LayoutOutlined,
  CloudUploadOutlined,
  ApiOutlined,
  ArrowRightOutlined
} from '@ant-design/icons-vue'
import { doGenerate } from '@/api/yingyongkongzhiqi'

const prompt = ref('')
const generating = ref(false)
const router = useRouter()

const handleGenerate = async () => {
  if (!prompt.value.trim()) return

  generating.value = true
  try {
    // 第一步：调用doGenerate创建应用记录
    const response = await doGenerate({
      initPrompt: prompt.value
    })
    const appId = response
    console.log('appId', appId)
    // 跳转到应用显示页面，携带应用ID和用户输入
    router.push({
      name: 'CodeMessage',
      query: {
        appId: appId.toString(),
        message: prompt.value,
        action: "true"
      }
    })
  } catch (error) {
    console.error('创建应用时出错:', error)
  } finally {
    generating.value = false
  }
}
</script>

<style scoped>
.home-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%);
  color: #fff;
  overflow-x: hidden;
}

/* 导航栏 */
.navbar {
  position: fixed;
  top: 0;
  width: 100%;
  background: rgba(15, 15, 35, 0.9);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  z-index: 1000;
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 2rem;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.5rem;
  font-weight: bold;
}

.logo img {
  height: 40px;
  width: auto;
}

.nav-links {
  display: flex;
  gap: 2rem;
}

.nav-links a {
  color: #fff;
  text-decoration: none;
  transition: color 0.3s;
}

.nav-links a:hover {
  color: #00d4ff;
}

.nav-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

/* 英雄区域 */
.hero {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 120px 2rem 2rem;
}

.hero-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 1;
}

.gradient-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(100px);
  opacity: 0.3;
  animation: float 20s infinite ease-in-out;
}

.orb-1 {
  width: 400px;
  height: 400px;
  background: linear-gradient(45deg, #00d4ff, #0099cc);
  top: -200px;
  left: -200px;
}

.orb-2 {
  width: 300px;
  height: 300px;
  background: linear-gradient(45deg, #ff006e, #8338ec);
  top: 50%;
  right: -150px;
  animation-delay: -5s;
}

.orb-3 {
  width: 350px;
  height: 350px;
  background: linear-gradient(45deg, #06ffa5, #00d4ff);
  bottom: -175px;
  left: 50%;
  animation-delay: -10s;
}

@keyframes float {

  0%,
  100% {
    transform: translate(0, 0) scale(1);
  }

  33% {
    transform: translate(30px, -30px) scale(1.1);
  }

  66% {
    transform: translate(-20px, 20px) scale(0.9);
  }
}

.hero-content {
  position: relative;
  z-index: 2;
  text-align: center;
  max-width: 800px;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 800;
  margin-bottom: 1.5rem;
  line-height: 1.2;
}

.gradient-text {
  background: linear-gradient(135deg, #00d4ff, #ff006e, #06ffa5);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: 1.25rem;
  color: #b0b0b0;
  margin-bottom: 2.5rem;
  line-height: 1.6;
}

.hero-actions {
  margin-bottom: 3rem;
}

.prompt-input {
  max-width: 600px;
  margin: 0 auto;
}

.prompt-input :deep(.ant-input) {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #fff;
  font-size: 1.1rem;
}

.prompt-input :deep(.ant-input::placeholder) {
  color: rgba(255, 255, 255, 0.6);
}

.hero-stats {
  display: flex;
  justify-content: center;
  gap: 4rem;
  margin-top: 2rem;
}

.stat {
  text-align: center;
}

.stat-number {
  display: block;
  font-size: 2rem;
  font-weight: bold;
  color: #00d4ff;
}

.stat-label {
  display: block;
  font-size: 0.9rem;
  color: #b0b0b0;
  margin-top: 0.25rem;
}

/* 功能特性 */
.features {
  padding: 5rem 2rem;
  background: rgba(255, 255, 255, 0.02);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.section-title {
  text-align: center;
  font-size: 2.5rem;
  margin-bottom: 3rem;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}

.feature-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  padding: 2rem;
  text-align: center;
  transition: transform 0.3s, box-shadow 0.3s;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 40px rgba(0, 212, 255, 0.2);
}

.feature-icon {
  font-size: 3rem;
  color: #00d4ff;
  margin-bottom: 1rem;
}

.feature-card h3 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
}

.feature-card p {
  color: #b0b0b0;
  line-height: 1.6;
}

/* 演示区域 */
.demo {
  padding: 5rem 2rem;
}

.demo-showcase {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 2rem;
  align-items: center;
  max-width: 1000px;
  margin: 0 auto;
}

.demo-input,
.demo-output {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  padding: 2rem;
}

.demo-prompt {
  background: rgba(0, 212, 255, 0.1);
  border-left: 3px solid #00d4ff;
  padding: 1rem;
  border-radius: 0.5rem;
  font-style: italic;
  color: #e0e0e0;
}

.demo-arrow {
  font-size: 2rem;
  color: #00d4ff;
  animation: pulse 2s infinite;
}

@keyframes pulse {

  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.5;
  }
}

.demo-preview {
  background: #fff;
  border-radius: 0.5rem;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.preview-frame {
  width: 100%;
  height: 300px;
  background: #f5f5f5;
}

.preview-header {
  background: #333;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.preview-dots span {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #ff5f57;
  display: inline-block;
}

.preview-dots span:nth-child(2) {
  background: #ffbd2e;
}

.preview-dots span:nth-child(3) {
  background: #28ca42;
}

.preview-content {
  padding: 1rem;
  color: #333;
}

.preview-navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.preview-logo {
  font-weight: bold;
  color: #00d4ff;
}

.preview-nav span {
  margin-left: 1rem;
  color: #666;
}

.preview-hero h1 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.preview-hero p {
  color: #666;
}

/* 模板展示 */
.templates {
  padding: 5rem 2rem;
  background: rgba(255, 255, 255, 0.02);
}

.templates-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.template-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  padding: 1.5rem;
  transition: transform 0.3s;
}

.template-card:hover {
  transform: translateY(-5px);
}

.template-preview {
  height: 200px;
  margin-bottom: 1rem;
  border-radius: 0.5rem;
  overflow: hidden;
  background: #fff;
}

.template-mockup {
  height: 100%;
  padding: 1rem;
  color: #333;
}

.template-mockup.ecommerce {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}

.template-mockup.dashboard {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: #fff;
  display: flex;
}

.template-mockup.landing {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: #fff;
}

.mockup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.mockup-products {
  display: flex;
  gap: 0.5rem;
}

.product-card {
  flex: 1;
  height: 60px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 0.25rem;
}

.mockup-sidebar {
  width: 60px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 0.25rem;
}

.mockup-main {
  flex: 1;
  padding: 0.5rem;
}

.mockup-chart {
  height: 80px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 0.25rem;
  margin-bottom: 0.5rem;
}

.mockup-stats {
  display: flex;
  gap: 0.5rem;
}

.stat-box {
  flex: 1;
  height: 40px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 0.25rem;
}

.mockup-hero {
  text-align: center;
  padding: 2rem 1rem;
}

.mockup-hero h1 {
  font-size: 1.2rem;
  margin-bottom: 1rem;
}

.mockup-hero button {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  color: #fff;
}

.mockup-features {
  display: flex;
  gap: 0.5rem;
  padding: 0 1rem;
}

.feature {
  flex: 1;
  height: 40px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 0.25rem;
}

.template-card h3 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.template-card p {
  color: #b0b0b0;
}

/* 价格方案 */
.pricing {
  padding: 5rem 2rem;
}

.pricing-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  max-width: 1000px;
  margin: 0 auto;
}

.pricing-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  padding: 2rem;
  text-align: center;
  position: relative;
}

.pricing-card.featured {
  border-color: #00d4ff;
  box-shadow: 0 0 20px rgba(0, 212, 255, 0.3);
  transform: scale(1.05);
}

.badge {
  position: absolute;
  top: -10px;
  left: 50%;
  transform: translateX(-50%);
  background: #00d4ff;
  color: #0f0f23;
  padding: 0.25rem 1rem;
  border-radius: 1rem;
  font-size: 0.875rem;
  font-weight: bold;
}

.price {
  margin: 1.5rem 0;
}

.currency {
  font-size: 1.5rem;
  vertical-align: top;
}

.amount {
  font-size: 3rem;
  font-weight: bold;
  color: #00d4ff;
}

.period {
  color: #b0b0b0;
}

.features-list {
  list-style: none;
  padding: 0;
  margin: 2rem 0;
}

.features-list li {
  padding: 0.5rem 0;
  color: #b0b0b0;
}

/* 页脚 */
.footer {
  background: rgba(0, 0, 0, 0.3);
  padding: 3rem 2rem 1rem;
}

.footer-content {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.footer-section h4 {
  margin-bottom: 1rem;
  color: #00d4ff;
}

.footer-section a {
  display: block;
  color: #b0b0b0;
  text-decoration: none;
  margin-bottom: 0.5rem;
  transition: color 0.3s;
}

.footer-section a:hover {
  color: #00d4ff;
}

.footer-bottom {
  text-align: center;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  color: #666;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .hero-title {
    font-size: 2.5rem;
  }

  .hero-stats {
    flex-direction: column;
    gap: 2rem;
  }

  .demo-showcase {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .demo-arrow {
    transform: rotate(90deg);
  }

  .footer-content {
    grid-template-columns: 1fr;
    text-align: center;
  }

  .nav-links {
    display: none;
  }
}
</style>
