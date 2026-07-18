import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { Project, ThemeMode } from '@forgelink/shared';

/**
 * Global renderer state: the list of projects, the currently-selected project,
 * and the UI theme. All persistence goes through the preload API so this
 * context is a thin cache + orchestration layer.
 */
interface ProjectContextValue {
  projects: Project[];
  activeProject: Project | null;
  theme: ThemeMode;
  loading: boolean;
  refresh: () => Promise<void>;
  selectProject: (id: string) => Promise<void>;
  updateActive: (mutator: (draft: Project) => void) => Promise<void>;
  setTheme: (theme: ThemeMode) => void;
}

const ProjectContext = createContext<ProjectContextValue | null>(null);

export function ProjectProvider({ children }: { children: React.ReactNode }): JSX.Element {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [theme, setThemeState] = useState<ThemeMode>('dark');
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const list = await window.forgelink.listProjects();
    setProjects(list);
    setLoading(false);
    // Keep the active project in sync with the freshly-loaded list.
    setActiveProject((current) =>
      current ? list.find((p) => p.id === current.id) ?? current : null,
    );
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  // Apply theme class + branding tokens to <html>.
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    root.classList.toggle('light', theme === 'light');
    if (activeProject) {
      const hexToRgb = (hex: string): string => {
        const n = parseInt(hex.replace('#', ''), 16);
        return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`;
      };
      root.style.setProperty('--brand-primary', hexToRgb(activeProject.branding.primaryColor));
      root.style.setProperty('--brand-accent', hexToRgb(activeProject.branding.accentColor));
    }
  }, [theme, activeProject]);

  const selectProject = useCallback(async (id: string) => {
    const project = await window.forgelink.getProject(id);
    setActiveProject(project);
    if (project) setThemeState(project.branding.themeMode);
  }, []);

  const updateActive = useCallback(
    async (mutator: (draft: Project) => void) => {
      if (!activeProject) return;
      const draft: Project = structuredClone(activeProject);
      mutator(draft);
      const saved = await window.forgelink.saveProject(draft);
      setActiveProject(saved);
      setProjects((prev) => prev.map((p) => (p.id === saved.id ? saved : p)));
    },
    [activeProject],
  );

  const setTheme = useCallback((next: ThemeMode) => setThemeState(next), []);

  const value = useMemo<ProjectContextValue>(
    () => ({ projects, activeProject, theme, loading, refresh, selectProject, updateActive, setTheme }),
    [projects, activeProject, theme, loading, refresh, selectProject, updateActive, setTheme],
  );

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
}

export function useProjects(): ProjectContextValue {
  const ctx = useContext(ProjectContext);
  if (!ctx) throw new Error('useProjects must be used within ProjectProvider');
  return ctx;
}
