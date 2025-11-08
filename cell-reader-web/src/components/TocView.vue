<template>
  <div class="toc-container">
    <ul class="toc-list">
      <li v-for="(item, i) in toc" :key="i" @click="jumpToChapter(item, i)"
        :class="{ 'active-chapter': i === activeIndex }" class="toc-item"
        :ref="el => setItemRef(el, i)">
        {{ item.title }}
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, nextTick, watch } from 'vue';

const props = defineProps({
  toc: Array,
  currentChapterIndex: {
    type: Number,
    default: -1
  }
})

console.log('currentChapterIndex', props.currentChapterIndex)

const emit = defineEmits(['jump'])
const activeIndex = ref(-1)
const itemRefs = ref({})
let hasUserInteracted = false
let isInitialLoad = true

// Set up refs for list items
function setItemRef(el, index) {
  if (el) {
    itemRefs.value[index] = el;
  }
}

// Update active chapter when clicked - this means user has interacted, so disable auto-scroll
function jumpToChapter(item, index) {
  activeIndex.value = index
  hasUserInteracted = true  // Use let variable, not ref, so it persists
  isInitialLoad = false
  emit('jump', index)
}

// Watch for changes to currentChapterIndex prop to update active index (but not necessarily scroll)
watch(() => props.currentChapterIndex, async (newIndex) => {
  if (newIndex >= 0) {
    activeIndex.value = newIndex;
    
    // Skip scrolling on initial load, only scroll when user has interacted
    if (hasUserInteracted) {
      await nextTick();
      const activeElement = itemRefs.value[newIndex];
      if (activeElement && activeElement.scrollIntoView) {
        activeElement.scrollIntoView({ 
          behavior: 'auto', // Use 'auto' for immediate scroll instead of smooth
          block: 'center',
          inline: 'nearest'
        });
      }
    }
  }
}, { immediate: true });

// Function to explicitly scroll to current chapter
function scrollToCurrentChapter() {
  if (props.currentChapterIndex >= 0) {
    activeIndex.value = props.currentChapterIndex;
    nextTick(() => {
      const activeElement = itemRefs.value[props.currentChapterIndex];
      if (activeElement && activeElement.scrollIntoView) {
        activeElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center',
          inline: 'nearest'
        });
      }
    });
  }
}

// Function to update current chapter without scrolling
function updateCurrentChapter(index) {
  if (index >= 0) {
    activeIndex.value = index;
  }
}

// Expose functions to parent component
defineExpose({
  scrollToCurrentChapter,
  updateCurrentChapter,
  resetUserInteraction: () => {
    hasUserInteracted = false;
  }
})
</script>

<style scoped>
.toc-container {
  background: var(--toc-bg, #ffffff);
  padding: 1rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  flex-shrink: 0;
  overflow-y: auto;
  max-height: 100%;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.toc-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
  color: var(--text-primary, #1f2937);
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--border-color, #e5e7eb);
  flex-shrink: 0;
}

.toc-list {
  list-style: none;
  padding: 0;
  margin: 0;
  flex: 1;
}

.toc-item {
  padding: 0.5rem 0;
  cursor: pointer;
  color: var(--toc-item-color, #4b5563);
  border-bottom: 1px solid var(--border-color, #f3f4f6);
  transition: all 0.2s;
  border-radius: 6px;
  margin-bottom: 0.25rem;
}

.toc-item:last-child {
  border-bottom: none;
}

.toc-item:hover {
  color: var(--toc-item-hover, #4f46e5);
  background-color: var(--toc-item-hover-bg, #f9fafb);
  padding-left: 0.5rem;
  margin-left: -0.5rem;
  margin-right: -0.5rem;
}

.toc-item.active-chapter {
  color: var(--toc-item-active, #4f46e5);
  background-color: var(--toc-item-active-bg, #eef2ff);
  font-weight: 500;
}
</style>
