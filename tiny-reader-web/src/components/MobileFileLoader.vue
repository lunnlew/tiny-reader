<template>
  <div class="file-loader-container">
    <!-- Hidden file input that's always available -->
    <input type="file" ref="fileInputRef" accept=".txt" @change="onFileSelect" class="file-input" />

    <!-- Show file loader when no content is loaded -->
    <FileDropZone v-if="!readerStore.currentChapterContent && !readerStore.isLoading"
      :is-drag-over="readerStore.isDragOver" @drag-over="handleDragOver" @drag-leave="handleDragLeave"
      @drop-file="onDropFile" @trigger-file-select="triggerFileSelect" />

    <!-- Loading state for initial file processing -->
    <FileLoadingIndicator v-else-if="readerStore.isLoading" :is-loading="readerStore.isLoading"
      :has-toc="readerStore.toc.length > 0" />

    <!-- File content viewer with pagination when content is available -->
    <div v-else class="reading-layout">
      <!-- Mobile TOC panel -->
      <MobileTocPanel v-show="showMobileToc" :toc="readerStore.toc"
        :current-chapter-index="readerStore.currentChapterIndex" :show-mobile-toc="showMobileToc"
        @close-toc="closeMobileToc" @jump-to-chapter="jumpToChapter" />

      <!-- Main content area -->
      <div class="main-content">
        <!-- Mobile TOC, Settings and Reload File buttons (auto-hide when auto-scrolling) -->
        <div class="mobile-controls" :class="{ 'hidden': controlsHidden }">
          <button v-if="readerStore.toc.length > 0" @click="toggleMobileToc" class="toc-toggle-btn" title="目录">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
          <button @click="toggleSettings" class="settings-toggle-btn" title="设置">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="3"></circle>
              <path
                d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z">
              </path>
            </svg>
          </button>
          <button @click="triggerFileSelect" class="reload-file-btn" title="选择新文件">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
          </button>
        </div>

        <!-- Notification when file is too large to cache fully -->
        <div v-if="readerStore.showLargeFileNotification" class="large-file-notification">
          <p>⚠️ 文件过大，部分内容未完全缓存。刷新后可能无法浏览不同章节。</p>
        </div>

        <div class="reader-container" :class="{ 'controls-visible': !controlsHidden }" @click="showControls"
          @touchstart="showControls" @touchend="handleTouchEnd" @scroll="handleScroll" ref="readerContainerRef">
          <ReaderView :content="readerStore.currentChapterContent" :class="{
            'isMobile': true
          }" />
        </div>
      </div>
    </div>

    <!-- Mobile navigation controls at the bottom (auto-hide when auto-scrolling) -->
    <MobileNavigationControls v-if="readerStore.toc.length > 0" :current-chapter-index="readerStore.currentChapterIndex"
      :toc-length="readerStore.toc.length" @prev-chapter="prevChapter" @next-chapter="nextChapter"
      :class="{ 'hidden': controlsHidden }" />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, nextTick, watch } from 'vue'
import { useReaderStore } from '../stores/reader'
import { useSettingsStore } from '../stores/settings'
import { FullscreenService } from '../services/fullscreen'
import ReaderView from './ReaderView.vue'
import FileDropZone from './FileDropZone.vue'
import FileLoadingIndicator from './FileLoadingIndicator.vue'
import MobileTocPanel from './MobileTocPanel.vue'
import MobileNavigationControls from './MobileNavigationControls.vue'

const readerStore = useReaderStore()
const settingsStore = useSettingsStore()
const fileInputRef = ref(null)
const showMobileToc = ref(false)
const controlsHidden = ref(false)
const readerContainerRef = ref(null)
let hideControlsTimeout = null
let isAutoScrollActive = false

// 切换移动版目录显示
function toggleMobileToc() {
  showMobileToc.value = !showMobileToc.value
}

// 切换设置界面显示
function toggleSettings() {
  settingsStore.toggleSettings();
}

// 关闭移动版目录
function closeMobileToc() {
  showMobileToc.value = false
}

// Show controls and reset the auto-hide timer
function showControls() {
  controlsHidden.value = false;
  if (settingsStore.isAutoScrollEnabled) {
    // Only set hide timer if auto-scroll is enabled
    resetHideTimer();
  }
}

