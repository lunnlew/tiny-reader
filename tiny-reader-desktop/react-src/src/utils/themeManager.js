// Theme manager for handling different themes
class ThemeManager {
  constructor() {
    this.currentTheme = null;
    this.injectAllThemes();
  }

  injectAllThemes() {
    // Check if styles are already injected
    if (document.getElementById('all-themes-styles')) {
      return;
    }

    // Create a style element to hold all theme styles
    const style = document.createElement('style');
    style.id = 'all-themes-styles';
    style.textContent = `
      /* Light Theme Variables */
      :root[data-theme="light"] {
        --bg-primary: #f9fafb;
        --bg-secondary: #ffffff;
        --text-primary: #374151;
        --text-secondary: #4b5563;
        --border-color: #e5e7eb;
        --accent-color: #4f46e5;
        --accent-hover: #4338ca;
        --drop-zone-bg: #ffffff;
        --drop-zone-border: #d1d5db;
        --drop-zone-hover: #f9fafb;
        --drop-zone-drag-over: #f0f9ff;
        --toc-bg: #ffffff;
        --toc-item-color: #4b5563;
        --toc-item-hover: #4f46e5;
        --toc-item-hover-bg: #f9fafb;
        --toc-item-active: #4f46e5;
        --toc-item-active-bg: #eef2ff;
        --button-bg: #4f46e5;
        --button-hover: #4338ca;
        --reader-content-bg: #ffffff;
        --reader-content-color: #374151;
        --scrollbar-track: #f1f5f9;
        --scrollbar-thumb: #cbd5e1;
        --scrollbar-thumb-hover: #64748b;
      }
      
      /* Dark Theme Variables */
      :root[data-theme="dark"] {
        --bg-primary: #111827;
        --bg-secondary: #1f2937;
        --text-primary: #e5e7eb;
        --text-secondary: #9ca3af;
        --border-color: #374151;
        --accent-color: #818cf8;
        --accent-hover: #6369d1;
        --drop-zone-bg: #1f2937;
        --drop-zone-border: #4b5563;
        --drop-zone-hover: #1d2a3a;
        --drop-zone-drag-over: #1d2a4a;
        --toc-bg: #1f2937;
        --toc-item-color: #9ca3af;
        --toc-item-hover: #60a5fa;
        --toc-item-hover-bg: #374151;
        --toc-item-active: #818cf8;
        --toc-item-active-bg: #303f79;
        --button-bg: #6366f1;
        --button-hover: #4f46e5;
        --reader-content-bg: #1f2937;
        --reader-content-color: #e5e7eb;
        --scrollbar-track: #2d3748;
        --scrollbar-thumb: #4a5568;
        --scrollbar-thumb-hover: #718096;
      }
      
      /* Sepia Theme Variables */
      :root[data-theme="sepia"] {
        --bg-primary: #f4f1ea;
        --bg-secondary: #f8f5ee;
        --text-primary: #5c4d42;
        --text-secondary: #8b7d70;
        --border-color: #d6c9b8;
        --accent-color: #a88b66;
        --accent-hover: #8a6f51;
        --drop-zone-bg: #f8f5ee;
        --drop-zone-border: #d6c9b8;
        --drop-zone-hover: #f0e8dd;
        --drop-zone-drag-over: #e8e0d5;
        --toc-bg: #f8f5ee;
        --toc-item-color: #8b7d70;
        --toc-item-hover: #a88b66;
        --toc-item-hover-bg: #f0e8dd;
        --toc-item-active: #a88b66;
        --toc-item-active-bg: #e8e0d5;
        --button-bg: #a88b66;
        --button-hover: #8a6f51;
        --reader-content-bg: #f8f5ee;
        --reader-content-color: #5c4d42;
        --scrollbar-track: #e8e0d5;
        --scrollbar-thumb: #d6c9b8;
        --scrollbar-thumb-hover: #b9a994;
      }
      
      /* Blue Theme Variables */
      :root[data-theme="blue"] {
        --bg-primary: #e6f0ff;
        --bg-secondary: #f0f7ff;
        --text-primary: #1e3a8a;
        --text-secondary: #3730a3;
        --border-color: #93c5fd;
        --accent-color: #2563eb;
        --accent-hover: #3b82f6;
        --drop-zone-bg: #f0f7ff;
        --drop-zone-border: #93c5fd;
        --drop-zone-hover: #dbeafe;
        --drop-zone-drag-over: #bfdbfe;
        --toc-bg: #f0f7ff;
        --toc-item-color: #3730a3;
        --toc-item-hover: #2563eb;
        --toc-item-hover-bg: #dbeafe;
        --toc-item-active: #2563eb;
        --toc-item-active-bg: #dbeafe;
        --button-bg: #2563eb;
        --button-hover: #3b82f6;
        --reader-content-bg: #f0f7ff;
        --reader-content-color: #1e40af;
        --scrollbar-track: #dbeafe;
        --scrollbar-thumb: #93c5fd;
        --scrollbar-thumb-hover: #60a5fa;
      }
      
      /* Chinese Red Theme Variables */
      :root[data-theme="chinese-red"] {
        --bg-primary: #fff1f0;
        --bg-secondary: #ffeaea;
        --text-primary: #7c2d12;
        --text-secondary: #9a3412;
        --border-color: #fecaca;
        --accent-color: #dc2626;
        --accent-hover: #b91c1c;
        --drop-zone-bg: #ffeaea;
        --drop-zone-border: #fecaca;
        --drop-zone-hover: #fed7d7;
        --drop-zone-drag-over: #fecaca;
        --toc-bg: #ffeaea;
        --toc-item-color: #9a3412;
        --toc-item-hover: #dc2626;
        --toc-item-hover-bg: #fed7d7;
        --toc-item-active: #dc2626;
        --toc-item-active-bg: #fed7d7;
        --button-bg: #dc2626;
        --button-hover: #b91c1c;
        --reader-content-bg: #ffeaea;
        --reader-content-color: #7c2d12;
        --scrollbar-track: #fed7d7;
        --scrollbar-thumb: #fecaca;
        --scrollbar-thumb-hover: #fca5a5;
      }
      
      /* Chinese Teal Theme Variables */
      :root[data-theme="chinese-teal"] {
        --bg-primary: #f0fdfa;
        --bg-secondary: #ecfdf5;
        --text-primary: #0f766e;
        --text-secondary: #115e59;
        --border-color: #a7f3d0;
        --accent-color: #14b8a6;
        --accent-hover: #0d9488;
        --drop-zone-bg: #ecfdf5;
        --drop-zone-border: #a7f3d0;
        --drop-zone-hover: #6ee7b7;
        --drop-zone-drag-over: #a7f3d0;
        --toc-bg: #ecfdf5;
        --toc-item-color: #115e59;
        --toc-item-hover: #14b8a6;
        --toc-item-hover-bg: #a7f3d0;
        --toc-item-active: #14b8a6;
        --toc-item-active-bg: #a7f3d0;
        --button-bg: #14b8a6;
        --button-hover: #0d9488;
        --reader-content-bg: #ecfdf5;
        --reader-content-color: #0f766e;
        --scrollbar-track: #a7f3d0;
        --scrollbar-thumb: #6ee7b7;
        --scrollbar-thumb-hover: #34d399;
      }
      
      /* Chinese Ink Theme Variables */
      :root[data-theme="chinese-ink"] {
        --bg-primary: #f8f9fa;
        --bg-secondary: #e9ecef;
        --text-primary: #212529;
        --text-secondary: #495057;
        --border-color: #ced4da;
        --accent-color: #495057;
        --accent-hover: #212529;
        --drop-zone-bg: #e9ecef;
        --drop-zone-border: #ced4da;
        --drop-zone-hover: #dee2e6;
        --drop-zone-drag-over: #ced4da;
        --toc-bg: #e9ecef;
        --toc-item-color: #495057;
        --toc-item-hover: #495057;
        --toc-item-hover-bg: #dee2e6;
        --toc-item-active: #495057;
        --toc-item-active-bg: #dee2e6;
        --button-bg: #495057;
        --button-hover: #212529;
        --reader-content-bg: #e9ecef;
        --reader-content-color: #212529;
        --scrollbar-track: #dee2e6;
        --scrollbar-thumb: #adb5bd;
        --scrollbar-thumb-hover: #6c757d;
      }
      
      /* Chinese Moon Theme Variables */
      :root[data-theme="chinese-moon"] {
        --bg-primary: #f8fafc;
        --bg-secondary: #edf2ff;
        --text-primary: #1e3a8a;
        --text-secondary: #3730a3;
        --border-color: #bfdbfe;
        --accent-color: #3b82f6;
        --accent-hover: #2563eb;
        --drop-zone-bg: #edf2ff;
        --drop-zone-border: #bfdbfe;
        --drop-zone-hover: #dbeafe;
        --drop-zone-drag-over: #bfdbfe;
        --toc-bg: #edf2ff;
        --toc-item-color: #3730a3;
        --toc-item-hover: #3b82f6;
        --toc-item-hover-bg: #dbeafe;
        --toc-item-active: #3b82f6;
        --toc-item-active-bg: #dbeafe;
        --button-bg: #3b82f6;
        --button-hover: #2563eb;
        --reader-content-bg: #edf2ff;
        --reader-content-color: #1e3a8a;
        --scrollbar-track: #dbeafe;
        --scrollbar-thumb: #bfdbfe;
        --scrollbar-thumb-hover: #93c5fd;
      }
    `;
    
    document.head.appendChild(style);
  }

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

  getCurrentTheme() {
    return this.currentTheme;
  }
}

export const themeManager = new ThemeManager();