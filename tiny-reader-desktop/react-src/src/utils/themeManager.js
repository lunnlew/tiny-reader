// Theme manager for handling different themes dynamically
class ThemeManager {
  constructor() {
    this.currentTheme = null;
    this.themes = new Map(); // Store loaded themes
    // Preload all theme styles
    this.loadAllThemes();
  }

  // Dynamically load all themes
  async loadAllThemes() {
    // Check if styles are already injected
    if (document.getElementById('all-themes-styles')) {
      return;
    }

    try {
      // Dynamically import all theme CSS files
      const lightThemeModule = await import('../themes/light.css');
      const darkThemeModule = await import('../themes/dark.css');
      const sepiaThemeModule = await import('../themes/sepia.css');
      const blueThemeModule = await import('../themes/blue.css');
      const chineseRedThemeModule = await import('../themes/chinese-red.css');
      const chineseTealThemeModule = await import('../themes/chinese-teal.css');
      const chineseInkThemeModule = await import('../themes/chinese-ink.css');
      const chineseMoonThemeModule = await import('../themes/chinese-moon.css');

      // Store theme content (the actual CSS as a string)
      this.themes.set('light', lightThemeModule.default || '');
      this.themes.set('dark', darkThemeModule.default || '');
      this.themes.set('sepia', sepiaThemeModule.default || '');
      this.themes.set('blue', blueThemeModule.default || '');
      this.themes.set('chinese-red', chineseRedThemeModule.default || '');
      this.themes.set('chinese-teal', chineseTealThemeModule.default || '');
      this.themes.set('chinese-ink', chineseInkThemeModule.default || '');
      this.themes.set('chinese-moon', chineseMoonThemeModule.default || '');

      // Inject all theme styles
      this.injectAllThemes();
    } catch (error) {
      console.error('Failed to load themes dynamically, falling back to embedded CSS:', error);
      // Fallback to embedded CSS if dynamic import fails
      this.injectAllThemes();
    }
  }

  // Inject all theme styles into the DOM
  async injectAllThemes() {
    // Check if styles are already injected
    if (document.getElementById('all-themes-styles')) {
      return;
    }

    // If themes weren't loaded dynamically, use embedded CSS as a fallback
    if (this.themes.size === 0) {
      const lightThemeModule = await import('../themes/light.css');
      // Add embedded CSS as fallback
      this.themes.set('light', lightThemeModule.default);
      // Add other themes as fallbacks...
    }

    const style = document.createElement('style');
    style.id = 'all-themes-styles';
    style.textContent = Array.from(this.themes.values()).join('\n\n');
    document.head.appendChild(style);
  }

  // Apply theme
  async applyTheme(themeName) {
    if (this.currentTheme === themeName) return;

    // Remove old theme attributes
    document.documentElement.removeAttribute('data-theme');
    document.body.removeAttribute('data-theme');

    // Apply new theme attributes
    document.documentElement.setAttribute('data-theme', themeName);
    document.body.setAttribute('data-theme', themeName);

    this.currentTheme = themeName;
  }

  // Get current theme
  getCurrentTheme() {
    return this.currentTheme;
  }
}

export const themeManager = new ThemeManager();