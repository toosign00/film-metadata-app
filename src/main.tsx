import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import 'react-datepicker/dist/react-datepicker.css';
import '@/assets/styles/datepicker.css';
import '@/assets/styles/global.css';
import { Analytics } from '@vercel/analytics/react';
import App from './App';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Failed to find the root element');
}

const root = createRoot(rootElement);

root.render(
  <StrictMode>
    <App />
    <Analytics />
  </StrictMode>
);
