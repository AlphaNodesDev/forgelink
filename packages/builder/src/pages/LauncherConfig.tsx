import React, { useState } from 'react';
import { useProjects } from '../state/ProjectContext';
import { RequireProject } from '../components/RequireProject';
import { Card, Field, TextInput, TextArea, Badge } from '../components/ui';
import type { DetectionResult, Project } from '@forgelink/shared';

/**
 * Launcher configuration page. Combines two spec sections:
 *   - Server Discovery: browse to an existing dedicated-server folder and detect
 *     it via the game adapter (never installs/downloads a server).
 *   - Server Configuration: edit connection info, visibility, links, rules.
 */
export function LauncherConfig(): JSX.Element {
  return <RequireProject>{(project) => <LauncherConfigInner project={project} />}</RequireProject>;
}

function LauncherConfigInner({ project }: { project: Project }): JSX.Element {
  const { updateActive } = useProjects();
  const [detecting, setDetecting] = useState(false);
  const [detection, setDetection] = useState<DetectionResult | null>(null);

  const browseAndDetect = async (): Promise<void> => {
    const folder = await window.forgelink.pickFolder();
    if (!folder) return;
    setDetecting(true);
    try {
      const result = await window.forgelink.detectServer(project.meta.gameId, folder);
      setDetection(result);
      await updateActive((draft) => {
        draft.installation.path = folder;
        draft.installation.valid = result.valid;
        draft.installation.detectedVersion = result.detectedVersion ?? '';
        if (result.modsPath) draft.installation.modsPath = 'Mods';
      });
      // If detection succeeded, pre-fill server config from serverconfig.xml.
      if (result.valid) {
        const cfg = await window.forgelink.readServerConfig(project.meta.gameId, folder);
        await updateActive((draft) => {
          if (cfg.ServerPort) draft.server.gamePort = Number(cfg.ServerPort) || draft.server.gamePort;
          if (cfg.ServerName && !draft.meta.serverName) draft.meta.serverName = cfg.ServerName;
          if (cfg.ServerPassword) draft.server.serverPassword = cfg.ServerPassword;
        });
      }
    } finally {
      setDetecting(false);
    }
  };

  const s = project.server;

  return (
    <div className="space-y-6 max-w-4xl">
      <header className="animate-fade-in">
        <h1 className="text-3xl font-black tracking-tight">Launcher & Server</h1>
        <p className="text-[rgb(var(--muted))] mt-1">
          Point at your existing dedicated server, then configure how the launcher connects.
        </p>
      </header>

      <Card title="Server Discovery" subtitle="ForgeLink never installs or downloads a server — it uses your existing installation.">
        <div className="flex items-center gap-3">
          <button className="btn-primary" onClick={browseAndDetect} disabled={detecting}>
            {detecting ? 'Detecting…' : 'Browse to Existing Server Folder'}
          </button>
          {project.installation.path && (
            <span className="text-sm text-[rgb(var(--muted))] truncate">{project.installation.path}</span>
          )}
        </div>

        {detection && (
          <div className="mt-4 space-y-2">
            <div className="flex items-center gap-2">
              <Badge tone={detection.valid ? 'success' : 'danger'}>
                {detection.valid ? 'Valid server detected' : 'Invalid folder'}
              </Badge>
              {detection.detectedVersion && <Badge>v{detection.detectedVersion}</Badge>}
            </div>
            {detection.notes.map((n, i) => (
              <p key={i} className="text-sm text-[rgb(var(--muted))]">
                ✓ {n}
              </p>
            ))}
            {detection.errors.map((e, i) => (
              <p key={i} className="text-sm text-rose-400">
                ✗ {e}
              </p>
            ))}
          </div>
        )}
      </Card>

      <Card title="Server Configuration">
        <div className="grid grid-cols-2 gap-x-6">
          <Field label="Server IP / Hostname">
            <TextInput value={s.serverIp} onChange={(e) => updateActive((d) => void (d.server.serverIp = e.target.value))} placeholder="play.example.com" />
          </Field>
          <Field label="Region">
            <TextInput value={s.region} onChange={(e) => updateActive((d) => void (d.server.region = e.target.value))} />
          </Field>
          <Field label="API / Web Port">
            <TextInput type="number" value={s.port} onChange={(e) => updateActive((d) => void (d.server.port = Number(e.target.value)))} />
          </Field>
          <Field label="Game Port">
            <TextInput type="number" value={s.gamePort} onChange={(e) => updateActive((d) => void (d.server.gamePort = Number(e.target.value)))} />
          </Field>
          <Field label="Query Port">
            <TextInput type="number" value={s.queryPort} onChange={(e) => updateActive((d) => void (d.server.queryPort = Number(e.target.value)))} />
          </Field>
          <Field label="Visibility">
            <select className="field" value={s.visibility} onChange={(e) => updateActive((d) => void (d.server.visibility = e.target.value as 'public' | 'private'))}>
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
          </Field>
          <Field label="Server Password" hint="Sent automatically on auto-join.">
            <TextInput type="password" value={s.serverPassword} onChange={(e) => updateActive((d) => void (d.server.serverPassword = e.target.value))} />
          </Field>
          <Field label="Admin Password" hint="Encrypted in the deployment package.">
            <TextInput type="password" value={s.adminPassword} onChange={(e) => updateActive((d) => void (d.server.adminPassword = e.target.value))} />
          </Field>
          <Field label="Website">
            <TextInput value={s.website} onChange={(e) => updateActive((d) => void (d.server.website = e.target.value))} placeholder="https://" />
          </Field>
          <Field label="Discord">
            <TextInput value={s.discord} onChange={(e) => updateActive((d) => void (d.server.discord = e.target.value))} placeholder="https://discord.gg/" />
          </Field>
          <div className="col-span-2">
            <Field label="Server Rules (one per line)">
              <TextArea
                value={s.rules.join('\n')}
                onChange={(e) => updateActive((d) => void (d.server.rules = e.target.value.split('\n').filter(Boolean)))}
              />
            </Field>
          </div>
        </div>
      </Card>
    </div>
  );
}
