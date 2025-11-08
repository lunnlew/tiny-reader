<template>
  <div class="mobile-toc-panel" v-show="showMobileToc">
    <div class="mobile-toc-header">
      <h2 class="toc-title">目录</h2>
      <button @click="onCloseToc" class="close-btn" title="关闭">
        ×
      </button>
    </div>
    <div class="mobile-toc-content" @scroll="onTocScroll">
      <TocView ref="tocViewRef" :toc="toc" :current-chapter-index="currentChapterIndex" @jump="onJumpToChapter" />
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'
import TocView from './TocView.vue'

const props = defineProps({
  toc: Array,
  showMobileToc: Boolean,
  currentChapterIndex: Number
})

const emit = defineEmits([
  'close-toc',
  'jump-to-chapter'
])

const tocViewRef = ref(null)

// Handle scroll events
function onTocScroll() {
  // User has manually scrolled
}

// Track if this is the first time the panel is opened
let isFirstOpen = true;
// Track the last chapter index to detect if it changed while panel was closed
let previousChapterIndex = -1;

// Watch for changes in showMobileToc to handle showing/hiding
watch(() => props.showMobileToc, async (newVal) => {
  if (!newVal) {
    // Panel is being closed
    previousChapterIndex = props.currentChapterIndex;
  } else {
    // Panel is being opened
    await nextTick(() => {
      if (tocViewRef.value) {
        // Update the current chapter in TocView
        tocViewRef.value.updateCurrentChapter(props.currentChapterIndex);

        // Determine if we should scroll to the current chapter
        let shouldScroll = false;
        if (isFirstOpen) {
          // First time opening - always go to current chapter
          shouldScroll = true;
          isFirstOpen = false;
        } else {
          // Subsequent times - only go to current chapter if it changed since last close
          shouldScroll = props.currentChapterIndex !== previousChapterIndex;
        }

        if (shouldScroll) {
          // Scroll to current chapter
          tocViewRef.value.scrollToCurrentChapter();
        }
      }
    });
  }
}, { immediate: true });

// Watch for changes in currentChapterIndex to handle changes while panel is closed
watch(() => props.currentChapterIndex, (newIndex, oldIndex) => {
  // Update the current chapter in the TocView component
  if (tocViewRef.value) {
    tocViewRef.value.updateCurrentChapter(newIndex);
  }
}, { immediate: true });

function onCloseToc() {
  emit('close-toc')
}

function onJumpToChapter(index) {
  emit('jump-to-chapter', index)
  // Auto close the mobile TOC after selecting a chapter
  emit('close-toc')
}
</script>

<style scoped>
.mobile-toc-panel {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: var(--bg-primary, #f9fafb);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.mobile-toc-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid var(--border-color, #e5e7eb);
  background-color: var(--bg-secondary, white);
}

.toc-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
  color: var(--text-primary, #1f2937);
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--text-secondary, #6b7280);
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  padding: 0;
}

.close-btn:hover {
  background-color: var(--toc-item-hover-bg, #f3f4f6);
}

.mobile-toc-content {
  flex: 1;
  min-height: 0;
  height: 100%;
  padding: 2rem 0;
  background-color: var(--bg-secondary, white);
}
</style>