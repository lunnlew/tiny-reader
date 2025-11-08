import React from 'react';

const FileLoadingIndicator = ({ isLoading, hasToc }) => {
  if (!isLoading) return null;

  return (
    <div className="loading-container">
      <div className="loading-overlay">
        <div className="spinner"></div>
        <p>正在处理文件...</p>
        {hasToc && <p>目录已生成，正在加载内容...</p>}
      </div>
    </div>
  );
};

export default FileLoadingIndicator;