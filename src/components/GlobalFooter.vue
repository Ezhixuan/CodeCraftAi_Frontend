<template>
  <div class="global-footer">
    <div class="footer-content">
      <p class="copyright">
        <a href="https://blog.ezhixuan.xyz" target="_blank">Copyright ©Ezhixuan2025 - All rights reserved</a>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
// 无需额外逻辑
</script>

<style scoped>
.global-footer {
  background: #fff;
  border-top: 1px solid #e8e8e8;
  padding: 20px 0;
}

.footer-content {
  text-align: center;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

.copyright {
  margin: 0;
  color: #666;
  font-size: 14px;
  line-height: 1.5;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .footer-content {
    padding: 0 16px;
  }

  .copyright {
    font-size: 13px;
  }
}

@media (max-width: 576px) {
  .footer-content {
    padding: 0 12px;
  }

  .copyright {
    font-size: 12px;
  }
}
</style>
