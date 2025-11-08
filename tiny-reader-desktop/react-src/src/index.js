import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';

import { initNeutralinoApp } from './neutralino-init';

const container = document.getElementById('root');
const root = createRoot(container);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Initialize our custom Neutralino functionality (will only run when Neutralino is ready)
initNeutralinoApp();