<template>
  <div class="file-loader-container">
    <!-- Hidden file input that's always available -->
    <input type="file" ref="fileInputRef" accept=".txt" @change="onFileSelect" class="file-input" />

    <!-- Show file loader when no content is loaded -->
    <div v-if="!readerStore.currentChapterContent && !readerStore.isLoading" class="drop-zone"
      :class="{ 'drag-over': readerStore.isDragOver }" @dragover.prevent="handleDragOver" @dragleave="handleDragLeave"
      @drop.prevent="handleDrop" @click="triggerFileSelect">
      <div class="drop-content">
        <div class="icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="17 8 12 3 7 8"></polyline>
            <line x1="12" y1="3" x2="12" y2="15"></line>
          </svg>
        </div>
        <h3 class="title">选择或拖放文件到这里</h3>
        <p class="subtitle">支持 .txt 格式文件</p>
        <button class="select-btn" @click.stop="triggerFileSelect">
          选择文件
        </button>
      </div>
    </div>

    <!-- Loading state for initial file processing -->
    <div v-else-if="readerStore.isLoading && !readerStore.toc.length" class="loading-container">
      <div class="loading-overlay">
        <div class="spinner"></div>
        <p>正在加载文件...</p>
      </div>
    </div>

    <!-- File content viewer with pagination when content is available -->
    <div v-else class="reading-layout">
      <!-- Table of Contents on the left -->
      <Transition name="toc-panel">
        <div v-if="readerStore.toc.length > 0 && settingsStore.isTocVisible" class="toc-panel">
          <div class="toc-header">
            <h2 class="toc-title">目录</h2>
            <div class="toc-actions">
              <button @click="toggleSettings" class="settings-btn" title="设置">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="3"></circle>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                </svg>
              </button>
              <button @click="triggerFileSelect" class="reload-file-btn" title="重新加载文件">
                ↻
              </button>
            </div>
          </div>
          <div class="toc-content">
            <TocView :toc="readerStore.toc" @jump="jumpToChapter" />
          </div>
        </div>
      </Transition>

      <!-- 目录收起/展开切换按钮 -->
      <div v-if="readerStore.toc.length > 0" class="toc-toggle-divider">
        <button 
          @click="toggleToc" 
          :title="settingsStore.isTocVisible ? '隐藏目录' : '显示目录'"
          class="toc-toggle-btn"
        >
          {{ settingsStore.isTocVisible ? '«' : '»' }}
        </button>
      </div>

      <!-- Main content area -->
      <div class="main-content">
        <!-- Notification when file is too large to cache fully -->
        <div v-if="readerStore.showLargeFileNotification" class="large-file-notification">
          <p>⚠️ 文件过大，部分内容未完全缓存。刷新后可能无法浏览不同章节。</p>
        </div>

        <div class="reader-container">
          <!-- Show loading spinner in reader when loading a specific chapter -->
          <div v-if="readerStore.isLoading && readerStore.toc.length" class="reader-loading-overlay">
            <div class="spinner"></div>
            <p>正在加载章节...</p>
          </div>
          <ReaderView v-else :content="readerStore.currentChapterContent" />
        </div>

        <!-- Navigation controls at the bottom -->
        <div v-if="readerStore.toc.length > 0" class="bottom-controls">
          <div class="nav-wrapper">
            <button @click="prevChapter" :disabled="readerStore.currentChapterIndex <= 0" class="nav-btn">
              ← 上一章
            </button>
            <span class="chapter-info">
              第 {{ readerStore.currentChapterIndex + 1 }} 章，共 {{ readerStore.toc.length }} 章
            </span>
            <button @click="nextChapter" :disabled="readerStore.currentChapterIndex >= readerStore.toc.length - 1"
              class="nav-btn">
              下一章 →
            </button>
            
            <!-- Auto-scroll and auto-pagination controls -->
            <div class="auto-controls">
              <div class="auto-control-group">
                <label class="auto-control-label">
                  <input 
                    type="checkbox" 
                    v-model="settingsStore.isAutoScrollEnabled" 
                    @change="toggleAutoScroll"
                    class="auto-checkbox"
                  />
                  自动滚动
                </label>
                <input 
                  type="range" 
                  v-if="settingsStore.isAutoScrollEnabled"
                  v-model.number="settingsStore.autoScrollSpeed" 
                  min="10" 
                  max="200" 
                  step="10"
                  class="speed-slider"
                  title="滚动速度"
                />
                <span v-if="settingsStore.isAutoScrollEnabled" class="speed-value">
                  {{ settingsStore.autoScrollSpeed }} px/s
                </span>
              </div>
              
              <div class="auto-control-group">
                <label class="auto-control-label">
                  <input 
                    type="checkbox" 
                    v-model="settingsStore.isAutoPaginationEnabled" 
                    class="auto-checkbox"
                  />
                  自动翻页
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, nextTick } from 'vue'
import { useReaderStore } from '../stores/reader'
import { useSettingsStore } from '../stores/settings'
import ReaderView from './ReaderView.vue'
import TocView from './TocView.vue'
import { decodeTextWithDetection } from '../utils/encoding'

