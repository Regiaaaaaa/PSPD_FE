import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Optimized favicon update - only adds timestamp in development
const updateFavicon = () => {
  document.querySelectorAll("link[rel*='icon']").forEach(link => link.remove());
  const favicon = document.createElement('link');
  favicon.rel = 'shortcut icon';
  favicon.type = 'image/png';
  
  // Only add timestamp in development mode
  if (import.meta.env.DEV) {
    // Development: bypass cache
    favicon.href = '/icon1.png?t=' + new Date().getTime();
  } else {
    // Production: use cache (better performance)
    favicon.href = '/icon1.png';
  }
  
  document.head.appendChild(favicon);
};

updateFavicon();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)