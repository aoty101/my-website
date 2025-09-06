<template>
  <div class="page-container">
    <!-- 固定的Three.js背景 -->
    <div class="fixed-background">
      <canvas class="experience"></canvas>
    </div>

    <!-- 可滚动的内容区域 -->
    <div class="scrollable-content">
      <div class="content-section">
        <h1 class="text-4xl font-bold text-white mb-4">欢迎来到</h1>
        <p class="text-white/80 mb-8">这是一个使用Three.js创建的粒子效果背景</p>
      </div>

      <div class="content-section">
        <h2 class="text-3xl font-bold text-white mb-4">项目特色</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div class="bg-white/10 backdrop-blur-sm rounded-lg p-6">
            <h3 class="text-xl font-semibold text-white mb-2">3D 粒子效果</h3>
            <p class="text-white/70">使用WebGL技术创建的动态粒子背景</p>
          </div>
          <div class="bg-white/10 backdrop-blur-sm rounded-lg p-6">
            <h3 class="text-xl font-semibold text-white mb-2">响应式设计</h3>
            <p class="text-white/70">适配各种屏幕尺寸的现代化界面</p>
          </div>
          <div class="bg-white/10 backdrop-blur-sm rounded-lg p-6">
            <h3 class="text-xl font-semibold text-white mb-2">流畅动画</h3>
            <p class="text-white/70">基于GSAP的高性能动画效果</p>
          </div>
        </div>
      </div>

      <div class="content-section">
        <h2 class="text-3xl font-bold text-white mb-4">技术栈</h2>
        <div class="flex flex-wrap gap-4">
          <span class="bg-blue-500/20 text-blue-300 px-4 py-2 rounded-full"
            >Vue 3</span
          >
          <span class="bg-green-500/20 text-green-300 px-4 py-2 rounded-full"
            >Three.js</span
          >
          <span class="bg-purple-500/20 text-purple-300 px-4 py-2 rounded-full"
            >Vite</span
          >
          <span class="bg-yellow-500/20 text-yellow-300 px-4 py-2 rounded-full"
            >GSAP</span
          >
          <span class="bg-cyan-500/20 text-cyan-300 px-4 py-2 rounded-full"
            >UnoCSS</span
          >
        </div>
      </div>

      <div class="content-section">
        <h2 class="text-3xl font-bold text-white mb-4">关于我</h2>
        <p class="text-white/80 text-lg leading-relaxed">
          我是一名前端开发工程师，专注于现代Web技术的应用和创新。
          这个项目展示了如何将Three.js与Vue
          3结合，创造出令人印象深刻的视觉效果。
        </p>
      </div>

      <div class="content-section">
        <h2 class="text-3xl font-bold text-white mb-4">更多内容</h2>
        <div class="space-y-4">
          <div class="bg-white/5 backdrop-blur-sm rounded-lg p-6">
            <h3 class="text-xl font-semibold text-white mb-2">项目展示</h3>
            <p class="text-white/70">这里可以展示更多的项目作品和技术成果</p>
          </div>
          <div class="bg-white/5 backdrop-blur-sm rounded-lg p-6">
            <h3 class="text-xl font-semibold text-white mb-2">联系方式</h3>
            <p class="text-white/70">欢迎与我交流技术心得和合作机会</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import Application from '@/three/Application.js'
let application = null

onMounted(() => {
  application = new Application()
})
</script>

<style scoped>
.page-container {
  position: relative;
  width: 100%;
  min-height: 100vh;
}

/* 固定的Three.js背景 */
.fixed-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: -1; /* 确保背景在最底层 */
  pointer-events: none; /* 防止背景阻挡内容交互 */
}

.experience {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

/* 可滚动的内容区域 */
.scrollable-content {
  position: relative;
  z-index: 1; /* 确保内容在背景之上 */
  background: transparent; /* 透明背景，让Three.js背景可见 */
}

.content-section {
  padding: 80px 20px;
  max-width: 1200px;
  margin: 0 auto;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
}

/* 确保内容有足够的对比度 */
.content-section h1,
.content-section h2,
.content-section h3 {
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
}

.content-section p {
  text-shadow: 0 1px 5px rgba(0, 0, 0, 0.3);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .content-section {
    padding: 60px 15px;
  }

  .content-section h1 {
    font-size: 2rem;
  }

  .content-section h2 {
    font-size: 1.75rem;
  }
}

/* 确保滚动条样式 */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
}

::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}
</style>