// Hide controls after a delay when auto-scroll is enabled
function resetHideTimer() {
  // Clear any existing timeout
  if (hideControlsTimeout) {
    clearTimeout(hideControlsTimeout);
  }

  // Set new timeout if auto-scroll is enabled
  if (settingsStore.isAutoScrollEnabled) {
    hideControlsTimeout = setTimeout(() => {
      if (settingsStore.isAutoScrollEnabled) {
        controlsHidden.value = true;
      }
    }, 2000); // Hide controls after 2 seconds of inactivity during auto-scroll
  }
}

// Handle touch end event for auto-scroll controls
function handleTouchEnd() {
  // Show controls briefly after touch interaction
  showControls();
}

// Handle scroll events to show controls temporarily
function handleScroll() {
  // Only show controls on scroll if auto-scroll is not active
  // During auto-scroll, scrolling happens automatically, so we don't want to show controls
  // only to hide them again immediately
  if (!settingsStore.isAutoScrollEnabled) {
    showControls();
  }
}

// Watch for auto-scroll changes to show/hide controls accordingly
watch(() => settingsStore.isAutoScrollEnabled, (enabled) => {
  if (enabled) {
    // Show controls briefly when auto-scroll starts
    showControls();
  } else {
    // Clear the hide timer when auto-scroll stops
    if (hideControlsTimeout) {
      clearTimeout(hideControlsTimeout);
      hideControlsTimeout = null;
    }
    // Show controls when auto-scroll stops
    controlsHidden.value = false;
  }
}, { immediate: true });


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

// Also watch for changes in the store's auto-scroll speed to detect active auto-scrolling
watch(() => [settingsStore.isAutoScrollEnabled, settingsStore.autoScrollSpeed], ([enabled, speed]) => {
  if (enabled) {
    toggleAutoScroll();
    console.log("Auto-scroll is enabled, showing controls"); // Debug log
    showControls();
  }
}, { immediate: true });

// 处理键盘事件
function handleKeyboard(e) {
  // 避免在输入框、文本区域或可编辑元素时才响应
  const activeElement = document.activeElement
  if (activeElement && (activeElement.tagName === 'INPUT' ||
    activeElement.tagName === 'TEXTAREA' ||
    activeElement.contentEditable === 'true')) {
    return
  }

  // Check if the pressed key matches any of the configured fullscreen keys
  if (settingsStore.keyBindings.fullscreen.includes(e.key)) {
    e.preventDefault()
    toggleFullscreen()
    return
  }

  // Check if the pressed key matches any of the configured next chapter keys
  if (settingsStore.keyBindings.nextChapter.includes(e.key)) {
    e.preventDefault()
    nextChapter()
    return
  }

  // Check if the pressed key matches any of the configured previous chapter keys
  if (settingsStore.keyBindings.prevChapter.includes(e.key)) {
    e.preventDefault()
    prevChapter()
    return
  }
}

// 切换全屏模式
async function toggleFullscreen() {
  try {
    await FullscreenService.toggleFullscreen();
    // Update the store state to reflect the fullscreen state
    settingsStore.setFullscreen(FullscreenService.isFullscreen());
  } catch (error) {
    console.error('Failed to toggle fullscreen:', error);
  }
}

// Load cached data on component mount
onMounted(async () => {
  await readerStore.loadFromCache()
  window.addEventListener('keydown', handleKeyboard)

  // Initialize controls visibility based on auto-scroll setting
  if (settingsStore.isAutoScrollEnabled) {
    // Show controls briefly after mount if auto-scroll is enabled, then hide after delay
    showControls();
  }

  // Listen for auto-scroll toggle events from ReaderView
  const readerContainer = document.querySelector('.reader-container');
  if (readerContainer) {
    readerContainer.addEventListener('autoScrollToggled', handleAutoScrollToggle);
  }
})

// 组件卸载时移除键盘事件监听器
onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyboard)
  // Clear timeout on component unmount
  if (hideControlsTimeout) {
    clearTimeout(hideControlsTimeout);
  }
  // Remove event listener
  const readerContainer = document.querySelector('.reader-container');
  if (readerContainer) {
    readerContainer.removeEventListener('autoScrollToggled', handleAutoScrollToggle);
  }
})

// Handle auto-scroll toggle events from ReaderView
function handleAutoScrollToggle(event) {
  const { enabled } = event.detail;
  if (enabled) {
    // Auto-scroll has started, show controls briefly then auto-hide
    showControls();
  } else {
    // Auto-scroll has stopped, ensure controls are visible
    if (hideControlsTimeout) {
      clearTimeout(hideControlsTimeout);
      hideControlsTimeout = null;
    }
    controlsHidden.value = false;
  }
}

