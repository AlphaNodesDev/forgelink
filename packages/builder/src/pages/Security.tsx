import React from 'react';
import { useProjects } from '../state/ProjectContext';
import { RequireProject } from '../components/RequireProject';
import { Card, Field, TextInput, Toggle } from '../components/ui';
import type { Project } from '@forgelink/shared';

/** Security page: toggles that flow into the generated distribution + API. */
export function Security(): JSX.Element {
  return <RequireProject>{(project) => <SecurityInner project={project} />}</RequireProject>;
}

function SecurityInner({ project }: { project: Project }): JSX.Element {
  const { updateActive } = useProjects();
  const sec = project.security;

  return (
    <div className="space-y-6 max-w-3xl">
      <header className="animate-fade-in">
        <h1 className="text-3xl font-black tracking-tight">Security</h1>
        <p className="text-[rgb(var(--muted))] mt-1">
          Harden the launcher, API and distribution. Signatures use a per-project RSA key.
        </p>
      </header>

      <Card title="Transport & Auth">
        <div className="space-y-4">
          <Toggle checked={sec.enforceHttps} onChange={(v) => updateActive((d) => void (d.security.enforceHttps = v))} label="Enforce HTTPS" />
          <Toggle checked={sec.jwtEnabled} onChange={(v) => updateActive((d) => void (d.security.jwtEnabled = v))} label="Enable JWT sessions" />
          <Toggle checked={sec.apiKeyEnabled} onChange={(v) => updateActive((d) => void (d.security.apiKeyEnabled = v))} label="Require API keys for publishing" />
        </div>
        <Field label="Rate limit (requests / minute)">
          <TextInput
            type="number"
            value={sec.rateLimitPerMinute}
            onChange={(e) => updateActive((d) => void (d.security.rateLimitPerMinute = Number(e.target.value)))}
          />
        </Field>
      </Card>

      <Card title="Integrity">
        <div className="space-y-4">
          <Toggle checked={sec.verifyChecksums} onChange={(v) => updateActive((d) => void (d.security.verifyChecksums = v))} label="Verify file checksums (SHA-256)" />
          <Toggle checked={sec.verifySignatures} onChange={(v) => updateActive((d) => void (d.security.verifySignatures = v))} label="Verify digital signatures on manifest & updates" />
          <Toggle checked={sec.encryptConfig} onChange={(v) => updateActive((d) => void (d.security.encryptConfig = v))} label="Encrypt sensitive config files (AES-256-GCM)" />
        </div>
      </Card>
    </div>
  );
}
