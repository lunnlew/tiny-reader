<template>
  <div class="reader-container" ref="containerRef">
    <div class="reader-content" v-html="processedContent"></div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, watch, nextTick, computed, ref } from 'vue';
import { useSettingsStore } from '../stores/settings';
import { useReaderStore } from '../stores/reader';

const props = defineProps({
  content: String
});

const settingsStore = useSettingsStore();
const readerStore = useReaderStore();
const containerRef = ref(null);

// Process content to handle paragraphs and apply paragraph spacing
const processedContent = computed(() => {
  if (!props.content) return '';

  // Split content into paragraphs using multiple newlines as separators
  const paragraphs = props.content.split(/\n\s*\n/);

  // Wrap each paragraph in a div with appropriate spacing
  return paragraphs
    .map(paragraph => {
      // Clean up each paragraph - remove extra whitespace but preserve meaningful spaces
      const cleanParagraph = paragraph
        .replace(/^\s+|\s+$/g, '') // trim leading/trailing whitespace
        .replace(/\n/g, '<br>'); // convert single newlines to <br> tags

      if (cleanParagraph) {
        return `<div class="paragraph">${cleanParagraph}</div>`;
      }
      return '';
    })
    .filter(p => p) // Remove empty paragraphs
    .join('');
});

// 自动滚动相关变量
let autoScrollInterval = null;
let isAutoScrolling = false;

// 监听设置变化并应用
const stopWatching = watch(
  () => settingsStore.$state,
  () => {
    applySettings();
  },
  { deep: true }
);

// Specifically watch paragraph spacing changes to update paragraph spacing
const stopParagraphSpacingWatching = watch(
  () => settingsStore.paragraphSpacing,
  () => {
    // Update paragraph spacing when the setting changes
    const paragraphs = document.querySelectorAll('.paragraph');
    paragraphs.forEach(paragraph => {
      paragraph.style.marginBottom = `${settingsStore.paragraphSpacing * 1.2}em`;
    });
  }
);

let autoScrollEnabledWatcher;

// 监听设置面板显示状态，暂停/恢复自动滚动
const stopSettingsWatching = watch(
  () => settingsStore.showSettings,
  (showSettings) => {
    if (showSettings) {
      // 设置界面打开时，暂停自动滚动
      if (isAutoScrolling) {
        stopAutoScroll();
        // 记录暂停状态，以便在设置面板关闭后恢复
        readerStore.wasAutoScrollPausedBySettings = true;
      }
    } else {
      // 设置界面关闭后，如果自动滚动已启用，则恢复自动滚动
      if (settingsStore.isAutoScrollEnabled && readerStore.wasAutoScrollPausedBySettings) {
        startAutoScroll();
        readerStore.wasAutoScrollPausedBySettings = false;
      }
    }
  }
);

// 监听自动滚动设置变化，同时考虑设置面板状态
autoScrollEnabledWatcher = watch(
  () => settingsStore.isAutoScrollEnabled,
  (isEnabled) => {
    // 如果设置面板正在显示，则不执行任何操作，保持暂停状态
    if (settingsStore.showSettings) {
      return;
    }

    // 设置面板未显示时，根据设置状态控制自动滚动
    if (isEnabled && !isAutoScrolling) {
      // 如果启用自动滚动且当前未在滚动，则开始滚动
      startAutoScroll();
    } else if (!isEnabled && isAutoScrolling) {
      // 如果禁用自动滚动且当前正在滚动，则停止滚动
      stopAutoScroll();
      readerStore.wasAutoScrollPausedBySettings = false;
    }
  }
);

onMounted(() => {
  // 首次应用设置
  applySettings();

  // 监听自动滚动开关事件
  const readerContainer = containerRef.value;
  if (readerContainer) {
    readerContainer.addEventListener('autoScrollToggled', handleAutoScrollToggle);

    // 监听用户手动滚动，暂停自动滚动
    readerContainer.addEventListener('scroll', handleManualScroll);

    // Space key handling is now managed in parent components
  }

  // 初始化自动滚动状态
  if (settingsStore.isAutoScrollEnabled) {
    startAutoScroll();
  }
});

onUnmounted(() => {
  // 组件卸载时停止监听
  stopWatching();
  stopSettingsWatching();
  stopParagraphSpacingWatching();
  if (autoScrollEnabledWatcher) {
    autoScrollEnabledWatcher();
  }

  // 移除事件监听器
  const readerContainer = containerRef.value;
  if (readerContainer) {
    readerContainer.removeEventListener('autoScrollToggled', handleAutoScrollToggle);
    readerContainer.removeEventListener('scroll', handleManualScroll);
    // No space key listener to remove
  }

  // 停止自动滚动
  stopAutoScroll();
});

