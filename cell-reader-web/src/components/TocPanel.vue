<template>
  <Transition name="toc-panel">
    <div v-show="toc.length > 0 && isTocVisible" class="toc-panel">
      <div class="toc-header">
        <h2 class="toc-title">目录</h2>
        <div class="toc-actions">
          <button @click="onToggleSettings" class="settings-btn" title="设置">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="3"></circle>
              <path
                d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z">
              </path>
            </svg>
          </button>
          <button @click="onReloadFile" class="reload-file-btn" title="重新加载文件">
            ↻
          </button>
        </div>
      </div>
      <div class="toc-content">
        <TocView 
          :toc="toc" 
          :current-chapter-index="currentChapterIndex"
          @jump="onJumpToChapter" />
      </div>
    </div>
  </Transition>
</template>

<script setup>
import TocView from './TocView.vue'

defineProps({
  toc: Array,
  isTocVisible: Boolean,
  currentChapterIndex: Number
})

const emit = defineEmits([
  'toggle-settings',
  'reload-file',
  'jump-to-chapter'
])

function onToggleSettings() {
  emit('toggle-settings')
}

function onReloadFile() {
  emit('reload-file')
}

function onJumpToChapter(index) {
  emit('jump-to-chapter', index)
}
</script>

<style scoped>
.toc-panel {
  width: 280px;
  max-width: 280px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 1rem;
  background-color: var(--bg-secondary, white);
  height: 100%;
  min-height: 0;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

/* 目录面板过渡动画 */
.toc-panel-enter-active,
.toc-panel-leave-active {
  transition: all 0.3s ease;
  max-width: 280px;
}

.toc-panel-enter-from {
  max-width: 0;
  opacity: 0;
  transform: translateX(-20px);
}

.toc-panel-leave-to {
  max-width: 0;
  opacity: 0;
  transform: translateX(-20px);
}

.toc-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  flex-shrink: 0;
}

.toc-content {
  flex: 1;
  min-height: 0;
  height: 100%;
  padding: 2rem 0;
}

.toc-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.toc-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-left: auto;
  /* 让按钮组靠右对齐 */
}

.toc-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
  color: var(--text-primary, #1f2937);
}

.reload-file-btn,
.settings-btn,
.toc-collapse-btn,
.toc-expand-btn {
  background-color: var(--toc-item-hover-bg, #e5e7eb);
  color: var(--text-secondary, #4b5563);
  border: none;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  padding: 0;
}

.reload-file-btn:hover,
.settings-btn:hover,
.toc-collapse-btn:hover {
  background-color: var(--border-color, #d1d5db);
}

.toc-expand-btn {
  background-color: var(--toc-bg, #ffffff);
  border: 1px solid var(--border-color, #e5e7eb);
  width: 24px;
  height: 40px;
  border-radius: 4px 0 0 4px;
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;
  font-size: 1.2rem;
  box-shadow: 2px 0 5px -2px rgba(0, 0, 0, 0.1);
}

.toc-expand-btn:hover {
  background-color: var(--toc-item-hover-bg, #f9fafb);
  color: var(--accent-color, #4f46e5);
}

.settings-btn svg {
  width: 14px;
  height: 14px;
  display: block;
  fill: none;
  stroke: currentColor;
  /* 明确指定SVG继承文字颜色 */
  stroke-width: 2;
}
</style>