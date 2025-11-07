<template>
  <div class="settings-overlay" @click="closeSettings">
    <div class="settings-modal" @click.stop>
      <!-- 设置标题栏 -->
      <div class="settings-header">
        <h2>阅读设置</h2>
        <button @click="closeSettings" class="close-btn">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <!-- 设置内容区 -->
      <div class="settings-content">
        <!-- 主题样式设置 -->
        <div class="setting-group">
          <h3>主题样式</h3>
          <div class="theme-options">
            <div 
              v-for="theme in themes" 
              :key="theme.value" 
              class="theme-option"
              :class="{ 'selected': settingsStore.theme === theme.value }"
              @click="selectTheme(theme.value)"
            >
              <div class="theme-preview" :data-theme="theme.value"></div>
              <span>{{ theme.label }}</span>
            </div>
          </div>
        </div>

        <!-- 字体大小设置 -->
        <div class="setting-group">
          <h3>字体大小</h3>
          <div class="slider-container">
            <input 
              type="range" 
              min="12" 
              max="24" 
              v-model="settingsStore.fontSize" 
              class="slider"
            />
            <span class="slider-value">{{ settingsStore.fontSize }}px</span>
          </div>
        </div>

        <!-- 行高设置 -->
        <div class="setting-group">
          <h3>行高</h3>
          <div class="slider-container">
            <input 
              type="range" 
              min="1.2" 
              max="2.5" 
              step="0.1" 
              v-model="settingsStore.lineHeight" 
              class="slider"
            />
            <span class="slider-value">{{ settingsStore.lineHeight }}</span>
          </div>
        </div>

        <!-- 阅读宽度设置 -->
        <div class="setting-group">
          <h3>阅读宽度</h3>
          <div class="slider-container">
            <input 
              type="range" 
              min="600" 
              max="1200" 
              step="50" 
              v-model="settingsStore.maxWidth" 
              class="slider"
            />
            <span class="slider-value">{{ settingsStore.maxWidth }}px</span>
          </div>
        </div>

        <!-- 文字间隔设置 -->
        <div class="setting-group">
          <h3>文字间隔</h3>
          <div class="slider-container">
            <input 
              type="range" 
              min="-2" 
              max="10" 
              step="0.5" 
              v-model="settingsStore.letterSpacing" 
              class="slider"
            />
            <span class="slider-value">{{ settingsStore.letterSpacing }}px</span>
          </div>
        </div>

        <!-- 字体族设置 -->
        <div class="setting-group">
          <h3>字体族</h3>
          <select v-model="settingsStore.fontFamily" class="font-family-select">
            <option value="'Inter', 'Segoe UI', system-ui, sans-serif">Inter (默认)</option>
            <option value="'Georgia', 'Times New Roman', serif">Georgia (衬线)</option>
            <option value="'Arial', 'Helvetica', sans-serif">Arial (无衬线)</option>
            <option value="'Courier New', 'Courier', monospace">Courier (等宽)</option>
            <option value="'仿宋', 'FangSong', serif">仿宋</option>
            <option value="'楷体', 'KaiTi', serif">楷体</option>
            <option value="'Microsoft YaHei', 'PingFang SC', sans-serif">微软雅黑</option>
          </select>
        </div>
      </div>

      <!-- 按钮区域 -->
      <div class="settings-footer">
        <button @click="resetSettings" class="reset-btn">重置</button>
        <button @click="closeSettings" class="confirm-btn">确认</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useSettingsStore } from '../stores/settings'

const settingsStore = useSettingsStore()

// 主题选项
const themes = [
  { value: 'light', label: '明亮' },
  { value: 'dark', label: '暗黑' },
  { value: 'sepia', label: '护眼' },
  { value: 'blue', label: '夜蓝' },
  { value: 'chinese-red', label: '中国红' },
  { value: 'chinese-teal', label: '中国青' },
  { value: 'chinese-ink', label: '中国墨' },
  { value: 'chinese-moon', label: '月白' }
]

// 选择主题
function selectTheme(theme) {
  settingsStore.setTheme(theme)
}

// 重置设置
function resetSettings() {
  settingsStore.reset()
}

// 关闭设置
function closeSettings() {
  settingsStore.showSettings = false
}
</script>

