// 主题管理器
import lightTheme from '@/themes/light.css?raw';
import darkTheme from '@/themes/dark.css?raw';
import sepiaTheme from '@/themes/sepia.css?raw';
import blueTheme from '@/themes/blue.css?raw';
import chineseRedTheme from '@/themes/chinese-red.css?raw';
import chineseTealTheme from '@/themes/chinese-teal.css?raw';
import chineseInkTheme from '@/themes/chinese-ink.css?raw';
import chineseMoonTheme from '@/themes/chinese-moon.css?raw';

class ThemeManager {
  constructor() {
    this.currentTheme = null;
    this.themes = {
      light: lightTheme,
      dark: darkTheme,
      sepia: sepiaTheme,
      blue: blueTheme,
      'chinese-red': chineseRedTheme,
      'chinese-teal': chineseTealTheme,
      'chinese-ink': chineseInkTheme,
      'chinese-moon': chineseMoonTheme
    };
    
    // 预加载所有主题样式
    this.injectAllThemes();
  }

  // 注入所有主题样式
  injectAllThemes() {
    // 检查是否已经注入过
    if (document.getElementById('all-themes-styles')) {
      return;
    }
    
    const style = document.createElement('style');
    style.id = 'all-themes-styles';
    style.textContent = `
      ${lightTheme}
      ${darkTheme}
      ${sepiaTheme}
      ${blueTheme}
      ${chineseRedTheme}
      ${chineseTealTheme}
      ${chineseInkTheme}
      ${chineseMoonTheme}
    `;
    document.head.appendChild(style);
  }

  // 应用主题
  async applyTheme(themeName) {
    if (this.currentTheme === themeName) return;

    // 移除当前主题的CSS类
    document.documentElement.removeAttribute('data-theme');
    document.body.removeAttribute('data-theme');

    // 添加新主题
    document.documentElement.setAttribute('data-theme', themeName);
    document.body.setAttribute('data-theme', themeName);
    
    this.currentTheme = themeName;
  }

  // 获取当前主题
  getCurrentTheme() {
    return this.currentTheme;
  }
}

// 创建全局实例
export const themeManager = new ThemeManager();