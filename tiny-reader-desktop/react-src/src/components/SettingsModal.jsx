import React, { useState, useRef, useEffect } from 'react';
import { useSettingsStore } from '../stores/settingsStore';

const SettingsModal = () => {
  const settingsStore = useSettingsStore();
  const [isCapturing, setIsCapturing] = useState(null);
  const [inputtingNextKey, setInputtingNextKey] = useState('');
  const [inputtingPrevKey, setInputtingPrevKey] = useState('');
  const [inputtingFullscreenKey, setInputtingFullscreenKey] = useState('');
  const nextKeyInputRef = useRef(null);

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
  ];

  // 选择主题
  const selectTheme = (theme) => {
    settingsStore.setTheme(theme);
  };

  // 重置设置
  const resetSettings = () => {
    settingsStore.reset();
  };

  // 关闭设置
  const closeSettings = () => {
    settingsStore.toggleSettings();
  };

  // 开始捕获按键
  const startKeyCapture = (action) => {
    setIsCapturing(action);
    if (action === 'nextChapter') {
      setInputtingNextKey('按任意键...');
    } else if (action === 'prevChapter') {
      setInputtingPrevKey('按任意键...');
    } else if (action === 'fullscreen') {
      setInputtingFullscreenKey('按任意键...');
    }
  };

  // 捕获按键
  const captureKey = (action, event) => {
    event.preventDefault();

    // Get the key that was pressed
    const key = event.key;

    // Skip modifier keys that are usually pressed with others
    if (['Shift', 'Control', 'Alt', 'Meta'].includes(key)) {
      return;
    }

    // Add the key to the appropriate binding
    if (action === 'nextChapter') {
      if (!settingsStore.keyBindings.nextChapter.includes(key)) {
        settingsStore.addKeyBinding(action, key);
      }
      setInputtingNextKey('');
    } else if (action === 'prevChapter') {
      if (!settingsStore.keyBindings.prevChapter.includes(key)) {
        settingsStore.addKeyBinding(action, key);
      }
      setInputtingPrevKey('');
    } else if (action === 'fullscreen') {
      if (!settingsStore.keyBindings.fullscreen.includes(key)) {
        settingsStore.addKeyBinding(action, key);
      }
      setInputtingFullscreenKey('');
    }

    setIsCapturing(null);
  };

  // 移除按键绑定
  const removeKey = (action, key) => {
    if (action === 'nextChapter') {
      settingsStore.removeKeyBinding(action, key);
    } else if (action === 'prevChapter') {
      settingsStore.removeKeyBinding(action, key);
    } else if (action === 'fullscreen') {
      settingsStore.removeKeyBinding(action, key);
    }
  };

  // 获取按键的显示文本
  const getKeyDisplay = (key) => {
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
    };

    return keyMap[key] || key;
  };

  // 清除所有按键绑定
  const clearKeys = (action) => {
    if (action === 'nextChapter') {
      settingsStore.keyBindings.nextChapter = [];
    } else if (action === 'prevChapter') {
      settingsStore.keyBindings.prevChapter = [];
    } else if (action === 'fullscreen') {
      settingsStore.keyBindings.fullscreen = [];
    }
  };

  // 处理设置保存（现在直接修改 store 无需临时状态）
  const handleSave = () => {
    settingsStore.applySettings();
    closeSettings();
  };

  // 监听键盘事件时捕获按键
  useEffect(() => {
    const handleGlobalKeyDown = (event) => {
      if (isCapturing) {
        captureKey(isCapturing, event);
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [isCapturing]);

  return (
    <div className="settings-overlay" onClick={closeSettings}>
      <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
        {/* 设置标题栏 */}
        <div className="settings-header">
          <h2>阅读设置</h2>
          <button onClick={closeSettings} className="close-btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* 设置内容区 */}
        <div className="settings-content">
          {/* 主题样式设置 */}
          <div className="setting-group">
            <h3>主题样式</h3>
            <div className="theme-options">
              {themes.map((theme) => (
                <div
                  key={theme.value}
                  className={`theme-option ${settingsStore.theme === theme.value ? 'selected' : ''}`}
                  onClick={() => selectTheme(theme.value)}
                >
                  <div className="theme-preview" data-theme={theme.value}></div>
                  <span>{theme.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 字体大小设置 */}
          <div className="setting-group">
            <h3>字体大小</h3>
            <div className="slider-container">
              <input
                type="range"
                min="12"
                max="24"
                value={settingsStore.fontSize}
                onChange={(e) => settingsStore.setFontSize(parseInt(e.target.value))}
                className="slider"
              />
              <span className="slider-value">{settingsStore.fontSize}px</span>
            </div>
          </div>

          {/* 行高设置 */}
          <div className="setting-group">
            <h3>行高</h3>
            <div className="slider-container">
              <input
                type="range"
                min="1.2"
                max="2.5"
                step="0.1"
                value={settingsStore.lineHeight}
                onChange={(e) => settingsStore.setLineHeight(parseFloat(e.target.value))}
                className="slider"
              />
              <span className="slider-value">{settingsStore.lineHeight}</span>
            </div>
          </div>

          {/* 阅读宽度设置 */}
          <div className="setting-group">
            <h3>阅读宽度</h3>
            <div className="slider-container">
              <input
                type="range"
                min="600"
                max="1200"
                step="50"
                value={settingsStore.maxWidth}
                onChange={(e) => settingsStore.setMaxWidth(parseInt(e.target.value))}
                className="slider"
              />
              <span className="slider-value">{settingsStore.maxWidth}px</span>
            </div>
          </div>

          {/* 文字间隔设置 */}
          <div className="setting-group">
            <h3>文字间隔</h3>
            <div className="slider-container">
              <input
                type="range"
                min="-2"
                max="10"
                step="0.5"
                value={settingsStore.letterSpacing}
                onChange={(e) => settingsStore.setLetterSpacing(parseFloat(e.target.value))}
                className="slider"
              />
              <span className="slider-value">{settingsStore.letterSpacing}px</span>
            </div>
          </div>

          {/* 字体族设置 */}
          <div className="setting-group">
            <h3>字体族</h3>
            <select 
              value={settingsStore.fontFamily} 
              onChange={(e) => settingsStore.setFontFamily(e.target.value)}
              className="font-family-select"
            >
              <option value="'Inter', 'Segoe UI', system-ui, sans-serif">Inter (默认)</option>
              <option value="'Georgia', 'Times New Roman', serif">Georgia (衬线)</option>
              <option value="'Arial', 'Helvetica', sans-serif">Arial (无衬线)</option>
              <option value="'Courier New', 'Courier', monospace">Courier (等宽)</option>
              <option value="'仿宋', 'FangSong', serif">仿宋</option>
              <option value="'楷体', 'KaiTi', serif">楷体</option>
              <option value="'Microsoft YaHei', 'PingFang SC', sans-serif">微软雅黑</option>
            </select>
          </div>

          {/* 自动滚动设置 */}
          <div className="setting-group">
            <h3>自动滚动</h3>
            <div className="checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={settingsStore.isAutoScrollEnabled}
                  onChange={(e) => settingsStore.setIsAutoScrollEnabled(e.target.checked)}
                />
                启用自动滚动
              </label>
            </div>

            {settingsStore.isAutoScrollEnabled && (
              <div className="sub-settings">
                <div className="slider-container">
                  <label>滚动速度</label>
                  <input
                    type="range"
                    min="10"
                    max="200"
                    step="10"
                    value={settingsStore.autoScrollSpeed}
                    onChange={(e) => settingsStore.setAutoScrollSpeed(parseInt(e.target.value))}
                    className="slider"
                  />
                  <span className="slider-value">{settingsStore.autoScrollSpeed} px/s</span>
                </div>
              </div>
            )}
          </div>

          {/* 自动翻页设置 */}
          <div className="setting-group">
            <div className="checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={settingsStore.isAutoPaginationEnabled}
                  onChange={(e) => settingsStore.setIsAutoPaginationEnabled(e.target.checked)}
                />
                启用自动翻页
              </label>
            </div>
          </div>

          {/* 段间距设置 */}
          <div className="setting-group">
            <h3>段间距</h3>
            <div className="slider-container">
              <input
                type="range"
                min="0.5"
                max="3.0"
                step="0.1"
                value={settingsStore.paragraphSpacing}
                onChange={(e) => settingsStore.setParagraphSpacing(parseFloat(e.target.value))}
                className="slider"
              />
              <span className="slider-value">{settingsStore.paragraphSpacing.toFixed(1)}倍</span>
            </div>
            <p className="setting-description">设置段落之间的间距大小</p>
          </div>

          {/* 键盘快捷键设置 */}
          <div className="setting-group">
            <h3>键盘快捷键</h3>
            <div className="key-binding-group">
              <div className="key-binding-row">
                <label>下一章快捷键：</label>
                <div className="key-chips">
                  {settingsStore.keyBindings.nextChapter.map((key, index) => (
                    <span key={index} className="key-chip">
                      {getKeyDisplay(key)}
                      <button onClick={() => removeKey('nextChapter', key)} className="remove-key">×</button>
                    </span>
                  ))}
                </div>
                <div className="add-key-controls">
                  <input
                    type="text"
                    ref={nextKeyInputRef}
                    placeholder="按任意键..."
                    onKeyDown={(e) => captureKey('nextChapter', e)}
                    onFocus={() => startKeyCapture('nextChapter')}
                    value={inputtingNextKey}
                    readOnly
                  />
                  <button onClick={() => clearKeys('nextChapter')} className="clear-btn">清除</button>
                </div>
              </div>

              <div className="key-binding-row">
                <label>上一章快捷键：</label>
                <div className="key-chips">
                  {settingsStore.keyBindings.prevChapter.map((key, index) => (
                    <span key={index} className="key-chip">
                      {getKeyDisplay(key)}
                      <button onClick={() => removeKey('prevChapter', key)} className="remove-key">×</button>
                    </span>
                  ))}
                </div>
                <div className="add-key-controls">
                  <input
                    type="text"
                    placeholder="按任意键..."
                    onKeyDown={(e) => captureKey('prevChapter', e)}
                    onFocus={() => startKeyCapture('prevChapter')}
                    value={inputtingPrevKey}
                    readOnly
                  />
                  <button onClick={() => clearKeys('prevChapter')} className="clear-btn">清除</button>
                </div>
              </div>

              <div className="key-binding-row">
                <label>全屏快捷键：</label>
                <div className="key-chips">
                  {settingsStore.keyBindings.fullscreen.map((key, index) => (
                    <span key={index} className="key-chip">
                      {getKeyDisplay(key)}
                      <button onClick={() => removeKey('fullscreen', key)} className="remove-key">×</button>
                    </span>
                  ))}
                </div>
                <div className="add-key-controls">
                  <input
                    type="text"
                    placeholder="按任意键..."
                    onKeyDown={(e) => captureKey('fullscreen', e)}
                    onFocus={() => startKeyCapture('fullscreen')}
                    value={inputtingFullscreenKey}
                    readOnly
                  />
                  <button onClick={() => clearKeys('fullscreen')} className="clear-btn">清除</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 按钮区域 */}
        <div className="settings-footer">
          <button onClick={resetSettings} className="reset-btn">重置</button>
          <button onClick={handleSave} className="confirm-btn">确认</button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;