<style scoped>
.settings-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.settings-modal {
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  background: var(--bg-secondary, #ffffff);
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: modalSlideIn 0.3s ease-out;
}

@keyframes modalSlideIn {
  from {
    transform: translateY(-50px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.settings-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.2rem 1.5rem;
  border-bottom: 1px solid var(--border-color, #e5e7eb);
}

.settings-header h2 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary, #1f2937);
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 50%;
  color: var(--text-secondary, #6b7280);
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
}

.close-btn:hover {
  background-color: var(--toc-item-hover-bg, #f3f4f6);
  color: var(--text-primary, #374151);
}

.settings-content {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
  color: var(--text-primary, #374151);
}

.setting-group {
  margin-bottom: 1.5rem;
}

.setting-group h3 {
  margin: 0 0 1rem 0;
  font-size: 1rem;
  font-weight: 500;
  color: var(--text-primary, #374151);
}

.theme-options {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.theme-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  padding: 0.75rem;
  border-radius: 8px;
  border: 2px solid transparent;
  transition: all 0.2s;
  background-color: var(--toc-item-hover-bg, #f3f4f6);
}

.theme-option:hover {
  background-color: var(--toc-item-hover-bg, #f3f4f6);
}

.theme-option.selected {
  border-color: var(--accent-color, #4f46e5);
  background-color: var(--toc-item-active-bg, #ede9fe);
}

.theme-preview {
  width: 40px;
  height: 40px;
  border-radius: 6px;
  margin-bottom: 0.5rem;
  border: 1px solid var(--border-color, #d1d5db);
  background-color: var(--theme-preview-bg, #ffffff);
}

/* 不同主题的预览颜色 */
.theme-preview[data-theme="light"] {
  --theme-preview-bg: var(--bg-secondary, #ffffff);
  background: linear-gradient(135deg, var(--bg-secondary, #ffffff) 50%, var(--bg-primary, #f9fafb) 50%);
}

.theme-preview[data-theme="dark"] {
  --theme-preview-bg: var(--bg-secondary, #1f2937);
  background: linear-gradient(135deg, var(--bg-secondary, #1f2937) 50%, #111827 50%);
}

.theme-preview[data-theme="sepia"] {
  --theme-preview-bg: var(--bg-secondary, #fdf6e3);
  background: linear-gradient(135deg, var(--bg-secondary, #fdf6e3) 50%, #f5e8c9 50%);
}

.theme-preview[data-theme="blue"] {
  --theme-preview-bg: var(--bg-secondary, #d6e4f0);
  background: linear-gradient(135deg, var(--bg-secondary, #d6e4f0) 50%, #b8d4e9 50%);
}

.theme-preview[data-theme="chinese-red"] {
  --theme-preview-bg: var(--bg-secondary, #ffeaea);
  background: linear-gradient(135deg, var(--bg-secondary, #ffeaea) 50%, #fff1f0 50%);
}

.theme-preview[data-theme="chinese-teal"] {
  --theme-preview-bg: var(--bg-secondary, #ecfdf5);
  background: linear-gradient(135deg, var(--bg-secondary, #ecfdf5) 50%, #f0fdfa 50%);
}

.theme-preview[data-theme="chinese-ink"] {
  --theme-preview-bg: var(--bg-secondary, #e9ecef);
  background: linear-gradient(135deg, var(--bg-secondary, #e9ecef) 50%, #f8f9fa 50%);
}

.theme-preview[data-theme="chinese-moon"] {
  --theme-preview-bg: var(--bg-secondary, #edf2ff);
  background: linear-gradient(135deg, var(--bg-secondary, #edf2ff) 50%, #f8f9ff 50%);
}

.theme-option span {
  font-size: 0.875rem;
  color: var(--text-secondary, #4b5563);
}

.slider-container {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.slider {
  flex: 1;
  height: 6px;
  -webkit-appearance: none;
  background: var(--border-color, #e5e7eb);
  border-radius: 3px;
  outline: none;
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--accent-color, #4f46e5);
  cursor: pointer;
  transition: all 0.2s;
}

.slider::-webkit-slider-thumb:hover {
  transform: scale(1.1);
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.2);
}

.slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--accent-color, #4f46e5);
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}

.settings-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1.2rem 1.5rem;
  border-top: 1px solid var(--border-color, #e5e7eb);
  background-color: var(--bg-secondary, #f9fafb);
}

.reset-btn, .confirm-btn {
  padding: 0.5rem 1.2rem;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.reset-btn {
  background-color: var(--toc-item-hover-bg, #e5e7eb);
  color: var(--text-primary, #374151);
}

.reset-btn:hover {
  background-color: var(--toc-item-hover, #d1d5db);
}

.confirm-btn {
  background-color: var(--button-bg, #4f46e5);
  color: white;
}

.confirm-btn:hover {
  background-color: var(--button-hover, #4338ca);
}

.font-family-select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 6px;
  background-color: var(--bg-secondary, #ffffff);
  color: var(--text-primary, #374151);
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.font-family-select:hover {
  border-color: var(--accent-color, #4f46e5);
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}
</style>