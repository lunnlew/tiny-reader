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
        
        <!-- 自动滚动设置 -->
        <div class="setting-group">
          <h3>自动滚动</h3>
          <div class="checkbox-group">
            <label class="checkbox-label">
              <input 
                type="checkbox" 
                v-model="settingsStore.isAutoScrollEnabled"
              />
              启用自动滚动
            </label>
          </div>
          
          <div v-if="settingsStore.isAutoScrollEnabled" class="sub-settings">
            <div class="slider-container">
              <label>滚动速度</label>
              <input 
                type="range" 
                min="10" 
                max="200" 
                step="10" 
                v-model.number="settingsStore.autoScrollSpeed" 
                class="slider"
              />
              <span class="slider-value">{{ settingsStore.autoScrollSpeed }} px/s</span>
            </div>
          </div>
        </div>
        
        <!-- 自动翻页设置 -->
        <div class="setting-group">
          <div class="checkbox-group">
            <label class="checkbox-label">
              <input 
                type="checkbox" 
                v-model="settingsStore.isAutoPaginationEnabled"
              />
              启用自动翻页
            </label>
          </div>
        </div>
        
        <!-- 键盘快捷键设置 - 仅在桌面端显示 -->
        <div v-if="!isMobile" class="setting-group">
          <h3>键盘快捷键</h3>
          <div class="key-binding-group">
            <div class="key-binding-row">
              <label>下一章快捷键：</label>
              <div class="key-chips">
                <span 
                  v-for="(key, index) in settingsStore.keyBindings.nextChapter" 
                  :key="index"
                  class="key-chip"
                >
                  {{ getKeyDisplay(key) }}
                  <button @click="removeKey('nextChapter', key)" class="remove-key">×</button>
                </span>
              </div>
              <div class="add-key-controls">
                <input 
                  type="text" 
                  ref="nextKeyInput"
                  placeholder="按任意键..."
                  @keydown="captureKey('nextChapter', $event)"
                  @focus="startKeyCapture('nextChapter')"
                  v-model="inputtingNextKey"
                  readonly
                />
                <button @click="clearKeys('nextChapter')" class="clear-btn">清除</button>
              </div>
            </div>
            
            <div class="key-binding-row">
              <label>上一章快捷键：</label>
              <div class="key-chips">
                <span 
                  v-for="(key, index) in settingsStore.keyBindings.prevChapter" 
                  :key="index"
                  class="key-chip"
                >
                  {{ getKeyDisplay(key) }}
                  <button @click="removeKey('prevChapter', key)" class="remove-key">×</button>
                </span>
              </div>
              <div class="add-key-controls">
                <input 
                  type="text" 
                  placeholder="按任意键..."
                  @keydown="captureKey('prevChapter', $event)"
                  @focus="startKeyCapture('prevChapter')"
                  v-model="inputtingPrevKey"
                  readonly
                />
                <button @click="clearKeys('prevChapter')" class="clear-btn">清除</button>
              </div>
            </div>
          </div>
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
import { ref, nextTick, computed } from 'vue'
import { useIsMobile } from '../utils/deviceDetection'

const settingsStore = useSettingsStore()
const inputtingNextKey = ref('')
const inputtingPrevKey = ref('')
const isCapturing = ref(false)

// Check if device is mobile
const isMobile = useIsMobile();

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

// 开始捕获按键
function startKeyCapture(action) {
  isCapturing.value = action
  // Focus might be lost by the time this runs, so refocus the input
  nextTick(() => {
    if (action === 'nextChapter') {
      inputtingNextKey.value = '按任意键...'
    } else if (action === 'prevChapter') {
      inputtingPrevKey.value = '按任意键...'
    }
  })
}

// 捕获按键
function captureKey(action, event) {
  event.preventDefault()
  
  // Get the key that was pressed
  const key = event.key
  
  // Skip modifier keys that are usually pressed with others
  if (['Shift', 'Control', 'Alt', 'Meta'].includes(key)) {
    return
  }
  
  // Add the key to the appropriate binding
  if (action === 'nextChapter') {
    if (!settingsStore.keyBindings.nextChapter.includes(key)) {
      settingsStore.addKeyBinding(action, key)
    }
    inputtingNextKey.value = ''
  } else if (action === 'prevChapter') {
    if (!settingsStore.keyBindings.prevChapter.includes(key)) {
      settingsStore.addKeyBinding(action, key)
    }
    inputtingPrevKey.value = ''
  }
  
  isCapturing.value = false
}

// 移除按键绑定
function removeKey(action, key) {
  settingsStore.removeKeyBinding(action, key)
}

// 获取按键的显示文本
function getKeyDisplay(key) {
  const keyMap = {
    ' ': '空格键',
    'ArrowLeft': '左箭头',
    'ArrowRight': '右箭头',
    'ArrowUp': '上箭头',
    'ArrowDown': '下箭头',
    'PageUp': 'Page Up',
    'PageDown': 'Page Down',
    'Enter': '回车键',
    'Escape': 'Esc键',
    'Backspace': '退格键',
    'Delete': 'Delete键',
    'Tab': 'Tab键',
    'Home': 'Home键',
    'End': 'End键',
    'F1': 'F1',
    'F2': 'F2',
    'F3': 'F3',
    'F4': 'F4',
    'F5': 'F5',
    'F6': 'F6',
    'F7': 'F7',
    'F8': 'F8',
    'F9': 'F9',
    'F10': 'F10',
    'F11': 'F11',
    'F12': 'F12'
  }
  
  return keyMap[key] || key
}

