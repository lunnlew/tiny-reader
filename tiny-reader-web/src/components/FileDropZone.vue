<template>
  <div class="drop-zone" :class="{ 'drag-over': isDragOver }" 
       @dragover.prevent="handleDragOver" 
       @dragleave="handleDragLeave"
       @drop.prevent="handleDrop" 
       @click="onTriggerFileSelect">
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
      <button class="select-btn" @click.stop="onTriggerFileSelect">
        选择文件
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// Props and emits
defineProps({
  isDragOver: Boolean
})

const emit = defineEmits([
  'drag-over', 
  'drag-leave', 
  'drop-file',
  'trigger-file-select'
])

// Handle drag over event
function handleDragOver(e) {
  e.preventDefault()
  emit('drag-over')
}

// Handle drag leave event
function handleDragLeave() {
  emit('drag-leave')
}

// Handle drop event
function handleDrop(e) {
  e.preventDefault()
  emit('drag-leave')
  
  const files = e.dataTransfer.files
  if (files.length > 0 && (files[0].type.startsWith('text/') || files[0].name.endsWith('.txt'))) {
    emit('drop-file', files[0])
  }
}

// Trigger file input click
function onTriggerFileSelect() {
  emit('trigger-file-select')
}
</script>

<style scoped>
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
</style>