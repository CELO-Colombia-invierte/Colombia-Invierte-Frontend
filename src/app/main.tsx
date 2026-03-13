import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import '../assets/styles/global.css';

window.addEventListener('unhandledrejection', (event) => {
  const message = event.reason?.message ?? '';
  const isChunkError =
    event.reason?.name === 'ChunkLoadError' ||
    message.includes('Failed to fetch dynamically imported module') ||
    message.includes('Loading chunk') ||
    message.includes('Importing a module script failed');

  if (isChunkError) {
    window.location.reload();
  }
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

