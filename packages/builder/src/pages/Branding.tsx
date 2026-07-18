import React from 'react';
import { useProjects } from '../state/ProjectContext';
import { RequireProject } from '../components/RequireProject';
import { Card, Field, TextInput, TextArea } from '../components/ui';
import type { Branding as BrandingType, Project } from '@forgelink/shared';

/** Branding page: asset uploads, colors, fonts, theme and custom CSS. */
export function Branding(): JSX.Element {
  return <RequireProject>{(project) => <BrandingInner project={project} />}</RequireProject>;
}

const ASSET_FIELDS: { key: keyof BrandingType; label: string }[] = [
  { key: 'launcherIcon', label: 'Launcher Icon' },
  { key: 'backgroundImage', label: 'Background Image' },
  { key: 'banner', label: 'Banner' },
  { key: 'serverLogo', label: 'Server Logo' },
  { key: 'splashScreen', label: 'Splash Screen' },
];

function BrandingInner({ project }: { project: Project }): JSX.Element {
  const { updateActive, setTheme } = useProjects();
  const b = project.branding;

  const pickAsset = async (key: keyof BrandingType): Promise<void> => {
    const file = await window.forgelink.pickImage();
    if (file) await updateActive((draft) => void ((draft.branding[key] as string) = file));
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <header className="animate-fade-in">
        <h1 className="text-3xl font-black tracking-tight">Branding</h1>
        <p className="text-[rgb(var(--muted))] mt-1">Make the launcher and website feel like your server.</p>
      </header>

      <Card title="Assets">
        <div className="grid grid-cols-2 gap-4">
          {ASSET_FIELDS.map((f) => (
            <div key={f.key} className="glass-light p-4 flex items-center justify-between">
              <div className="min-w-0">
                <div className="font-medium text-sm">{f.label}</div>
                <div className="text-xs text-[rgb(var(--muted))] truncate">
                  {(b[f.key] as string) || 'Not set'}
                </div>
              </div>
              <button className="btn-ghost text-sm" onClick={() => pickAsset(f.key)}>
                Upload
              </button>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Theme">
        <div className="grid grid-cols-2 gap-x-6">
          <Field label="Primary Color">
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={b.primaryColor}
                onChange={(e) => updateActive((d) => void (d.branding.primaryColor = e.target.value))}
                className="w-12 h-10 rounded-lg bg-transparent cursor-pointer"
              />
              <TextInput value={b.primaryColor} onChange={(e) => updateActive((d) => void (d.branding.primaryColor = e.target.value))} />
            </div>
          </Field>
          <Field label="Accent Color">
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={b.accentColor}
                onChange={(e) => updateActive((d) => void (d.branding.accentColor = e.target.value))}
                className="w-12 h-10 rounded-lg bg-transparent cursor-pointer"
              />
              <TextInput value={b.accentColor} onChange={(e) => updateActive((d) => void (d.branding.accentColor = e.target.value))} />
            </div>
          </Field>
          <Field label="Font Family">
            <TextInput value={b.fontFamily} onChange={(e) => updateActive((d) => void (d.branding.fontFamily = e.target.value))} />
          </Field>
          <Field label="Theme Mode">
            <select
              className="field"
              value={b.themeMode}
              onChange={(e) => {
                const mode = e.target.value as 'dark' | 'light';
                updateActive((d) => void (d.branding.themeMode = mode));
                setTheme(mode);
              }}
            >
              <option value="dark">Dark</option>
              <option value="light">Light</option>
            </select>
          </Field>
        </div>
        <Field label="Custom CSS" hint="Injected into the launcher and website for advanced theming.">
          <TextArea value={b.customCss} onChange={(e) => updateActive((d) => void (d.branding.customCss = e.target.value))} placeholder=":root { /* ... */ }" />
        </Field>
      </Card>
    </div>
  );
}
