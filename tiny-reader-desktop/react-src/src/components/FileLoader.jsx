import React, { useState, useRef, useEffect } from 'react';
import { useReaderStore } from '../stores/readerStore';
import { useSettingsStore } from '../stores/settingsStore';
import FileDropZone from './FileDropZone';
import FileLoadingIndicator from './FileLoadingIndicator';
import TocPanel from './TocPanel';
import NavigationControls from './NavigationControls';
import AutoScrollControls from './AutoScrollControls';
import ReaderView from './ReaderView';

// Import Neutralino for native window methods
import Neutralino from '@neutralinojs/lib';

const FileLoader = ({ isMobile = false }) => {
  const readerStore = useReaderStore();
  const settingsStore = useSettingsStore();
  const fileInputRef = useRef(null);

  // 切换目录显示
  const toggleToc = () => {
    settingsStore.setTocVisibility(!settingsStore.isTocVisible);
  };

  // 切换设置界面显示
  const toggleSettings = () => {
    settingsStore.toggleSettings();
  };

  // 切换全屏模式
  const toggleFullscreen = async () => {
    try {
      const isCurrentlyFullscreen = await Neutralino.window.isFullScreen();

      if (!isCurrentlyFullscreen) {
        await Neutralino.window.setFullScreen();
        settingsStore.setFullscreen(true);
      } else {
        await Neutralino.window.exitFullScreen();
        settingsStore.setFullscreen(false);
      }
    } catch (error) {
      console.error('Failed to toggle fullscreen:', error);
    }
  };

  // Handle drag over event
  const handleDragOver = () => {
    if (!readerStore.isDragOver) {
      console.log('File drag over detected');
      readerStore.setDragOver(true);
    }
  };

  // Handle drag leave event
  const handleDragLeave = () => {
    console.log('File drag left the drop zone');
    readerStore.setDragOver(false);
  };

  // Handle drop event
  const onDropFile = (file) => {
    readerStore.setDragOver(false);

    console.log('File drop event received:', file);
    if (file && (file.type.startsWith('text/') || file.name.endsWith('.txt'))) {
      console.log('Processing dropped file:', file.name, 'Size:', file.size, 'bytes');
      readerStore.processFile(file);
    }
  };

  // Trigger file input click
  const triggerFileSelect = () => {
    if (!readerStore.isLoading) {
      fileInputRef.current?.click();
    }
  };

  // Handle file selection from input
  const onFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log('File selected from input:', file.name, 'Size:', file.size, 'bytes');
      readerStore.processFile(file);
    }
  };

  // Navigate to a specific chapter from TOC
  const jumpToChapter = (index) => {
    console.log(`Jumping to chapter at index ${index}: "${readerStore.toc[index].title}"`);
    readerStore.loadChapter(index);
    // 自动滚动到顶部
    scrollToTop();
  };

  // Check if current chapter content can be scrolled further
  const canScrollCurrentChapter = () => {
    const readerContainer = document.querySelector('.reader-container');
    if (!readerContainer) return false;

    // Check if we're not at the bottom of the content
    const maxScroll = readerContainer.scrollHeight - readerContainer.clientHeight;
    return readerContainer.scrollTop < maxScroll - 5; // 5px tolerance
  };

  // Scroll to next page within current chapter
  const scrollToNextPage = () => {
    const readerContainer = document.querySelector('.reader-container');
    if (!readerContainer) return;

    const viewportHeight = readerContainer.clientHeight;
    const currentScrollTop = readerContainer.scrollTop;
    const maxScroll = readerContainer.scrollHeight - readerContainer.clientHeight;

    // Calculate next page position (scroll 90% of viewport)
    const nextPagePosition = Math.min(currentScrollTop + viewportHeight * 0.9, maxScroll);

    readerContainer.scrollTop = nextPagePosition;
  };

  // Next chapter handler (with pagination within chapter)
  const nextChapter = (type) => {
    // First check if we can scroll more within the current chapter
    if (type != 1 && canScrollCurrentChapter()) {
      scrollToNextPage();
    } else {
      // If no more to scroll in current chapter, go to next chapter
      if (readerStore.currentChapterIndex < readerStore.toc.length - 1) {
        console.log('Moving to next chapter');
        readerStore.loadChapter(readerStore.currentChapterIndex + 1);
        // 自动滚动到顶部
        scrollToTop();
      } else {
        console.log('Already at the last chapter');
      }
    }
  };

  // Previous chapter handler
  const prevChapter = (type) => {
    if (type != 1 && readerStore.currentChapterIndex > 0) {
      console.log('Moving to previous chapter');
      readerStore.loadChapter(readerStore.currentChapterIndex - 1);
      // 自动滚动到顶部
      scrollToTop();
    } else {
      console.log('Already at the first chapter');
    }
  };

  // 跳转到顶部
  const scrollToTop = () => {
    setTimeout(() => {
      const readerContainer = document.querySelector('.reader-container');
      if (readerContainer) {
        readerContainer.scrollTop = 0;
      }
    }, 0);
  };

  // 处理自动滚动开关
  const toggleAutoScroll = () => {
    const newEnabled = !settingsStore.isAutoScrollEnabled;
    settingsStore.isAutoScrollEnabled = newEnabled;

    // 触发事件通知ReaderView组件更新自动滚动状态
    const readerContainer = document.querySelector('.reader-container');
    if (readerContainer) {
      readerContainer.dispatchEvent(new CustomEvent('autoScrollToggled', {
        detail: {
          enabled: newEnabled,
          speed: settingsStore.autoScrollSpeed
        }
      }));
    }
  };

  // Update auto scroll enabled state
  const updateAutoScrollEnabled = (value) => {
    settingsStore.setIsAutoScrollEnabled(value);
  };

  // Update auto scroll speed
  const updateAutoScrollSpeed = (value) => {
    settingsStore.setAutoScrollSpeed(value);
  };

  // Update auto pagination enabled state
  const updateAutoPaginationEnabled = (value) => {
    settingsStore.setIsAutoPaginationEnabled(value);
  };

  // Load cached data on component mount
  useEffect(() => {
    readerStore.loadFromCache();
  }, []);


  // 处理键盘事件
  useEffect(() => {
    const handleKeyboard = (e) => {
      // 避开输入框、文本区域或可编辑元素时才响应
      const activeElement = document.activeElement;
      if (activeElement && (activeElement.tagName === 'INPUT' ||
        activeElement.tagName === 'TEXTAREA' ||
        activeElement.contentEditable === 'true')) {
        return;
      }

      // Check if the pressed key matches any of the configured fullscreen keys
      if (settingsStore.keyBindings.fullscreen.includes(e.key)) {
        e.preventDefault();
        toggleFullscreen();
        return;
      }

      // Check if the pressed key matches any of the configured next chapter keys
      if (settingsStore.keyBindings.nextChapter.includes(e.key)) {
        e.preventDefault();
        nextChapter();
        return;
      }

      // Check if the pressed key matches any of the configured previous chapter keys
      if (settingsStore.keyBindings.prevChapter.includes(e.key)) {
        e.preventDefault();
        prevChapter();
        return;
      }
    };

    window.addEventListener('keydown', handleKeyboard);
    return () => {
      window.removeEventListener('keydown', handleKeyboard);
    };
  }, [settingsStore.keyBindings, toggleFullscreen, nextChapter, prevChapter]);
  // Add effect for handling menu-triggered fullscreen and other events
  useEffect(() => {
    // Add event listener for menu-triggered fullscreen
    const handleFullscreenEvent = () => {
      toggleFullscreen();
    };

    window.addEventListener('neutralinoToggleFullscreen', handleFullscreenEvent);

    return () => {
      window.removeEventListener('neutralinoToggleFullscreen', handleFullscreenEvent);
    };
  }, [toggleFullscreen]); // Add toggleFullscreen to the dependency array

  return (
    <div className="file-loader-container">
      {/* Hidden file input that's always available */}
      <input
        type="file"
        ref={fileInputRef}
        accept=".txt"
        onChange={onFileSelect}
        className="file-input"
      />

      {/* Show file loader when no content is loaded */}
      {!readerStore.currentChapterContent && !readerStore.isLoading && (
        <FileDropZone
          isDragOver={readerStore.isDragOver}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDropFile={onDropFile}
          onTriggerFileSelect={triggerFileSelect}
        />
      )}

      {/* Loading state for initial file processing */}
      {readerStore.isLoading && (
        <FileLoadingIndicator
          isLoading={readerStore.isLoading}
          hasToc={readerStore.toc.length > 0}
        />
      )}

      {/* File content viewer with pagination when content is available */}
      {readerStore.currentChapterContent && !readerStore.isLoading && (
        <div className="reading-layout">
          {/* Table of Contents on the left (hidden on mobile) */}
          {readerStore.toc.length > 0 && settingsStore.isTocVisible && !isMobile && (
            <TocPanel
              toc={readerStore.toc}
              currentChapterIndex={readerStore.currentChapterIndex}
              isTocVisible={settingsStore.isTocVisible}
              onToggleSettings={toggleSettings}
              onReloadFile={triggerFileSelect}
              onJumpToChapter={jumpToChapter}
            />
          )}

          {/* 目录收起/展开切换按钮 (hidden on mobile) */}
          {readerStore.toc.length > 0 && !isMobile && (
            <div className="toc-toggle-divider">
              <button
                onClick={toggleToc}
                title={settingsStore.isTocVisible ? '隐藏目录' : '显示目录'}
                className="toc-toggle-btn"
              >
                {settingsStore.isTocVisible ? '«' : '»'}
              </button>
            </div>
          )}

          {/* Main content area */}
          <div className="main-content">
            {/* Notification when file is too large to cache fully */}
            {readerStore.showLargeFileNotification && (
              <div className="large-file-notification">
                <p>⚠️ 文件过大，部分内容未完全缓存。刷新后可能无法浏览不同章节。</p>
              </div>
            )}

            <div className="reader-container">
              {/* Show loading spinner in reader when loading a specific chapter */}
              {readerStore.isLoading && readerStore.toc.length > 0 && (
                <div className="reader-loading-overlay">
                  <div className="spinner"></div>
                  <p>正在加载章节...</p>
                </div>
              )}
              <ReaderView content={readerStore.currentChapterContent} />
            </div>

            {/* Navigation controls at the bottom (hidden on mobile) */}
            {readerStore.toc.length > 0 && !isMobile && (
              <div className="bottom-controls-container">
                <div className="bottom-controls-content">
                  <NavigationControls
                    currentChapterIndex={readerStore.currentChapterIndex}
                    tocLength={readerStore.toc.length}
                    onPrevChapter={prevChapter}
                    onNextChapter={nextChapter}
                  />

                  {/* Auto-scroll and auto-pagination controls */}
                  <AutoScrollControls
                    isAutoScrollEnabled={settingsStore.isAutoScrollEnabled}
                    autoScrollSpeed={settingsStore.autoScrollSpeed}
                    isAutoPaginationEnabled={settingsStore.isAutoPaginationEnabled}
                    onUpdateIsAutoScrollEnabled={updateAutoScrollEnabled}
                    onUpdateAutoScrollSpeed={updateAutoScrollSpeed}
                    onUpdateIsAutoPaginationEnabled={updateAutoPaginationEnabled}
                    onToggleAutoScroll={toggleAutoScroll}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileLoader;