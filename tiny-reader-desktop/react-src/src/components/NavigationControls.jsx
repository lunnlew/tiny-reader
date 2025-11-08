import React from 'react';

const NavigationControls = ({ currentChapterIndex, tocLength, onPrevChapter, onNextChapter }) => {
  return (
    <div className="nav-controls">
      <div className="nav-wrapper">
        <span className="chapter-info">
          第 {currentChapterIndex + 1} 章，共 {tocLength} 章
        </span>
        <button 
          className="nav-btn" 
          onClick={() => onPrevChapter(1)}
          disabled={currentChapterIndex <= 0}
        >
          ← 上一章
        </button>
        <button 
          className="nav-btn" 
          onClick={() => onNextChapter(1)}
          disabled={currentChapterIndex >= tocLength - 1}
        >
          下一章 →
        </button>
      </div>
    </div>
  );
};

export default NavigationControls;