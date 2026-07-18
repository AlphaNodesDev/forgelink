import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjects } from '../state/ProjectContext';
import { Card, Badge, EmptyState } from '../components/ui';
import { GAME_CATALOG } from '@forgelink/shared';

/** Landing dashboard: quick stats and recent projects. */
export function Dashboard(): JSX.Element {
  const { projects, activeProject, selectProject } = useProjects();
  const navigate = useNavigate();

  const openProject = async (id: string): Promise<void> => {
    await selectProject(id);
    navigate('/launcher');
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <header className="animate-fade-in">
        <h1 className="text-3xl font-black tracking-tight">Dashboard</h1>
        <p className="text-[rgb(var(--muted))] mt-1">
          Build branded launchers and deployment packages for your game servers.
        </p>
      </header>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <div className="text-3xl font-black text-brand">{projects.length}</div>
          <div className="text-sm text-[rgb(var(--muted))]">Projects</div>
        </Card>
        <Card>
          <div className="text-3xl font-black text-brand-accent">
            {Object.values(GAME_CATALOG).filter((g) => g.implemented).length}
          </div>
          <div className="text-sm text-[rgb(var(--muted))]">Supported games</div>
        </Card>
        <Card>
          <div className="text-3xl font-black">
            {activeProject ? <Badge tone="success">Active</Badge> : <Badge>None</Badge>}
          </div>
          <div className="text-sm text-[rgb(var(--muted))] mt-1">
            {activeProject?.meta.name ?? 'No project selected'}
          </div>
        </Card>
      </div>

      {projects.length === 0 ? (
        <EmptyState
          title="No projects yet"
          description="Create your first project to point ForgeLink at an existing dedicated-server folder and start building a launcher."
          action={
            <button className="btn-primary" onClick={() => navigate('/projects')}>
              + New Project
            </button>
          }
        />
      ) : (
        <Card title="Recent projects">
          <div className="space-y-2 mt-2">
            {projects.slice(0, 6).map((p) => (
              <button
                key={p.id}
                onClick={() => openProject(p.id)}
                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors text-left"
              >
                <div>
                  <div className="font-semibold">{p.meta.name}</div>
                  <div className="text-xs text-[rgb(var(--muted))]">
                    {GAME_CATALOG[p.meta.gameId].name} · v{p.meta.version}
                  </div>
                </div>
                <Badge tone={p.installation.valid ? 'success' : 'warning'}>
                  {p.installation.valid ? 'Server detected' : 'Setup needed'}
                </Badge>
              </button>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
