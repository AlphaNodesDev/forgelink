import React, { useEffect, useState } from 'react';
import { useProjects } from '../state/ProjectContext';
import { Card, Badge } from '../components/ui';
import { GAME_CATALOG } from '@forgelink/shared';

/** Settings page: app-level info, supported games and theme reflection. */
export function Settings(): JSX.Element {
  const { theme } = useProjects();
  const [supported, setSupported] = useState<string[]>([]);

  useEffect(() => {
    window.forgelink.supportedGames().then(setSupported);
  }, []);

  return (
    <div className="space-y-6 max-w-3xl">
      <header className="animate-fade-in">
        <h1 className="text-3xl font-black tracking-tight">Settings</h1>
        <p className="text-[rgb(var(--muted))] mt-1">Application preferences and adapter status.</p>
      </header>

      <Card title="Appearance">
        <p className="text-sm text-[rgb(var(--muted))]">
          Current theme: <Badge>{theme}</Badge> — toggle from the sidebar. Per-project theme is set on the Branding page.
        </p>
      </Card>

      <Card title="Game adapters" subtitle="The plugin registry. New games appear here once an adapter is added — no rebuild of the rest of the app required.">
        <div className="space-y-2">
          {Object.values(GAME_CATALOG).map((g) => (
            <div key={g.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5">
              <div>
                <div className="font-medium">{g.name}</div>
                <div className="text-xs text-[rgb(var(--muted))]">{g.tagline}</div>
              </div>
              <Badge tone={supported.includes(g.id) ? 'success' : 'default'}>
                {supported.includes(g.id) ? 'Adapter active' : 'Planned'}
              </Badge>
            </div>
          ))}
        </div>
      </Card>

      <Card title="About">
        <p className="text-sm text-[rgb(var(--muted))]">
          ForgeLink Builder v1.0.0 — a launcher builder and deployment platform for game servers.
        </p>
      </Card>
    </div>
  );
}