// 处理自动滚动开关事件
function handleAutoScrollToggle(event) {
  // 如果设置面板正在显示，则不处理自动滚动开关事件
  if (settingsStore.showSettings) {
    return;
  }

  if (event.detail.enabled) {
    startAutoScroll();
  } else {
    stopAutoScroll();
  }
}

// 处理手动滚动事件，暂停自动滚动
function handleManualScroll() {
  // 如果设置面板正在显示，则不处理手动滚动事件
  if (settingsStore.showSettings) {
    return;
  }

  // 只有当滚动不是程序触发的，才暂停自动滚动
  if (!isAutoScrolling && settingsStore.isAutoScrollEnabled) {
    if (settingsStore.isAutoScrollEnabled && !isScrollViewAtBottom(document.querySelector('.reader-container'))) {
      startAutoScroll();
    }
  }
}

// 开始自动滚动
function startAutoScroll() {
  stopAutoScroll(); // 先停止当前的滚动（如果有的话）

  const readerContainer = document.querySelector('.reader-container');
  if (!readerContainer || !settingsStore.isAutoScrollEnabled) return;

  let lastScrollTime = 0;

  const animateScroll = (timestamp) => {
    if (!settingsStore.isAutoScrollEnabled) {
      stopAutoScroll();
      return;
    }

    // 第一次调用时，只记录时间，不滚动
    if (lastScrollTime === 0) {
      lastScrollTime = timestamp;
    }

    const deltaTime = timestamp - lastScrollTime;
    lastScrollTime = timestamp;

    // 检查是否已滚动到底部，如果是则根据设置决定是否自动翻页
    if (isScrollViewAtBottom(readerContainer)) {
      if (settingsStore.isAutoPaginationEnabled) {
        handleAutoPagination();
      } else {
        stopAutoScroll();
      }
      return;
    }

    // 滚动距离计算：滚动速度（像素/秒）* 时间间隔（秒）
    // 如果deltaTime异常小或为0，使用预设的帧时间（60fps = 16.67ms）
    const frameTime = deltaTime > 0 && deltaTime < 50 ? deltaTime : 16.67; // 限制最大间隔为50ms
    const pixelsToScroll = (settingsStore.autoScrollSpeed * frameTime) / 1000;

    // 累积滚动以确保低速时也能正常滚动，同时设置标志位避免触发手动滚动处理
    if (pixelsToScroll > 0) {

      // 将滚动量累加，当达到1像素或以上时再执行滚动
      if (!readerContainer.accumulatedScroll) {
        readerContainer.accumulatedScroll = 0;
      }
      readerContainer.accumulatedScroll += pixelsToScroll;

      // 当累积滚动量达到至少1像素时执行滚动
      if (readerContainer.accumulatedScroll >= 1) {
        const scrollAmount = Math.floor(readerContainer.accumulatedScroll);
        readerContainer.scrollTop += scrollAmount;
        readerContainer.accumulatedScroll -= scrollAmount;
      }
    }

    // 继续动画
    autoScrollInterval = requestAnimationFrame(animateScroll);
  };

  autoScrollInterval = requestAnimationFrame(animateScroll);
  isAutoScrolling = true;
}

// 停止自动滚动
function stopAutoScroll() {
  if (autoScrollInterval) {
    cancelAnimationFrame(autoScrollInterval);
    autoScrollInterval = null;
  }
  isAutoScrolling = false;
}

// 检查滚动视图是否在底部
function isScrollViewAtBottom(container) {
  return container.scrollHeight - container.scrollTop <= container.clientHeight + 10; // 10px 容差
}



// 处理自动翻页
async function handleAutoPagination() {
  if (readerStore.currentChapterIndex < readerStore.toc.length - 1) {
    readerStore.loadChapter(readerStore.currentChapterIndex + 1);
    // 等待DOM更新完成
    await nextTick();

    // 在章节加载完成后重置滚动位置
    const readerContainer = document.querySelector('.reader-container');
    if (readerContainer) {
      readerContainer.scrollTop = 0; // 滚动到顶部
      // 重置累积滚动值
      readerContainer.accumulatedScroll = 0;
    }

    if (settingsStore.isAutoScrollEnabled) {
      startAutoScroll(); // 重启自动滚动
    }
  } else {
    // 已到达最后一章，停止自动滚动
    stopAutoScroll();
  }
}