const readerStore = useReaderStore()
const settingsStore = useSettingsStore()
const fileInputRef = ref(null)

// 切换目录显示
function toggleToc() {
  settingsStore.toggleTocVisibility()
}

// 切换设置界面显示
function toggleSettings() {
  settingsStore.toggleSettings();
}

// 处理键盘事件
function handleKeyboard(e) {
  // 遰心输入框、文本区域或可编辑元素时才响应
  const activeElement = document.activeElement
  if (activeElement && (activeElement.tagName === 'INPUT' || 
      activeElement.tagName === 'TEXTAREA' || 
      activeElement.contentEditable === 'true')) {
    return
  }
  
  switch(e.key) {
    case 'ArrowLeft':
      e.preventDefault()
      prevChapter()
      break
    case 'ArrowRight':
      e.preventDefault()
      nextChapter()
      break
    case 'PageUp':
      e.preventDefault()
      prevChapter()
      break
    case 'PageDown':
    case ' ':
      e.preventDefault()
      nextChapter()
      break
  }
}

// Load cached data on component mount
onMounted(async () => {
  await readerStore.loadFromCache()
  window.addEventListener('keydown', handleKeyboard)
})

// 组件卸载时移除键盘事件监听器
onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyboard)
})

// Handle drag over event
function handleDragOver(e) {
  e.preventDefault()
  if (!readerStore.isDragOver) {
    console.log('File drag over detected')
    readerStore.isDragOver = true
  }
}

// Handle drag leave event
function handleDragLeave() {
  console.log('File drag left the drop zone')
  readerStore.isDragOver = false
}

// Handle drop event
function handleDrop(e) {
  e.preventDefault()
  readerStore.isDragOver = false

  const files = e.dataTransfer.files
  console.log('File drop event received:', files)
  if (files.length > 0 && (files[0].type.startsWith('text/') || files[0].name.endsWith('.txt'))) {
    console.log('Processing dropped file:', files[0].name, 'Size:', files[0].size, 'bytes')
    readerStore.processFile(files[0])
  }
}

// Trigger file input click
function triggerFileSelect() {
  if (!readerStore.isLoading) {
    fileInputRef.value?.click()
  }
}

// Handle file selection from input
function onFileSelect(e) {
  const file = e.target.files[0]
  if (file) {
    console.log('File selected from input:', file.name, 'Size:', file.size, 'bytes')
    readerStore.processFile(file)
  }
}

// Navigate to a specific chapter from TOC
function jumpToChapter(index) {
  console.log(`Jumping to chapter at index ${index}: "${readerStore.toc[index].title}"`)
  readerStore.loadChapter(index)
  // 自动滚动到顶部
  scrollToTop()
}

