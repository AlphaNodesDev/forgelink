import React from 'react';
import { NavLink } from 'react-router-dom';
import { useProjects } from '../state/ProjectContext';

/** Sidebar navigation matching the ForgeLink Builder spec. */
const NAV = [
  { to: '/', label: 'Dashboard', icon: '◆', requiresProject: false },
  { to: '/projects', label: 'Projects', icon: '▤', requiresProject: false },
  { to: '/launcher', label: 'Launcher', icon: '▶', requiresProject: true },
  { to: '/mods', label: 'Mods', icon: '⬡', requiresProject: true },
  { to: '/deployment', label: 'Deployment', icon: '☁', requiresProject: true },
  { to: '/branding', label: 'Branding', icon: '✦', requiresProject: true },
  { to: '/security', label: 'Security', icon: '⛨', requiresProject: true },
  { to: '/build', label: 'Build', icon: '⚙', requiresProject: true },
  { to: '/settings', label: 'Settings', icon: '⚑', requiresProject: false },
];

export function Sidebar(): JSX.Element {
  const { activeProject, theme, setTheme } = useProjects();

  return (
    <aside className="w-64 shrink-0 h-full flex flex-col p-4 border-r border-white/5">
      <div className="flex items-center gap-3 px-2 py-3 mb-4">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand to-brand-accent flex items-center justify-center font-black text-white">
          F
        </div>
        <div>
          <div className="font-bold leading-tight">ForgeLink</div>
          <div className="text-xs text-[rgb(var(--muted))]">Builder</div>
        </div>
      </div>

      <nav className="flex-1 space-y-1">
        {NAV.map((item) => {
          const disabled = item.requiresProject && !activeProject;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                [
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                  disabled ? 'opacity-30 pointer-events-none' : '',
                  isActive
                    ? 'bg-brand/15 text-brand'
                    : 'hover:bg-black/5 dark:hover:bg-white/5 text-[rgb(var(--fg))]',
                ].join(' ')
              }
            >
              <span className="w-5 text-center">{item.icon}</span>
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      {activeProject && (
        <div className="glass-light p-3 mb-3 text-xs">
          <div className="text-[rgb(var(--muted))]">Active project</div>
          <div className="font-semibold truncate">{activeProject.meta.name}</div>
        </div>
      )}

      <button
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        className="btn-ghost justify-center text-sm"
      >
        {theme === 'dark' ? '☀ Light mode' : '☾ Dark mode'}
      </button>
    </aside>
  );
}
