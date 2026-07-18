import React, { useEffect, useState } from 'react';
import { RequireProject } from '../components/RequireProject';
import { Card, Badge, EmptyState } from '../components/ui';
import type { DetectionResult, Project } from '@forgelink/shared';

/**
 * Mods page. Shows what the game adapter finds in the installation's mods dir.
 * The actual hashing + manifest generation happens during Build; here we give
 * the owner a preview and a count.
 */
export function Mods(): JSX.Element {
  return <RequireProject>{(project) => <ModsInner project={project} />}</RequireProject>;
}

function ModsInner({ project }: { project: Project }): JSX.Element {
  const [detection, setDetection] = useState<DetectionResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!project.installation.path) return;
    setLoading(true);
    window.forgelink
      .detectServer(project.meta.gameId, project.installation.path)
      .then(setDetection)
      .finally(() => setLoading(false));
  }, [project.installation.path, project.meta.gameId]);

  if (!project.installation.valid) {
    return (
      <EmptyState
        title="No server detected"
        description="Detect your server folder on the Launcher & Server page first, then your mods will appear here."
      />
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <header className="animate-fade-in">
        <h1 className="text-3xl font-black tracking-tight">Mods</h1>
        <p className="text-[rgb(var(--muted))] mt-1">
          The launcher synchronizes these files using SHA-256 checksums, downloading only what changed.
        </p>
      </header>

      <Card title="Mod directory">
        <div className="flex items-center gap-3">
          <Badge tone={detection?.modsPath ? 'success' : 'warning'}>
            {loading ? 'Scanning…' : detection?.modsPath ? 'Mods folder found' : 'No mods folder'}
          </Badge>
          {detection?.modsPath && (
            <span className="text-sm text-[rgb(var(--muted))] truncate">{detection.modsPath}</span>
          )}
        </div>
        <ul className="mt-4 space-y-1 text-sm text-[rgb(var(--muted))]">
          <li>• Files are hashed and written to <code>manifest.json</code> at build time.</li>
          <li>• The launcher downloads missing files, repairs corrupted ones, and deletes removed mods.</li>
          <li>• Downloads are resumable via HTTP range requests.</li>
        </ul>
      </Card>
    </div>
  );
}
