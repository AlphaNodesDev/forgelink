import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { App } from './App';
import { ProjectProvider } from './state/ProjectContext';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HashRouter>
      <ProjectProvider>
        <App />
      </ProjectProvider>
    </HashRouter>
  </React.StrictMode>,
);