// 应用设置到DOM元素
function applySettings() {
  const readerContent = document.querySelector('.reader-content');
  if (readerContent) {
    // 应用字体大小
    readerContent.style.fontSize = `${settingsStore.fontSize}px`;
    // 应用行高
    readerContent.style.lineHeight = settingsStore.lineHeight;
    // 应用最大宽度
    readerContent.style.maxWidth = `${settingsStore.maxWidth}px`;
    // 应用文字间隔
    readerContent.style.letterSpacing = `${settingsStore.letterSpacing}px`;
    // 应用字体族
    readerContent.style.fontFamily = settingsStore.fontFamily;

    // 根据字体族判断是否为中文字体，应用中文阅读优化
    const isChineseFont = settingsStore.fontFamily.includes('FangSong') ||
      settingsStore.fontFamily.includes('KaiTi') ||
      settingsStore.fontFamily.includes('Microsoft YaHei') ||
      settingsStore.fontFamily.includes('PingFang') ||
      settingsStore.fontFamily.includes('仿宋') ||
      settingsStore.fontFamily.includes('楷体') ||
      settingsStore.fontFamily.includes('微软雅黑');

    if (isChineseFont) {
      // 中文阅读优化：增加行高，添加段落间距
      readerContent.style.lineHeight = (parseFloat(settingsStore.lineHeight) * 1.15).toString();  // 适当增加行高
      readerContent.style.textAlign = 'justify';  // 两端对齐
      readerContent.style.hyphens = 'none';  // 禁用连字符（不适合中文）
    } else {
      // 恢复默认设置
      readerContent.style.lineHeight = settingsStore.lineHeight.toString(); // 恢复原始行高
      readerContent.style.textAlign = 'left';
      readerContent.style.hyphens = 'auto';
    }
  }

  // Also update paragraph spacing for all paragraph elements
  const paragraphs = document.querySelectorAll('.paragraph');
  paragraphs.forEach(paragraph => {
    paragraph.style.marginBottom = `${settingsStore.paragraphSpacing * 1.2}em`;
  });
}
</script>

<style scoped>
.reader-container {
  width: auto;
  height: auto;
  background: var(--bg-secondary, #ffffff);
  padding: 1rem 0;
  /* 减少上下内边距，更多空间用于内容 */
  border-radius: 0;
  box-shadow: none;
  margin: 0 auto;
  /* Center the reader container */
}

/* Fullscreen mode adjustments */
.reader-container:fullscreen {
  width: 100%;
  height: 100%;
  padding: 2rem;
  background: var(--bg-secondary, #ffffff);
  overflow: auto;
}

.reader-container:-webkit-full-screen {
  width: 100%;
  height: 100%;
  padding: 2rem;
  background: var(--bg-secondary, #ffffff);
  overflow: auto;
}

.reader-container:-moz-full-screen {
  width: 100%;
  height: 100%;
  padding: 2rem;
  background: var(--bg-secondary, #ffffff);
  overflow: auto;
}

.reader-container:-ms-fullscreen {
  width: 100%;
  height: 100%;
  padding: 2rem;
  background: var(--bg-secondary, #ffffff);
  overflow: auto;
}

.reader-content {
  font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
  font-size: 16px;
  /* 这会被applySettings覆盖 */
  line-height: 1.8;
  /* 这会被applySettings覆盖 */
  letter-spacing: 0px;
  /* 这会被applySettings覆盖 */
  word-wrap: break-word;
  color: var(--reader-content-color, #374151);
  margin: 0 auto;
  max-width: 800px;
  /* 这会被applySettings覆盖 */
  /* Limit line length for better reading experience */
  padding: 5rem 0rem;
  /* 调整内边距到左右 */
  /* Add padding for better readability */
  overflow-x: auto;
  /* transition: all 0.2s; */
  background-color: var(--reader-content-bg, #ffffff);
  border-radius: 6px;
  /* 中文阅读优化 */
  text-align: left;
  /* 默认左对齐，动态设置 */
  hyphens: auto;
  /* 默认启用连字符，动态设置 */
}

.paragraph {
  margin-bottom: 1.2em;
  /* Default spacing, will be overridden by JS */
  line-height: inherit;
  text-indent: 0;
  /* Remove any text indentation for paragraphs */
}
</style>
