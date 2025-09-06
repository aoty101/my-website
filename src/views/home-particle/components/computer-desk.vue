<template>
  <div class="model-container">
    <canvas class="webgl"></canvas>
  </div>
</template>
<script setup>
import { onMounted, onUnmounted } from 'vue'
import ModelScene from '@/three/ModelScene.js'
let modelScene = null
onMounted(() => {
  // 初始化模型场景
  const webglCanvas = document.querySelector('.webgl')
  if (webglCanvas) {
    modelScene = new ModelScene(webglCanvas)
  }
})

onUnmounted(() => {
  // 清理资源
  if (modelScene) {
    modelScene.dispose()
  }
})
</script>

<style scoped>
/* 模型容器样式 */
.model-container {
  position: relative;
  width: 100%;
  max-width: 600px;
  height: 400px;
  margin: 20px auto;
  border-radius: 16px;
  overflow: hidden;
  background: transparent; /* 确保容器背景透明 */
}

.webgl {
  width: 100%;
  height: 100%;
  display: block;
  cursor: grab;
}

.webgl:active {
  cursor: grabbing;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .model-container {
    height: 300px;
    margin: 16px auto;
  }
}
</style>