// Next chapter handler
function nextChapter() {
  if (readerStore.currentChapterIndex < readerStore.toc.length - 1) {
    console.log('Moving to next chapter')
    readerStore.loadChapter(readerStore.currentChapterIndex + 1)
    // 自动滚动到顶部
    scrollToTop()
  } else {
    console.log('Already at the last chapter')
  }
}

// Previous chapter handler
function prevChapter() {
  if (readerStore.currentChapterIndex > 0) {
    console.log('Moving to previous chapter')
    readerStore.loadChapter(readerStore.currentChapterIndex - 1)
    // 自动滚动到顶部
    scrollToTop()
  } else {
    console.log('Already at the first chapter')
  }
}

// 跳转到顶部
function scrollToTop() {
  // 等待DOM更新完成
  nextTick(() => {
    const readerContainer = document.querySelector('.reader-container')
    if (readerContainer) {
      readerContainer.scrollTop = 0
    }
  })
}

// 处理自动滚动开关
function toggleAutoScroll() {
  // 触发事件通知ReaderView组件更新自动滚动状态
  const readerContainer = document.querySelector('.reader-container')
  if (readerContainer) {
    readerContainer.dispatchEvent(new CustomEvent('autoScrollToggled', {
      detail: {
        enabled: settingsStore.isAutoScrollEnabled,
        speed: settingsStore.autoScrollSpeed
      }
    }))
  }
}
</script>

