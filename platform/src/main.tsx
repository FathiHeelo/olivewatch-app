import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { DataProvider } from './data/DataProvider';
import './styles/tokens.css';
import './styles/shell.css';
import './styles/components.css';
import './styles/pages.css';
import './styles/detail.css';
import './styles/more.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <DataProvider>
        <App />
      </DataProvider>
    </BrowserRouter>
  </StrictMode>,
);