// Handle drag over event
function handleDragOver() {
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
function onDropFile(file) {
  readerStore.isDragOver = false

  console.log('File drop event received:', file)
  if (file && (file.type.startsWith('text/') || file.name.endsWith('.txt'))) {
    console.log('Processing dropped file:', file.name, 'Size:', file.size, 'bytes')
    readerStore.processFile(file)
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

// Check if current chapter content can be scrolled further
function canScrollCurrentChapter() {
  const readerContainer = document.querySelector('.reader-container');
  if (!readerContainer) return false;

  // Check if we're not at the bottom of the content
  const maxScroll = readerContainer.scrollHeight - readerContainer.clientHeight;
  return readerContainer.scrollTop < maxScroll - 5; // 5px tolerance
}

// Scroll to next page within current chapter
function scrollToNextPage() {
  const readerContainer = document.querySelector('.reader-container');
  if (!readerContainer) return;

  const viewportHeight = readerContainer.clientHeight;
  const currentScrollTop = readerContainer.scrollTop;
  const maxScroll = readerContainer.scrollHeight - readerContainer.clientHeight;

  // Calculate next page position (scroll 90% of viewport)
  const nextPagePosition = Math.min(currentScrollTop + viewportHeight * 0.9, maxScroll);

  readerContainer.scrollTop = nextPagePosition;
}

// Next chapter handler (with pagination within chapter)
function nextChapter(type) {
  // First check if we can scroll more within the current chapter
  if (type != 1 && canScrollCurrentChapter()) {
    scrollToNextPage();
  } else {
    // If no more to scroll in current chapter, go to next chapter
    if (readerStore.currentChapterIndex < readerStore.toc.length - 1) {
      console.log('Moving to next chapter')
      readerStore.loadChapter(readerStore.currentChapterIndex + 1)
      // 自动滚动到顶部
      scrollToTop()
    } else {
      console.log('Already at the last chapter')
    }
  }
}

// Previous chapter handler
function prevChapter(type) {
  if (type != 1 && readerStore.currentChapterIndex > 0) {
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

</script>

<style scoped>
.file-loader-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.file-input {
  display: none;
}

.reading-layout {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  /* overflow: hidden; */
  padding-bottom: 20px;
  background-color: var(--bg-primary, #f9fafb);
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 0;
  background-color: var(--bg-secondary, white);
  height: auto;
  min-width: 0;
  /* 确保flex item可以缩小 */
}

.mobile-controls {
  position: absolute;
  top: 1rem;
  left: 1rem;
  z-index: 100;
  display: flex;
  gap: 0.5rem;
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.mobile-controls.hidden {
  opacity: 0;
  transform: translateY(-10px);
  pointer-events: none;
}

.toc-toggle-btn,
.settings-toggle-btn {
  background-color: var(--toc-item-hover-bg, #e5e7eb);
  color: var(--text-secondary, #4b5563);
  border: 1px solid var(--border-color, #e5e7eb);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  padding: 0;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  z-index: 100;
}

.toc-toggle-btn:hover,
.settings-toggle-btn:hover,
.reload-file-btn:hover {
  background-color: var(--border-color, #d1d5db);
  color: var(--accent-color, #4f46e5);
}

.reload-file-btn {
  background-color: var(--toc-item-hover-bg, #e5e7eb);
  color: var(--text-secondary, #4b5563);
  border: 1px solid var(--border-color, #e5e7eb);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  padding: 0;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  z-index: 100;
}

/* Style for hidden mobile navigation controls */
/* This should be applied to the MobileNavigationControls component via its wrapper */
.mobile-navigation-controls-hidden {
  opacity: 0;
  transform: translateY(10px);
  transition: opacity 0.3s ease, transform 0.3s ease;
  pointer-events: none;
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
  margin: 1rem;
}

.large-file-notification p {
  margin: 0;
  color: #b91c1c;
  /* Red-700 */
  font-size: 0.8125rem;
}

.reader-container {
  flex: 1;
  overflow-y: auto;
  min-width: 0;
  position: relative;
  padding: 1rem;
  padding-bottom: 0;
  /* Override default padding to be handled conditionally */
}

.reader-container.controls-visible {
  padding-bottom: 80px;
  /* Space for mobile navigation controls when visible */
}
</style>