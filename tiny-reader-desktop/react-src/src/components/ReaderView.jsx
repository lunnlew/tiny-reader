import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useSettingsStore } from '../stores/settingsStore';
import { useReaderStore } from '../stores/readerStore';

const ReaderView = ({ content }) => {
  const settingsStore = useSettingsStore();
  const readerStore = useReaderStore();
  const containerRef = useRef(null);
  const [processedContent, setProcessedContent] = useState('');

  // Process content to handle paragraphs and apply paragraph spacing
  useEffect(() => {
    if (!content) {
      setProcessedContent('');
      return;
    }

    // Split content into paragraphs using multiple newlines as separators
    const paragraphs = content.split(/\n\s*\n/);

    // Wrap each paragraph in a div with appropriate spacing
    const processed = paragraphs
      .map(paragraph => {
        // Clean up each paragraph - remove extra whitespace but preserve meaningful spaces
        const cleanParagraph = paragraph
          .replace(/^\s+|\s+$/g, '') // trim leading/trailing whitespace
          .replace(/\n/g, '<br>') // convert single newlines to <br> tags

        if (cleanParagraph) {
          return `<div class="paragraph">${cleanParagraph}</div>`;
        }
        return '';
      })
      .filter(p => p) // Remove empty paragraphs
      .join('');

    setProcessedContent(processed);
  }, [content]);

  // 自动滚动相关变量
  const autoScrollInterval = useRef(null);
  const isAutoScrolling = useRef(false);

  // 应用设置到DOM元素
  const applySettings = useCallback(() => {
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
  }, [settingsStore.fontSize, settingsStore.lineHeight, settingsStore.maxWidth,
  settingsStore.letterSpacing, settingsStore.fontFamily, settingsStore.paragraphSpacing]);

  // 监听设置变化并应用
  useEffect(() => {
    applySettings();
  }, [applySettings]);

  const latestIndexRef = useRef(readerStore.currentChapterIndex);

  useEffect(() => {
    latestIndexRef.current = readerStore.currentChapterIndex;
  }, [readerStore.currentChapterIndex]);

  // 检查滚动视图是否在底部
  const isScrollViewAtBottom = useCallback((container) => {
    return container.scrollHeight - container.scrollTop <= container.clientHeight + 10; // 10px 容差
  }, []);

  // 停止自动滚动
  const stopAutoScroll = useCallback(() => {
    if (autoScrollInterval.current) {
      cancelAnimationFrame(autoScrollInterval.current);
      autoScrollInterval.current = null;
    }
    isAutoScrolling.current = false;
  }, [autoScrollInterval, isAutoScrolling]);



  // 开始自动滚动
  const startAutoScroll = useCallback(() => {
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
      // 但要确保我们确实已经滚动了一段距离, 防止刚加载就跳转到下一章
      const shouldCheckPagination = readerContainer.scrollTop > 0;
      if (isScrollViewAtBottom(readerContainer) && shouldCheckPagination) {
        if (settingsStore.isAutoPaginationEnabled) {
          // 在处理自动翻页后，停止当前动画，新章节会重新开始滚动
          handleAutoPaginationRef.current?.();
          return; // 停止当前动画，新章节的滚动会在handleAutoPagination中启动
        } else {
          stopAutoScroll();
          return;
        }
      }

      // 滚动距离计算：滚动速度（像素/秒）* 时间间隔（秒）
      // 如果deltaTime异常小或为0，使用预设的帧时间（60fps = 16.67ms）
      const frameTime = deltaTime > 0 && deltaTime < 50 ? deltaTime : 16.67; // 限制最大间隔为50ms
      const pixelsToScroll = (settingsStore.autoScrollSpeed * frameTime) / 1000;

      // 累积滚动以确保低速时也能正常滚动，同时设置标志位避免触发手动滚动处理
      if (pixelsToScroll > 0) {
        // 将滚动量累积，当达到1像素或以上时再执行滚动
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
      autoScrollInterval.current = requestAnimationFrame(animateScroll);
    };

    autoScrollInterval.current = requestAnimationFrame(animateScroll);
    isAutoScrolling.current = true;
  }, [settingsStore, isScrollViewAtBottom, stopAutoScroll]);

  // 处理自动翻页
  const handleAutoPaginationRef = useRef();

  useEffect(() => {
    handleAutoPaginationRef.current = async () => {
      const currentIndex = latestIndexRef.current;
      const toc = readerStore.toc;

      if (currentIndex < toc.length - 1) {
        await readerStore.loadChapter(currentIndex + 1);

        setTimeout(() => {
          const readerContainer = document.querySelector('.reader-container');
          if (readerContainer) {
            readerContainer.scrollTop = 0;
            readerContainer.accumulatedScroll = 0;
          }

          if (settingsStore.isAutoScrollEnabled) {
            startAutoScroll();
          }
        }, 100);
      } else {
        stopAutoScroll();
      }
    };
  });

  // 处理手动滚动事件，暂停自动滚动
  const handleManualScroll = useCallback(() => {
    // 如果设置面板正在显示，则不处理手动滚动事件
    if (settingsStore.showSettings) {
      return;
    }

    // 只有当滚动不是程序触发的，才暂停自动滚动
    if (!isAutoScrolling.current && settingsStore.isAutoScrollEnabled) {
      if (settingsStore.isAutoScrollEnabled && !isScrollViewAtBottom(document.querySelector('.reader-container'))) {
        startAutoScroll();
      }
    }
  }, [settingsStore.showSettings, settingsStore.isAutoScrollEnabled, isScrollViewAtBottom, startAutoScroll]);

  // 监听自动滚动开关事件
  useEffect(() => {
    const readerContainer = containerRef.current;
    if (readerContainer) {
      const handleAutoScrollToggle = (event) => {
        // 如果设置面板正在显示，则不处理自动滚动开关事件
        if (settingsStore.showSettings) {
          return;
        }

        if (event.detail.enabled) {
          startAutoScroll();
        } else {
          stopAutoScroll();
        }
      };

      readerContainer.addEventListener('autoScrollToggled', handleAutoScrollToggle);
      readerContainer.addEventListener('scroll', handleManualScroll);

      // 初始化自动滚动状态
      if (settingsStore.isAutoScrollEnabled) {
        startAutoScroll();
      }

      return () => {
        readerContainer.removeEventListener('autoScrollToggled', handleAutoScrollToggle);
        readerContainer.removeEventListener('scroll', handleManualScroll);
        stopAutoScroll();
      };
    }
  }, [settingsStore, startAutoScroll, handleManualScroll, stopAutoScroll]);

  // 监听自动滚动设置变化
  useEffect(() => {
    if (settingsStore.showSettings) {
      // 设置界面打开时，暂停自动滚动
      if (isAutoScrolling.current) {
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

    // 根据设置状态控制自动滚动
    if (!settingsStore.showSettings) {
      if (settingsStore.isAutoScrollEnabled && !isAutoScrolling.current) {
        // 如果启用自动滚动且当前未在滚动，则开始滚动
        startAutoScroll();
      } else if (!settingsStore.isAutoScrollEnabled && isAutoScrolling.current) {
        // 如果禁用自动滚动且当前正在滚动，则停止滚动
        stopAutoScroll();
        readerStore.wasAutoScrollPausedBySettings = false;
      }
    }
  }, [settingsStore.isAutoScrollEnabled, settingsStore.showSettings, readerStore, startAutoScroll, stopAutoScroll]);

  return (
    <div className="reader-container" ref={containerRef}>
      <div
        className="reader-content"
        dangerouslySetInnerHTML={{ __html: processedContent }}
      />
    </div>
  );
};

export default ReaderView;