import React, { useState, useEffect } from 'react';
import './App.css';

// Import NeutralinoJS filesystem API
import { filesystem } from "@neutralinojs/lib"

// Import the main components
import FileLoader from './components/FileLoader';
import SettingsModal from './components/SettingsModal';
import { useReaderStore } from './stores/readerStore';
import { useSettingsStore } from './stores/settingsStore';

function App() {
  const [isMobile, setIsMobile] = useState(false);
  
  // Initialize stores
  const readerStore = useReaderStore();
  const settingsStore = useSettingsStore();

  // Log current directory or error after component is mounted
  useEffect(() => {
    filesystem.readDirectory('./').then((data) => {
      console.log(data)
    }).catch((err) => {
      console.log(err)
    })

    // Check for mobile
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    return () => {
      window.removeEventListener('resize', checkIsMobile);
    };
  }, []);

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