// 清除所有按键绑定
function clearKeys(action) {
  if (action === 'nextChapter') {
    settingsStore.keyBindings.nextChapter = []
  } else if (action === 'prevChapter') {
    settingsStore.keyBindings.prevChapter = []
  }
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
  max-width: 600px; /* Increased max-width for wider screens */
  max-height: 90vh; /* Increased max-height */
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
  padding: 1rem 1.25rem; /* Slightly reduced padding on narrow screens */
  border-bottom: 1px solid var(--border-color, #e5e7eb);
  flex-shrink: 0; /* Prevent header from shrinking */
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
  padding: 1.25rem; /* Slightly reduced padding on narrow screens */
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
  min-width: 60px; /* Ensure minimum width for touch targets */
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
  flex-direction: column; /* Stack items vertically on narrow screens */
  align-items: flex-start; /* Align items to the start */
  gap: 0.5rem;
}

/* On wider screens, switch to horizontal layout */
@media (min-width: 768px) {
  .slider-container {
    flex-direction: row;
    align-items: center;
  }
}

.slider {
  flex: 1;
  width: 100%;
  height: 6px;
  -webkit-appearance: none;
  background: var(--border-color, #e5e7eb);
  border-radius: 3px;
  outline: none;
}

/* On wider screens, slider should have a max width */
@media (min-width: 768px) {
  .slider {
    max-width: 200px;
  }
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

.slider-value {
  min-width: 40px; /* Ensure consistent width for value display */
  text-align: center;
  font-size: 0.875rem;
  color: var(--text-secondary, #6b7280);
}

.settings-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1rem 1.25rem; /* Slightly reduced padding on narrow screens */
  border-top: 1px solid var(--border-color, #e5e7eb);
  background-color: var(--bg-secondary, #f9fafb);
  flex-shrink: 0; /* Prevent footer from shrinking */
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

.checkbox-group {
  margin-bottom: 1rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  cursor: pointer;
  user-select: none;
  color: var(--text-primary, #374151);
}

.checkbox-label input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.sub-settings {
  margin-left: 1.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid var(--border-color, #e5e7eb);
}

.key-binding-group {
  margin-top: 0.5rem;
}

.key-binding-row {
  margin-bottom: 1rem;
}

.key-binding-row label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--text-primary, #374151);
}

.key-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.key-chip {
  display: inline-flex;
  align-items: center;
  background-color: var(--toc-item-hover-bg, #e5e7eb);
  color: var(--text-primary, #374151);
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.8rem;
  gap: 0.25rem;
}

.remove-key {
  background: none;
  border: none;
  color: var(--text-primary, #374151);
  cursor: pointer;
  font-size: 0.9rem;
  padding: 0 0.2rem;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.remove-key:hover {
  background-color: var(--toc-item-hover, #d1d5db);
}

.add-key-controls {
  display: flex;
  flex-direction: row; /* Stack input and button vertically on narrow screens */
  gap: 0.5rem;
  align-items: stretch;
}

/* On wider screens, align horizontally */
@media (min-width: 640px) {
  .add-key-controls {
    flex-direction: row;
    align-items: center;
  }
}

.add-key-controls input {
  flex: 1;
  padding: 0.4rem 0.7rem;
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 6px;
  font-size: 0.85rem;
  background-color: var(--bg-secondary, #f9fafb);
  cursor: pointer;
}

.add-key-controls input:focus {
  outline: none;
  border-color: var(--accent-color, #4f46e5);
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.clear-btn, .remove-key {
  background-color: var(--toc-item-hover-bg, #e5e7eb);
  color: var(--text-primary, #374151);
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
}

.clear-btn {
  width: 32px;
  height: 32px;
}

.clear-btn:hover, .remove-key:hover {
  background-color: var(--toc-item-hover, #d1d5db);
}

/* Responsive adjustments for wider screens */
@media (min-width: 1024px) {
  .settings-modal {
    max-width: 700px; /* Even wider on large screens */
  }
  
  .settings-content {
    padding: 1.5rem; /* More generous padding on larger screens */
  }
  
  .settings-header,
  .settings-footer {
    padding: 1.2rem 1.5rem; /* More generous padding on larger screens */
  }
  
  .setting-group {
    margin-bottom: 2rem; /* More space between groups on large screens */
  }
}

/* Responsive adjustments for tablets */
@media (min-width: 768px) and (max-width: 1023px) {
  .settings-modal {
    width: 80%;
    max-width: 650px;
  }
  
  .settings-content {
    padding: 1.5rem;
  }
}

/* Mobile-specific improvements */
@media (max-width: 640px) {
  .settings-modal {
    width: 100%;
    height: 100%;
    max-height: 100%;
    max-width: 100%;
    border-radius: 0; /* No border radius on full-screen mobile */
  }
  
  .settings-content {
    padding: 1rem; /* Less padding on very narrow screens */
  }
  
  .settings-header,
  .settings-footer {
    padding: 0.75rem 1rem; /* Less padding on narrow screens */
  }
  
  .theme-option {
    min-width: 50px; /* Smaller touch targets on mobile */
    padding: 0.5rem;
  }
  
  .key-binding-row {
    margin-bottom: 0.75rem; /* Less space between rows on mobile */
  }
  
  .slider-value {
    margin-top: 0.25rem; /* Position value label under the slider on mobile */
  }
}

/* Touch-friendly adjustments */
@media (hover: none) and (pointer: coarse) {
  .theme-option {
    min-height: 44px; /* Ensure adequate touch target size */
  }
  
  .close-btn {
    width: 40px; /* Larger touch target */
    height: 40px;
  }
}
</style>