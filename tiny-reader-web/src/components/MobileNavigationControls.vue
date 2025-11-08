<template>
  <div class="mobile-nav-controls">
    <div class="mobile-nav-wrapper">
      <button @click="onPrevChapter" :disabled="currentChapterIndex <= 0" class="nav-btn">
        ←
      </button>
      <span class="chapter-info">
        {{ currentChapterIndex + 1 }} / {{ tocLength }}
      </span>
      <button @click="onNextChapter" :disabled="currentChapterIndex >= tocLength - 1"
        class="nav-btn">
        →
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  currentChapterIndex: Number,
  tocLength: Number
})

const emit = defineEmits([
  'prev-chapter',
  'next-chapter'
])

function onPrevChapter() {
  emit('prev-chapter', 1)
}

function onNextChapter() {
  emit('next-chapter', 1)
}
</script>

<style scoped>
.mobile-nav-controls {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 0.75rem;
  background-color: var(--bg-secondary, white);
  border-top: 1px solid var(--border-color, #e5e7eb);
  z-index: 100;
  box-sizing: border-box;
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.mobile-nav-controls.hidden {
  opacity: 0;
  transform: translateY(100%);
  pointer-events: none;
}

.mobile-nav-wrapper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.nav-btn {
  background-color: var(--toc-item-hover-bg, #e5e7eb);
  color: var(--text-primary, #374151);
  border: 1px solid var(--border-color, #e5e7eb);
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: none;
  flex: 1;
  max-width: 120px;
}

.nav-btn:first-child {
  margin-right: 0.5rem;
}

.nav-btn:last-child {
  margin-left: 0.5rem;
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

.chapter-info {
  font-size: 0.875rem;
  color: var(--text-secondary, #6b7280);
  font-weight: 500;
  text-align: center;
  flex: 2;
}
</style>