import React, { useEffect, useRef } from 'react';

const TocPanel = ({ toc, currentChapterIndex, isTocVisible, onToggleSettings, onReloadFile, onJumpToChapter }) => {
  const tocContentRef = useRef(null);
  const itemRefs = useRef({});

  // Scroll to current chapter when the component mounts or when currentChapterIndex changes
  useEffect(() => {
    if (currentChapterIndex >= 0 && toc.length > 0) {
      const activeElement = itemRefs.current[currentChapterIndex];
      if (activeElement && tocContentRef.current) {
        // Use a small timeout to ensure DOM is updated before scrolling
        setTimeout(() => {
          // Scroll the element into view with smooth behavior
          activeElement.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'nearest'
          });
        }, 50);
      }
    }
  }, [currentChapterIndex, toc.length]);

  return (
    <div className="toc-panel">
      <div className="toc-header">
        <h3 className="toc-title">目录</h3>
        <div className="toc-actions">
          <button
            className="settings-btn"
            onClick={onToggleSettings}
            title="设置"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="3"></circle>
              <path
                d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z">
              </path>
            </svg>
          </button>
          <button
            className="reload-file-btn"
            onClick={onReloadFile}
            title="选择新文件"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
          </button>
        </div>
      </div>
      <div className="toc-content" ref={tocContentRef}>
        <ul className="toc-list">
          {toc.map((item, index) => (
            <li
              key={index}
              ref={el => { itemRefs.current[index] = el; }}
              className={`toc-item ${index === currentChapterIndex ? 'active' : ''}`}
              onClick={() => onJumpToChapter(index)}
            >
              <span className="toc-index">{index + 1}.</span>
              <span className="toc-title">{item.title}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default TocPanel;