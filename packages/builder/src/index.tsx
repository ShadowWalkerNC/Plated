// @plated/builder — React 19 entrypoint
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App.js';
import './styles/base.css';

const root = document.getElementById('root');
if (!root) throw new Error('[builder] #root element not found');

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
