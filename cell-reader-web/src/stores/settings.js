import { defineStore } from 'pinia'
import { themeManager } from '@/utils/themeManager'

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    // 显示设置界面
    showSettings: false,
    
    // 主题设置
    theme: 'light',  // 'light', 'dark', 'sepia', 'blue'
    
    // 阅读界面设置
    fontSize: 16,     // 字体大小 (px)
    lineHeight: 1.8,  // 行高 (倍)
    maxWidth: 800,    // 阅读最大宽度 (px)
    letterSpacing: 0, // 文字间隔 (px)
    
    // 目录设置
    isTocVisible: true,  // 目录是否可见
    
    // 自动滚动设置
    isAutoScrollEnabled: false,  // 是否启用自动滚动
    autoScrollSpeed: 50,  // 自动滚动速度 (px/s)
    
    // 自动翻页设置
    isAutoPaginationEnabled: false,  // 是否启用自动翻页
    
    // 其他阅读设置
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",  // 字体族
    
    // 键盘快捷键设置
    keyBindings: {
      nextChapter: ['ArrowRight', 'PageDown', ' '],  // 下一章键，默认为右箭头、PageDown、空格
      prevChapter: ['ArrowLeft', 'PageUp']          // 上一章键，默认为左箭头、PageUp
    }
  }),
  
  actions: {
    // 切换设置界面显示
    toggleSettings() {
      this.showSettings = !this.showSettings
    },

    // 切换目录可见性
    toggleTocVisibility() {
      this.isTocVisible = !this.isTocVisible
    },

    // 设置目录可见性
    setTocVisibility(visible) {
      this.isTocVisible = visible
    },

    // 设置主题
    setTheme(theme) {
      this.theme = theme
      this.applyTheme()
    },

    // 应用当前主题
    applyTheme() {
      themeManager.applyTheme(this.theme)
      this.applySettings()
    },

    // 应用所有设置到页面
    applySettings() {
      const readerContent = document.querySelector('.reader-content')
      if (readerContent) {
        // 应用字体大小
        readerContent.style.fontSize = `${this.fontSize}px`
        // 应用行高
        readerContent.style.lineHeight = this.lineHeight
        // 应用最大宽度
        readerContent.style.maxWidth = `${this.maxWidth}px`
        // 应用文字间隔
        readerContent.style.letterSpacing = `${this.letterSpacing}px`
        // 应用字体族
        readerContent.style.fontFamily = this.fontFamily
      }
    },

    // 重置设置为默认值
    reset() {
      this.$reset()
      this.applyTheme()
    },
    
    // 更新下一章键绑定
    updateNextChapterKey(newKeys) {
      if (Array.isArray(newKeys)) {
        this.keyBindings.nextChapter = newKeys
      } else {
        this.keyBindings.nextChapter = [newKeys]
      }
    },
    
    // 更新上一章键绑定
    updatePrevChapterKey(newKeys) {
      if (Array.isArray(newKeys)) {
        this.keyBindings.prevChapter = newKeys
      } else {
        this.keyBindings.prevChapter = [newKeys]
      }
    },
    
    // 添加键绑定
    addKeyBinding(action, key) {
      if (action === 'nextChapter' && !this.keyBindings.nextChapter.includes(key)) {
        this.keyBindings.nextChapter.push(key)
      } else if (action === 'prevChapter' && !this.keyBindings.prevChapter.includes(key)) {
        this.keyBindings.prevChapter.push(key)
      }
    },
    
    // 移除键绑定
    removeKeyBinding(action, key) {
      if (action === 'nextChapter') {
        this.keyBindings.nextChapter = this.keyBindings.nextChapter.filter(k => k !== key)
      } else if (action === 'prevChapter') {
        this.keyBindings.prevChapter = this.keyBindings.prevChapter.filter(k => k !== key)
      }
    }
  },

  persist: {
    key: 'reader-settings',
    storage: localStorage,
    paths: ['theme', 'fontSize', 'lineHeight', 'maxWidth', 'isTocVisible', 'keyBindings']
  }
})