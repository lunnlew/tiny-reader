import React, { useState, useEffect } from 'react';
import './App.css';

// Import the main components
import FileLoader from './components/FileLoader';
import SettingsModal from './components/SettingsModal';
import { useReaderStore } from './stores/readerStore';
import { useSettingsStore } from './stores/settingsStore';

// Import Neutralino initialization
import { initNeutralinoApp } from './neutralino-init';

function App() {
  const [isMobile, setIsMobile] = useState(false);

  // Initialize stores
  const readerStore = useReaderStore();
  const settingsStore = useSettingsStore();

  // Initialize Neutralino when component mounts
  useEffect(() => {
    // Initialize Neutralino if in Neutralino environment
    if (typeof window !== 'undefined' && typeof window.Neutralino !== 'undefined') {
      initNeutralinoApp();
    }

    // Check for mobile
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    // Add event listener for menu-triggered file opening
    const handleOpenFileEvent = (event) => {
      if (event.detail && event.detail.file) {
        readerStore.processFile(event.detail.file);
      }
    };
    
    // Add event listener for menu-triggered loading state
    const handleLoadingEvent = (event) => {
      if (event.detail && typeof event.detail.isLoading === 'boolean') {
        readerStore.setIsLoading(event.detail.isLoading);
      }
    };
    
    // Add event listener for menu-triggered settings
    const handleSettingsEvent = () => {
      settingsStore.toggleSettings();
    };

    window.addEventListener('neutralinoOpenFile', handleOpenFileEvent);
    window.addEventListener('neutralinoOpenFileLoading', handleLoadingEvent);
    window.addEventListener('neutralinoMenuSettings', handleSettingsEvent);

    return () => {
      window.removeEventListener('resize', checkIsMobile);
      window.removeEventListener('neutralinoOpenFile', handleOpenFileEvent);
      window.removeEventListener('neutralinoOpenFileLoading', handleLoadingEvent);
      window.removeEventListener('neutralinoMenuSettings', handleSettingsEvent);
    };
  }, [readerStore, settingsStore]);

  // Apply theme when component mounts
  useEffect(() => {
    settingsStore.applyTheme();
  }, [settingsStore]);

  return (
    <div className="app-container">
      <div className="app-main">
        {/* File loader component */}
        {!isMobile ? <FileLoader /> : <FileLoader isMobile={true} />}
      </div>

      {/* Settings modal */}
      {settingsStore.showSettings && <SettingsModal />}
    </div>
  );
}

export default App;