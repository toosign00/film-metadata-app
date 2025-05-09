import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/index.css';
import App from './App';
import { Analytics } from '@vercel/analytics/react';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element not found');

const root = createRoot(rootElement);

root.render(
  <StrictMode>
    <App />
    <Analytics />
  </StrictMode>
);
