<template>
  <div class="nav-controls">
    <div class="nav-wrapper">
      <span class="chapter-info">
        第 {{ currentChapterIndex + 1 }} 章，共 {{ tocLength }} 章
      </span>
      <button @click="onPrevChapter" :disabled="currentChapterIndex <= 0" class="nav-btn">
        ← 上一章
      </button>
      <button @click="onNextChapter" :disabled="currentChapterIndex >= tocLength - 1"
        class="nav-btn">
        下一章 →
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
  emit('prev-chapter')
}

function onNextChapter() {
  emit('next-chapter')
}
</script>

<style scoped>
.nav-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  flex: 1;
  min-width: 0;
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
  min-width: 120px;
  /* 确保有足够的空间显示章节信息 */
}
</style>