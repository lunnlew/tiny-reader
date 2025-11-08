import React from 'react';

const FileDropZone = ({ isDragOver, onDragOver, onDragLeave, onDropFile, onTriggerFileSelect }) => {
  const handleDragOver = (e) => {
    e.preventDefault();
    onDragOver();
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    onDragLeave();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      onDropFile(file);
    }
  };

  return (
    <div 
      className={`drop-zone ${isDragOver ? 'drag-over' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={onTriggerFileSelect}
    >
      <div className="drop-content">
        <div className="icon">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </div>
        <h2 className="title">拖拽文件到此处</h2>
        <p className="subtitle">或点击选择 .txt 文件</p>
        <button className="select-btn">选择文件</button>
      </div>
    </div>
  );
};

export default FileDropZone;