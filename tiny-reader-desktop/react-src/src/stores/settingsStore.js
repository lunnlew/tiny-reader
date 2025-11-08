import { create } from 'zustand';
import { themeManager } from '../utils/themeManager';

// Load settings from localStorage
const loadSettings = () => {
  const saved = localStorage.getItem('reader-settings');
  return saved ? JSON.parse(saved) : null;
};

// Save settings to localStorage
const saveSettings = (state) => {
  const settingsToSave = {
    theme: state.theme,
    fontSize: state.fontSize,
    lineHeight: state.lineHeight,
    maxWidth: state.maxWidth,
    isTocVisible: state.isTocVisible,
    keyBindings: state.keyBindings,
    isFullscreen: state.isFullscreen,
    paragraphSpacing: state.paragraphSpacing,
    isAutoScrollEnabled: state.isAutoScrollEnabled,
    autoScrollSpeed: state.autoScrollSpeed,
    isAutoPaginationEnabled: state.isAutoPaginationEnabled
  };
  localStorage.setItem('reader-settings', JSON.stringify(settingsToSave));
};

// Initialize with saved settings
const initialSettings = loadSettings() || {};

export const useSettingsStore = create((set, get) => ({
  // 显示设置界面
  showSettings: false,

  // 主题设置
  theme: initialSettings.theme || 'light',  // 'light', 'dark', 'sepia', 'blue'

  // 阅读界面设置
  fontSize: initialSettings.fontSize || 16,     // 字体大小 (px)
  lineHeight: initialSettings.lineHeight || 1.8,  // 行高 (倍)
  maxWidth: initialSettings.maxWidth || 800,    // 阅读最大宽度 (px)
  letterSpacing: 0, // 文字间隔 (px)

  // 目录设置
  isTocVisible: initialSettings.isTocVisible !== undefined ? initialSettings.isTocVisible : true,  // 目录是否可见

  // 自动滚动设置
  isAutoScrollEnabled: initialSettings.isAutoScrollEnabled !== undefined ? initialSettings.isAutoScrollEnabled : false,  // 是否启用自动滚动
  autoScrollSpeed: initialSettings.autoScrollSpeed || 50,  // 自动滚动速度 (px/s)

  // 自动翻页设置
  isAutoPaginationEnabled: initialSettings.isAutoPaginationEnabled !== undefined ? initialSettings.isAutoPaginationEnabled : false,  // 是否启用自动翻页

  // 其他阅读设置
  fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",  // 字体族

  // 键盘快捷键设置
  keyBindings: initialSettings.keyBindings || {
    nextChapter: ['ArrowRight', 'PageDown', ' '],  // 下一章键，默认为右箭头、PageDown、空格
    prevChapter: ['ArrowLeft', 'PageUp'],         // 上一章键，默认为左箭头、PageUp
    fullscreen: ['F11', 'F']                      // 全屏键，默认为F11和F
  },

  // 全屏模式
  isFullscreen: initialSettings.isFullscreen || false,

  // 段间距设置
  paragraphSpacing: initialSettings.paragraphSpacing || 1.0,  // 段间距倍数，默认为1.0（即正常间距）

  // 切换设置界面显示
  toggleSettings: () => set((state) => ({ showSettings: !state.showSettings })),

  // 切换目录可见性
  toggleTocVisibility: () => set((state) => {
    const newState = { isTocVisible: !state.isTocVisible };
    saveSettings({ ...state, ...newState });
    return newState;
  }),

  // 设置目录可见性
  setTocVisibility: (visible) => set((state) => {
    const newState = { isTocVisible: visible };
    saveSettings({ ...state, ...newState });
    return newState;
  }),

  // 设置主题
  setTheme: (theme) => set((state) => {
    const newState = { theme };
    saveSettings({ ...state, ...newState });
    get().applyTheme();
    return newState;
  }),

  // 应用当前主题
  applyTheme: () => {
    // Apply theme using theme manager which handles the data-theme attribute
    themeManager.applyTheme(get().theme);
    get().applySettings();
  },

  // 应用所有设置到页面
  applySettings: () => {
    const readerContent = document.querySelector('.reader-content');
    if (readerContent) {
      // 应用字体大小
      readerContent.style.fontSize = `${get().fontSize}px`;
      // 应用行高
      readerContent.style.lineHeight = get().lineHeight;
      // 应用最大宽度
      readerContent.style.maxWidth = `${get().maxWidth}px`;
      // 应用文字间隔
      readerContent.style.letterSpacing = `${get().letterSpacing}px`;
      // 应用字体族
      readerContent.style.fontFamily = get().fontFamily;
    }
  },

  // 重置设置为默认值
  reset: () => {
    const defaultState = {
      showSettings: false,
      theme: 'light',
      fontSize: 16,
      lineHeight: 1.8,
      maxWidth: 800,
      letterSpacing: 0,
      isTocVisible: true,
      isAutoScrollEnabled: false,
      autoScrollSpeed: 50,
      isAutoPaginationEnabled: false,
      fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
      keyBindings: {
        nextChapter: ['ArrowRight', 'PageDown', ' '],
        prevChapter: ['ArrowLeft', 'PageUp'],
        fullscreen: ['F11', 'F']
      },
      isFullscreen: false,
      paragraphSpacing: 1.0
    };
    set(defaultState);
    localStorage.removeItem('reader-settings'); // Clear saved settings on reset
    get().applyTheme();
  },

  // 更新字体大小
  setFontSize: (fontSize) => set((state) => {
    const newState = { fontSize };
    saveSettings({ ...state, ...newState });
    return newState;
  }),

  // 更新行高
  setLineHeight: (lineHeight) => set((state) => {
    const newState = { lineHeight };
    saveSettings({ ...state, ...newState });
    return newState;
  }),

  // 更新最大宽度
  setMaxWidth: (maxWidth) => set((state) => {
    const newState = { maxWidth };
    saveSettings({ ...state, ...newState });
    return newState;
  }),

  // 更新段间距
  setParagraphSpacing: (paragraphSpacing) => set((state) => {
    const newState = { paragraphSpacing };
    saveSettings({ ...state, ...newState });
    return newState;
  }),

  // 更新自动滚动启用状态
  setIsAutoScrollEnabled: (enabled) => set((state) => {
    const newState = { isAutoScrollEnabled: enabled };
    saveSettings({ ...state, ...newState });
    return newState;
  }),

  // 更新自动滚动速度
  setAutoScrollSpeed: (speed) => set((state) => {
    const newState = { autoScrollSpeed: speed };
    saveSettings({ ...state, ...newState });
    return newState;
  }),

  // 更新自动翻页启用状态
  setIsAutoPaginationEnabled: (enabled) => set((state) => {
    const newState = { isAutoPaginationEnabled: enabled };
    saveSettings({ ...state, ...newState });
    return newState;
  }),

  // 直接设置属性（用于 settings that don't need specific persistence handling）
  setLetterSpacing: (letterSpacing) => set({ letterSpacing }),
  setFontFamily: (fontFamily) => set({ fontFamily }),

  // 更新下一章键绑定
  updateNextChapterKey: (newKeys) => set((state) => {
    const newState = {
      keyBindings: {
        ...state.keyBindings,
        nextChapter: Array.isArray(newKeys) ? newKeys : [newKeys]
      }
    };
    saveSettings({ ...state, ...newState });
    return newState;
  }),

  // 更新上一章键绑定
  updatePrevChapterKey: (newKeys) => set((state) => {
    const newState = {
      keyBindings: {
        ...state.keyBindings,
        prevChapter: Array.isArray(newKeys) ? newKeys : [newKeys]
      }
    };
    saveSettings({ ...state, ...newState });
    return newState;
  }),

  // 添加键绑定
  addKeyBinding: (action, key) => set((state) => {
    const newBindings = { ...state.keyBindings };
    if (action === 'nextChapter' && !newBindings.nextChapter.includes(key)) {
      newBindings.nextChapter.push(key);
    } else if (action === 'prevChapter' && !newBindings.prevChapter.includes(key)) {
      newBindings.prevChapter.push(key);
    }
    const newState = { keyBindings: newBindings };
    saveSettings({ ...state, ...newState });
    return newState;
  }),

  // 移除键绑定
  removeKeyBinding: (action, key) => set((state) => {
    const newBindings = { ...state.keyBindings };
    if (action === 'nextChapter') {
      newBindings.nextChapter = newBindings.nextChapter.filter(k => k !== key);
    } else if (action === 'prevChapter') {
      newBindings.prevChapter = newBindings.prevChapter.filter(k => k !== key);
    } else if (action === 'fullscreen') {
      newBindings.fullscreen = newBindings.fullscreen.filter(k => k !== key);
    }
    const newState = { keyBindings: newBindings };
    saveSettings({ ...state, ...newState });
    return newState;
  }),

  // 切换全屏模式
  toggleFullscreen: () => set((state) => ({ isFullscreen: !state.isFullscreen })),

  // 设置全屏状态
  setFullscreen: (fullscreenState) => set({ isFullscreen: fullscreenState }),
})
);