<style scoped>
.file-loader-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.drop-zone {
  position: relative;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  border: 2px dashed var(--drop-zone-border, #d1d5db);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  background-color: var(--drop-zone-bg, #ffffff);
  cursor: pointer;
  padding: 2rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  text-align: center;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: var(--text-primary, #4b5563);
}

.drop-zone:hover {
  border-color: var(--accent-color, #93c5fd);
  background-color: var(--drop-zone-hover, #f9fafb);
}

.drop-zone.drag-over {
  border-color: var(--accent-color, #4f46e5);
  background-color: var(--drop-zone-drag-over, #f0f9ff);
  box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1);
}

.drop-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: var(--text-secondary, #4b5563);
}

.icon {
  margin-bottom: 1.5rem;
}

.icon svg {
  width: 48px;
  height: 48px;
  color: var(--text-secondary, #6b7280);
}

.title {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  color: var(--text-primary, #1f2937);
}

.subtitle {
  font-size: 0.875rem;
  color: var(--text-secondary, #6b7280);
  margin: 0 0 1.5rem 0;
}

.select-btn {
  background-color: var(--button-bg, #4f46e5);
  color: white;
  border: none;
  padding: 0.6rem 1.5rem;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
}

.select-btn:hover {
  background-color: var(--button-hover, #4338ca);
  transform: translateY(-1px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.select-btn:active {
  transform: translateY(0);
}

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

.file-input {
  display: none;
}

.reading-layout {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
  overflow: hidden;
  padding-bottom: 20px;
  background-color: var(--bg-primary, #f9fafb);
}

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
}

.toc-toggle-divider {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 10px;
  flex-shrink: 0;
  background-color: var(--bg-primary, #f9fafb);
  padding: 0 5px;
}

.toc-toggle-btn {
  background-color: var(--toc-item-hover-bg, #e5e7eb);
  color: var(--text-secondary, #6b7280);
  border: 1px solid var(--border-color, #e5e7eb);
  width: 16px;
  height: 40px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.7rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  z-index: 5;
  opacity: 0.6;
  padding: 0;
}

.toc-toggle-btn:hover {
  background-color: var(--border-color, #e5e7eb);
  color: var(--accent-color, #4f46e5);
  opacity: 1;
  border-color: var(--border-color, #e5e7eb);
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

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 1rem;
  background-color: var(--bg-secondary, white);
  height: 100%;
  min-width: 0; /* 确保flex item可以缩小 */
}

.toc-panel {
  width: 280px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 1rem;
  background-color: var(--bg-secondary, white);
  height: 100%;
  min-height: 0;
  position: relative;
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
  margin-left: auto; /* 让按钮组靠右对齐 */
}

.toc-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
  color: var(--text-primary, #1f2937);
}

.reload-file-btn, .settings-btn, .toc-collapse-btn, .toc-expand-btn {
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

.reload-file-btn:hover, .settings-btn:hover, .toc-collapse-btn:hover {
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
  stroke: currentColor; /* 明确指定SVG继承文字颜色 */
  stroke-width: 2;
}

.toc-toggle-divider {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  flex-shrink: 0;
  background-color: var(--bg-primary, #f9fafb);
}

.toc-toggle-btn {
  background-color: var(--toc-item-hover-bg, #e5e7eb);
  color: var(--text-secondary, #4b5563);
  border: 1px solid var(--border-color, #e5e7eb);
  width: 16px;
  height: 40px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.7rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  position: relative;
  z-index: 5;
}

.toc-toggle-btn:hover {
  background-color: var(--border-color, #d1d5db);
  color: var(--accent-color, #4f46e5);
}

.reload-file-btn:hover {
  transform: rotate(90deg);
}

.large-file-notification {
  background-color: #fef2f2;
  /* Red-50 */
  border: 1px solid #fecaca;
  /* Red-200 */
  border-radius: 8px;
  padding: 0.75rem;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
}

.large-file-notification p {
  margin: 0;
  color: #b91c1c;
  /* Red-700 */
  font-size: 0.8125rem;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 0.75rem 1rem;  /* 调整为更合适的内边距 */
  background-color: var(--bg-secondary, white);
  height: 100%;
}

.reader-container {
  flex: 1;
  overflow-y: auto;
  min-width: 0;
  position: relative;
}

.bottom-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 1rem;
  padding: 0.75rem 0;
  border-top: 1px solid var(--border-color, #e5e7eb);
  opacity: 0.8;
  width: 100%;
}

.bottom-controls:hover {
  opacity: 1;
}

.nav-btn {
  background-color: var(--toc-item-hover-bg, #e5e7eb);
  color: var(--text-primary, #374151);
  border: 1px solid var(--border-color, #e5e7eb);
  padding: 0.4rem 0.8rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: none;
}

.nav-btn:hover:not(:disabled) {
  background-color: var(--border-color, #d1d5db);
  color: var(--accent-color, #4f46e5);
  border-color: var(--border-color, #d1d5db);
}

.nav-btn:disabled {
  background-color: var(--toc-item-hover-bg, #f3f4f6);
  color: var(--text-secondary, #9ca3af);
  border-color: var(--border-color, #d1d5db);
  cursor: not-allowed;
  opacity: 0.5;
}

.nav-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  width: 100%;
}

.chapter-info {
  font-size: 0.875rem;
  color: var(--text-secondary, #6b7280);
  font-weight: 400;
  text-align: center;
  flex: 0 1 auto;
  margin: 0 1rem;
  opacity: 0.8;
  min-width: 120px;  /* 确保有足够的空间显示章节信息 */
}

/* Auto-scroll controls */
.auto-controls {
  display: flex;
  gap: 1rem;
  margin-left: 1.5rem;
  align-items: center;
}

.auto-control-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: var(--bg-secondary, #f9fafb);
  padding: 0.3rem 0.6rem;
  border-radius: 6px;
  border: 1px solid var(--border-color, #e5e7eb);
}

.auto-control-label {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  color: var(--text-secondary, #6b7280);
  cursor: pointer;
  user-select: none;
}

.auto-checkbox {
  width: 14px;
  height: 14px;
  cursor: pointer;
}

.speed-slider {
  width: 80px;
  cursor: pointer;
}

.speed-value {
  font-size: 0.75rem;
  color: var(--text-secondary, #6b7280);
  min-width: 50px;
  text-align: left;
}
</style>
