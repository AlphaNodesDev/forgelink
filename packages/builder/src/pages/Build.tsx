import React, { useEffect, useRef, useState } from 'react';
import { RequireProject } from '../components/RequireProject';
import { Card, Field, TextInput, Badge } from '../components/ui';
import type { Project } from '@forgelink/shared';
import type { BuildProgress } from '../../electron/ipc-contract';

/**
 * Build page. Runs the full pipeline (mods, deployment, website, installer,
 * launcher config) with a live progress log, then optionally Publishes to a
 * live Server API.
 */
export function Build(): JSX.Element {
  return <RequireProject>{(project) => <BuildInner project={project} />}</RequireProject>;
}

function BuildInner({ project }: { project: Project }): JSX.Element {
  const [progress, setProgress] = useState<BuildProgress | null>(null);
  const [log, setLog] = useState<string[]>([]);
  const [building, setBuilding] = useState(false);
  const [artifacts, setArtifacts] = useState<string[] | null>(null);
  const [apiBase, setApiBase] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [publishState, setPublishState] = useState<'idle' | 'publishing' | 'done' | 'error'>('idle');
  const [publishError, setPublishError] = useState<string | null>(null);
  const unsubRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    unsubRef.current = window.forgelink.onBuildProgress((p) => {
      setProgress(p);
      setLog((prev) => [...prev, `${p.percent}% — ${p.step}${p.detail ? ` (${p.detail})` : ''}`]);
    });
    return () => unsubRef.current?.();
  }, []);

  const run = async (): Promise<void> => {
    setBuilding(true);
    setLog([]);
    setArtifacts(null);
    try {
      const result = await window.forgelink.build(project.id);
      setArtifacts(result.artifacts);
    } catch (e) {
      setLog((prev) => [...prev, `ERROR: ${(e as Error).message}`]);
    } finally {
      setBuilding(false);
    }
  };

  const publish = async (): Promise<void> => {
    setPublishState('publishing');
    setPublishError(null);
    try {
      await window.forgelink.publish(project.id, apiBase, apiKey);
      setPublishState('done');
    } catch (e) {
      setPublishState('error');
      setPublishError((e as Error).message);
    }
  };

  const ready = project.installation.valid && project.server.serverIp;

  return (
    <div className="space-y-6 max-w-4xl">
      <header className="flex items-center justify-between animate-fade-in">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Build</h1>
          <p className="text-[rgb(var(--muted))] mt-1">Generate the launcher, installer, website and deployment package.</p>
        </div>
        <button className="btn-primary" onClick={run} disabled={building || !ready}>
          {building ? 'Building…' : '⚙ Build'}
        </button>
      </header>

      {!ready && (
        <Card>
          <p className="text-amber-400 text-sm">
            Detect a valid server and set a server IP before building.
          </p>
        </Card>
      )}

      {(building || progress) && (
        <Card title="Build progress">
          <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-brand to-brand-accent transition-all"
              style={{ width: `${progress?.percent ?? 0}%` }}
            />
          </div>
          <pre className="mt-4 text-xs font-mono bg-black/30 rounded-xl p-4 max-h-56 overflow-auto">
            {log.join('\n')}
          </pre>
        </Card>
      )}

      {artifacts && (
        <Card title="Output" subtitle={`${artifacts.length} artifacts generated.`}>
          <div className="flex flex-wrap gap-2 mb-4">
            {artifacts.slice(0, 40).map((a) => (
              <Badge key={a}>{a}</Badge>
            ))}
          </div>
          <button className="btn-ghost" onClick={() => window.forgelink.openOutput(project.id)}>
            Open output folder
          </button>
        </Card>
      )}

      <Card title="Publish" subtitle="Push server info, manifest and news to a live ForgeLink Server API.">
        <div className="grid grid-cols-2 gap-x-6">
          <Field label="API Base URL">
            <TextInput value={apiBase} onChange={(e) => setApiBase(e.target.value)} placeholder="https://play.example.com" />
          </Field>
          <Field label="API Key">
            <TextInput type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} />
          </Field>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn-primary" onClick={publish} disabled={publishState === 'publishing' || !apiBase || !apiKey}>
            {publishState === 'publishing' ? 'Publishing…' : 'Publish'}
          </button>
          {publishState === 'done' && <Badge tone="success">Published</Badge>}
          {publishState === 'error' && <Badge tone="danger">Failed</Badge>}
        </div>
        {publishError && <p className="text-rose-400 text-sm mt-2">{publishError}</p>}
      </Card>
    </div>
  );
}
