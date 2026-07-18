import React from 'react';
import { useProjects } from '../state/ProjectContext';
import { RequireProject } from '../components/RequireProject';
import { Card, Field, TextInput, Toggle, Badge } from '../components/ui';
import type { Project, ReverseProxy } from '@forgelink/shared';

/**
 * Deployment page = Domain Configuration from the spec. Drives which Linux
 * deployment artifacts (Nginx/Apache, Certbot, systemd, PM2, firewall) the
 * build pipeline generates.
 */
export function Deployment(): JSX.Element {
  return <RequireProject>{(project) => <DeploymentInner project={project} />}</RequireProject>;
}

function DeploymentInner({ project }: { project: Project }): JSX.Element {
  const { updateActive } = useProjects();
  const d = project.domain;

  const proxies: { value: ReverseProxy; label: string }[] = [
    { value: 'nginx', label: 'Nginx' },
    { value: 'apache', label: 'Apache' },
    { value: 'none', label: 'None' },
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      <header className="animate-fade-in">
        <h1 className="text-3xl font-black tracking-tight">Deployment</h1>
        <p className="text-[rgb(var(--muted))] mt-1">
          Configure your domain and reverse proxy. ForgeLink generates the full Linux deployment package.
        </p>
      </header>

      <Card title="Domain">
        <Toggle
          checked={d.ownsDomain}
          onChange={(v) => updateActive((draft) => void (draft.domain.ownsDomain = v))}
          label="I own a domain for this server"
        />
        {d.ownsDomain && (
          <div className="grid grid-cols-2 gap-x-6 mt-4">
            <Field label="Domain">
              <TextInput value={d.domain} onChange={(e) => updateActive((draft) => void (draft.domain.domain = e.target.value))} placeholder="example.com" />
            </Field>
            <Field label="Subdomain (optional)">
              <TextInput value={d.subdomain} onChange={(e) => updateActive((draft) => void (draft.domain.subdomain = e.target.value))} placeholder="play" />
            </Field>
            <Field label="Certbot Email" hint="Used for Let's Encrypt registration and renewal notices.">
              <TextInput value={d.certbotEmail} onChange={(e) => updateActive((draft) => void (draft.domain.certbotEmail = e.target.value))} placeholder="admin@example.com" />
            </Field>
          </div>
        )}
      </Card>

      <Card title="Reverse Proxy & TLS">
        <Field label="Reverse Proxy">
          <div className="flex gap-2">
            {proxies.map((p) => (
              <button
                key={p.value}
                onClick={() => updateActive((draft) => void (draft.domain.reverseProxy = p.value))}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  d.reverseProxy === p.value ? 'bg-brand text-white' : 'bg-white/5 hover:bg-white/10'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </Field>
        <Toggle
          checked={d.useHttps}
          onChange={(v) => updateActive((draft) => void (draft.domain.useHttps = v))}
          label="Use HTTPS (generates Certbot script)"
        />
      </Card>

      <Card title="Generated artifacts" subtitle="These files are produced when you Build.">
        <div className="flex flex-wrap gap-2">
          <Badge>ecosystem.config.cjs (PM2)</Badge>
          <Badge>systemd service</Badge>
          {d.reverseProxy === 'nginx' && <Badge>nginx.conf</Badge>}
          {d.reverseProxy === 'apache' && <Badge>apache.conf</Badge>}
          {d.useHttps && <Badge>certbot.sh</Badge>}
          <Badge>firewall.sh</Badge>
          <Badge>deploy.sh</Badge>
        </div>
      </Card>
    </div>
  );
}
