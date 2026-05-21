import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import 'file-salad-ui-lib/styles.css';

import { App } from './app.tsx';
import './styles.css';

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('Missing #root element in index.html');

createRoot(rootEl).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
