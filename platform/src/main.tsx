import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { DataProvider } from './data/DataProvider';
import { OverlayProvider } from './components/overlays/OverlayProvider';
import { LangProvider } from './i18n';
import './styles/tokens.css';
import './styles/shell.css';
import './styles/components.css';
import './styles/pages.css';
import './styles/detail.css';
import './styles/more.css';
import './styles/dashboard.css';
import './styles/overlays.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <LangProvider>
        <DataProvider>
          <OverlayProvider>
            <App />
          </OverlayProvider>
        </DataProvider>
      </LangProvider>
    </BrowserRouter>
  </StrictMode>,
);
