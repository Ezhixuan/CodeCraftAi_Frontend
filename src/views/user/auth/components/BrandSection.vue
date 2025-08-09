<template>
  <div class="brand-section">
    <div class="brand-content">
      <h1 class="brand-title">
        <span class="gradient-text">CodeCraft</span>
        <span class="ai-text">AI</span>
      </h1>
      <p class="brand-subtitle">智能代码生成平台</p>

      <div class="feature-list">
        <div class="feature-item">
          <div class="feature-icon">🚀</div>
          <span>AI 驱动的代码生成</span>
        </div>
        <div class="feature-item">
          <div class="feature-icon">⚡</div>
          <span>快速原型开发</span>
        </div>
        <div class="feature-item">
          <div class="feature-icon">🎯</div>
          <span>智能代码优化</span>
        </div>
      </div>

      <!-- 项目特色 -->
      <div class="project-highlights">
        <div class="highlight-item">
          <div class="highlight-icon">💡</div>
          <div class="highlight-content">
            <div class="highlight-title">开源项目</div>
            <div class="highlight-desc">持续迭代，欢迎贡献</div>
          </div>
        </div>
        <div class="highlight-item">
          <div class="highlight-icon">🔧</div>
          <div class="highlight-content">
            <div class="highlight-title">轻量级</div>
            <div class="highlight-desc">简洁高效，易于部署</div>
          </div>
        </div>
        <div class="highlight-item">
          <div class="highlight-icon">📚</div>
          <div class="highlight-content">
            <div class="highlight-title">学习友好</div>
            <div class="highlight-desc">代码清晰，文档完善</div>
          </div>
        </div>
      </div>

      <!-- 技术栈展示 -->
      <div class="tech-stack">
        <div class="tech-title">技术栈</div>
        <div class="tech-tags">
          <span class="tech-tag">持续完善中...</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 组件无需额外属性
</script>

<style scoped>
.brand-section {
  flex: 1;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40px 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  position: relative;
  overflow: hidden;
}

.brand-content {
  text-align: center;
  max-width: 400px;
  z-index: 1;
}

.brand-title {
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 16px;
  line-height: 1.2;
}

.gradient-text {
  background: linear-gradient(45deg, #fff, #e0e7ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.ai-text {
  color: #fbbf24;
  text-shadow: 0 0 20px rgba(251, 191, 36, 0.5);
}

.brand-subtitle {
  font-size: 1.2rem;
  margin-bottom: 40px;
  opacity: 0.9;
}

.feature-list {
  text-align: left;
  margin-bottom: 40px;
}

.feature-item {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  font-size: 1rem;
  transition: transform 0.3s ease;
}

.feature-item:hover {
  transform: translateX(8px);
}

.feature-icon {
  font-size: 1.5rem;
  margin-right: 12px;
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
}

.project-highlights {
  margin-bottom: 30px;
}

.highlight-item {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  backdrop-filter: blur(10px);
  transition: transform 0.3s ease;
}

.highlight-item:hover {
  transform: translateX(4px);
}

.highlight-icon {
  font-size: 1.2rem;
  margin-right: 12px;
  width: 32px;
  height: 32px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.highlight-content {
  text-align: left;
}

.highlight-title {
  font-weight: 600;
  margin-bottom: 2px;
  font-size: 0.9rem;
}

.highlight-desc {
  font-size: 0.8rem;
  opacity: 0.8;
  line-height: 1.3;
}

.tech-stack {
  text-align: center;
}

.tech-title {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 12px;
  opacity: 0.9;
}

.tech-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
}

.tech-tag {
  background: rgba(255, 255, 255, 0.2);
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 0.8rem;
  font-weight: 500;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
}

.tech-tag:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .brand-section {
    padding: 30px 20px;
  }

  .brand-title {
    font-size: 2.5rem;
  }

  .brand-subtitle {
    font-size: 1rem;
  }

  .project-highlights {
    margin-bottom: 20px;
  }

  .highlight-item {
    margin-bottom: 12px;
    padding: 10px;
  }

  .tech-tags {
    gap: 6px;
  }

  .tech-tag {
    font-size: 0.75rem;
    padding: 3px 8px;
  }
}

@media (max-width: 480px) {
  .brand-title {
    font-size: 2rem;
  }

  .project-highlights {
    display: none;
  }

  .tech-stack {
    margin-top: 20px;
  }
}
</style>
