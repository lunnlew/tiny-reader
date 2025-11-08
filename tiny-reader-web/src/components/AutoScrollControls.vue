<template>
  <div class="auto-controls">
    <div class="auto-control-group">
      <label class="auto-control-label">
        <input type="checkbox" v-model="autoScrollEnabled" @change="onToggleAutoScroll"
          class="auto-checkbox" />
        自动滚动
      </label>
      <input type="range" v-if="autoScrollEnabled"
        v-model.number="autoScrollSpeed" min="10" max="200" step="10" class="speed-slider"
        title="滚动速度" />
      <span v-if="autoScrollEnabled" class="speed-value">
        {{ autoScrollSpeed }} px/s
      </span>
    </div>

    <div class="auto-control-group">
      <label class="auto-control-label">
        <input type="checkbox" v-model="autoPaginationEnabled" class="auto-checkbox" />
        自动翻页
      </label>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  isAutoScrollEnabled: Boolean,
  autoScrollSpeed: Number,
  isAutoPaginationEnabled: Boolean
})

const emit = defineEmits([
  'update:isAutoScrollEnabled',
  'update:autoScrollSpeed',
  'update:isAutoPaginationEnabled',
  'toggle-auto-scroll'
])

const autoScrollEnabled = computed({
  get: () => props.isAutoScrollEnabled,
  set: (value) => emit('update:isAutoScrollEnabled', value)
})

const autoScrollSpeed = computed({
  get: () => props.autoScrollSpeed,
  set: (value) => emit('update:autoScrollSpeed', value)
})

const autoPaginationEnabled = computed({
  get: () => props.isAutoPaginationEnabled,
  set: (value) => emit('update:isAutoPaginationEnabled', value)
})

function onToggleAutoScroll() {
  emit('toggle-auto-scroll')
}
</script>

<style scoped>
/* Auto-scroll controls */
.auto-controls {
  display: flex;
  gap: 1rem;
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