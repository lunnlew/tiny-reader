<template>
  <div class="loading-container">
    <div class="loading-overlay" v-if="isLoading && !hasToc">
      <div class="spinner"></div>
      <p>正在加载文件...</p>
    </div>
    <div class="reader-loading-overlay" v-else-if="isLoading && hasToc">
      <div class="spinner"></div>
      <p>正在加载章节...</p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  isLoading: Boolean,
  hasToc: Boolean
})
</script>

<style scoped>
.loading-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-overlay {
  text-align: center;
  color: var(--text-secondary, #4b5563);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
}

.reader-loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.8);
  z-index: 10;
}

.reader-loading-overlay .spinner {
  margin-bottom: 1rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--border-color, #e5e7eb);
  border-top: 4px solid var(--accent-color, #4f46e5);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}
</style>