<template>
  <div class="app-container">
    <div class="app-main">
      <FileLoader v-if="!isMobile" />
      <MobileFileLoader v-else />
    </div>
    
    <!-- 设置模态框 -->
    <SettingsModal v-if="settingsStore.showSettings" />
  </div>
</template>

<script setup>
import { onMounted, computed } from 'vue';
import FileLoader from './components/FileLoader.vue';
import MobileFileLoader from './components/MobileFileLoader.vue';
import SettingsModal from './components/SettingsModal.vue';
import { useSettingsStore } from './stores/settings';

const settingsStore = useSettingsStore();

// Check if device is mobile
const isMobile = computed(() => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
    window.innerWidth <= 768;
})

onMounted(() => {
  console.log('App component mounted, ready to load files');
  // 应用设置
  settingsStore.applyTheme();
});
</script>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  width: 100vw;
  height: 100vh;
  min-height: 100vh;
  background: var(--bg-primary, #f9fafb);
  color: var(--text-primary, #333);
  font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
  overflow: hidden;
}

.app-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 0;
}

.app-footer {
  text-align: center;
  font-size: 0.8rem;
  color: #777;
  padding: 1rem;
  border-top: 1px solid var(--border-color, #e5e7eb);
  background: var(--bg-secondary, #fafafa);
  flex-shrink: 0;
}

.footer-text {
  margin: 0;
}
</style>
