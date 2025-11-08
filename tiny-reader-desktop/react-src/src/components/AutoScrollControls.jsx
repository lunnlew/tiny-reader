import React from 'react';

const AutoScrollControls = ({ 
  isAutoScrollEnabled, 
  autoScrollSpeed, 
  isAutoPaginationEnabled,
  onUpdateIsAutoScrollEnabled,
  onUpdateAutoScrollSpeed,
  onUpdateIsAutoPaginationEnabled,
  onToggleAutoScroll
}) => {
  const handleAutoScrollChange = (e) => {
    const checked = e.target.checked;
    onUpdateIsAutoScrollEnabled(checked);
    if (checked) {
      onToggleAutoScroll();
    }
  };

  const handleSpeedChange = (e) => {
    const speed = parseInt(e.target.value);
    onUpdateAutoScrollSpeed(speed);
  };

  const handleAutoPaginationChange = (e) => {
    onUpdateIsAutoPaginationEnabled(e.target.checked);
  };

  return (
    <div className="auto-controls">
      <div className="auto-control-group">
        <label className="auto-control-label">
          <input
            type="checkbox"
            className="auto-checkbox"
            checked={isAutoScrollEnabled}
            onChange={handleAutoScrollChange}
          />
          自动滚动
        </label>
        {isAutoScrollEnabled && (
          <>
            <input
              type="range"
              className="speed-slider"
              min="10"
              max="200"
              step="10"
              value={autoScrollSpeed}
              onChange={handleSpeedChange}
              title="滚动速度"
            />
            <span className="speed-value">
              {autoScrollSpeed}
            </span>
          </>
        )}
      </div>

      <div className="auto-control-group">
        <label className="auto-control-label">
          <input
            type="checkbox"
            className="auto-checkbox"
            checked={isAutoPaginationEnabled}
            onChange={handleAutoPaginationChange}
          />
          自动翻页
        </label>
      </div>
    </div>
  );
};

export default AutoScrollControls;