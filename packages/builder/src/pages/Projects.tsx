import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjects } from '../state/ProjectContext';
import { Card, Field, TextInput, TextArea, Badge } from '../components/ui';
import { GAME_CATALOG, GAME_IDS, type GameId, type ProjectMeta } from '@forgelink/shared';

/**
 * Projects page: list existing projects and create new ones. Games without a
 * working adapter are shown but disabled (spec: architecture must allow future
 * games without redesign — the UI already reflects the plugin registry).
 */
export function Projects(): JSX.Element {
  const { projects, refresh, selectProject } = useProjects();
  const navigate = useNavigate();
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<ProjectMeta>({
    name: '',
    gameId: 'seven-days-to-die',
    serverName: '',
    description: '',
    version: '1.0.0',
    owner: '',
  });
  const [error, setError] = useState<string | null>(null);

  const create = async (): Promise<void> => {
    setError(null);
    if (!form.name || !form.serverName || !form.owner) {
      setError('Project name, server name and owner are required.');
      return;
    }
    const project = await window.forgelink.createProject(form);
    await refresh();
    await selectProject(project.id);
    navigate('/launcher');
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <header className="flex items-center justify-between animate-fade-in">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Projects</h1>
          <p className="text-[rgb(var(--muted))] mt-1">Manage your launcher build projects.</p>
        </div>
        <button className="btn-primary" onClick={() => setCreating((v) => !v)}>
          {creating ? 'Cancel' : '+ New Project'}
        </button>
      </header>

      {creating && (
        <Card title="New Project" subtitle="Point ForgeLink at an existing dedicated-server later — first, name your project.">
          <div className="grid grid-cols-2 gap-x-6">
            <Field label="Project Name">
              <TextInput
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="My Awesome Server"
              />
            </Field>
            <Field label="Supported Game">
              <select
                className="field"
                value={form.gameId}
                onChange={(e) => setForm({ ...form, gameId: e.target.value as GameId })}
              >
                {GAME_IDS.map((id) => (
                  <option key={id} value={id} disabled={!GAME_CATALOG[id].implemented}>
                    {GAME_CATALOG[id].name}
                    {GAME_CATALOG[id].implemented ? '' : ' (coming soon)'}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Server Name">
              <TextInput
                value={form.serverName}
                onChange={(e) => setForm({ ...form, serverName: e.target.value })}
                placeholder="Apocalypse SMP"
              />
            </Field>
            <Field label="Version">
              <TextInput value={form.version} onChange={(e) => setForm({ ...form, version: e.target.value })} />
            </Field>
            <Field label="Owner">
              <TextInput
                value={form.owner}
                onChange={(e) => setForm({ ...form, owner: e.target.value })}
                placeholder="Your name or studio"
              />
            </Field>
            <div className="col-span-2">
              <Field label="Description">
                <TextArea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="A short description shown on the launcher and website."
                />
              </Field>
            </div>
          </div>
          {error && <p className="text-rose-400 text-sm mb-3">{error}</p>}
          <button className="btn-primary" onClick={create}>
            Create Project
          </button>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-4">
        {projects.map((p) => (
          <button
            key={p.id}
            onClick={async () => {
              await selectProject(p.id);
              navigate('/launcher');
            }}
            className="glass p-5 text-left hover:border-brand/40 transition-colors animate-fade-in"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="font-bold text-lg">{p.meta.name}</div>
                <div className="text-sm text-[rgb(var(--muted))]">{p.meta.serverName}</div>
              </div>
              <Badge tone={p.installation.valid ? 'success' : 'warning'}>
                {GAME_CATALOG[p.meta.gameId].name}
              </Badge>
            </div>
            <div className="text-xs text-[rgb(var(--muted))] mt-4">
              v{p.meta.version} · updated {new Date(p.updatedAt).toLocaleDateString()}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
