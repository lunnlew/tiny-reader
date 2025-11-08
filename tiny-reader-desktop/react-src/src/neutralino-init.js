import Neutralino from "@neutralinojs/lib";

let isInitialized = false;

// Initialize Neutralino and set up the application menu
export const initNeutralinoApp = () => {
  if (typeof Neutralino !== 'undefined' && !isInitialized) {
    isInitialized = true;

    // Initialize Neutralino
    Neutralino.init();

    // Set up event listener for when Neutralino is ready
    Neutralino.events.on('ready', async () => {
      await initializeAppMenu();
    });

    // Set up event listener for menu item clicks
    Neutralino.events.on('mainMenuItemClicked', (evt) => {
      handleMenuItemClick(evt.detail.id);
    });
  }
};

// Initialize the native application menu
const initializeAppMenu = async () => {
  try {
    const menu = [
      {
        id: 'file',
        text: '文件',
        menuItems: [
          { id: 'openFile', text: '打开文件', shortcut: 'O' },
          { text: '-' }, // separator
          { id: 'quit', text: '退出', shortcut: 'Q' },
        ]
      },
      {
        id: 'view',
        text: '视图',
        menuItems: [
          { id: 'toggleFullscreen', text: '切换全屏', shortcut: 'F11' },
        ]
      },
      {
        id: 'help',
        text: '帮助',
        menuItems: [
          { id: 'settings', text: '设置', shortcut: ',' },
        ]
      }
    ];

    await Neutralino.window.setMainMenu(menu);
  } catch (error) {
    console.error('Failed to initialize application menu:', error);
  }
};

// Handle menu item clicks
const handleMenuItemClick = async (menuId) => {
  switch (menuId) {
    case 'openFile':
      await handleOpenFile();
      break;
    case 'settings':
      // We'll handle settings by triggering a custom event that the React app can listen to
      window.dispatchEvent(new CustomEvent('neutralinoMenuSettings'));
      break;
    case 'toggleFullscreen':
      // We'll handle fullscreen by triggering a custom event that the React app can listen to
      window.dispatchEvent(new CustomEvent('neutralinoToggleFullscreen'));
      break;
    case 'quit':
      await Neutralino.app.exit();
      break;
    default:
      break;
  }
};

// Handle opening a file via menu
const handleOpenFile = async () => {
  // Dispatch event to show loading state immediately (before any async operations)
  window.dispatchEvent(new CustomEvent('neutralinoOpenFileLoading', {
    detail: { isLoading: true }
  }));

  // Use setTimeout to allow the UI thread to update before performing heavy file operations
  setTimeout(async () => {
    try {
      // Use Neutralino's file dialog API to open file
      const fileEntries = await Neutralino.os.showOpenDialog('打开文件', {
        filters: [
          { name: '文本文件', extensions: ['txt'] },
          { name: '所有文件', extensions: ['*'] }
        ]
      });

      if (fileEntries && fileEntries.length > 0) {
        // Get the first selected file
        const filePath = fileEntries[0];

        // Get file stats to check size before reading (if available in Neutralino)
        try {
          const fileStats = await Neutralino.filesystem.getStats(filePath);
          const fileSize = fileStats.size;
          const maxSize = 50 * 1024 * 1024; // 50MB limit for full loading

          if (fileSize > maxSize) {
            if (!window.confirm(`File is large (${(fileSize / (1024 * 1024)).toFixed(2)} MB). Opening large files may take a while. Continue?`)) {
              // Dispatch event to hide loading state
              window.dispatchEvent(new CustomEvent('neutralinoOpenFileLoading', {
                detail: { isLoading: false }
              }));
              return;
            }
          }
        } catch (statsError) {
          // If we can't get file stats, just continue with the file operation
          console.warn('Could not get file stats:', statsError);
        }

        // Read the file as binary data using Neutralino's filesystem API
        const arrayBuffer = await Neutralino.filesystem.readBinaryFile(filePath);

        // Create a proper file-like object that mimics the File API with necessary properties
        const fileName = filePath.split('/').pop().split('\\').pop();

        // Create a Blob first, then a File from the Blob
        const fileBlob = new Blob([arrayBuffer]);
        const file = new File([fileBlob], fileName, {
          type: 'text/plain',
          lastModified: Date.now()
        });

        // Dispatch a custom event to notify the React app to handle the file
        window.dispatchEvent(new CustomEvent('neutralinoOpenFile', {
          detail: { file }
        }));
      } else {
        // Dispatch event to hide loading state if no file was selected
        window.dispatchEvent(new CustomEvent('neutralinoOpenFileLoading', {
          detail: { isLoading: false }
        }));
      }
    } catch (error) {
      console.error('Error opening file:', error);
      alert('Failed to open file: ' + error.message);
      // Dispatch event to hide loading state on error
      window.dispatchEvent(new CustomEvent('neutralinoOpenFileLoading', {
        detail: { isLoading: false }
      }));
    }
  }, 0); // Use 0ms to schedule the operation after the current execution stack
};