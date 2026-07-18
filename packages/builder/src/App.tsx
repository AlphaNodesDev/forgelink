import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { Projects } from './pages/Projects';
import { LauncherConfig } from './pages/LauncherConfig';
import { Mods } from './pages/Mods';
import { Deployment } from './pages/Deployment';
import { Branding } from './pages/Branding';
import { Security } from './pages/Security';
import { Build } from './pages/Build';
import { Settings } from './pages/Settings';

/** Top-level layout: fixed sidebar + routed content area. */
export function App(): JSX.Element {
  return (
    <div className="flex h-screen overflow-hidden bg-[rgb(var(--surface))]">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/launcher" element={<LauncherConfig />} />
          <Route path="/mods" element={<Mods />} />
          <Route path="/deployment" element={<Deployment />} />
          <Route path="/branding" element={<Branding />} />
          <Route path="/security" element={<Security />} />
          <Route path="/build" element={<Build />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>
    </div>
  );
}
