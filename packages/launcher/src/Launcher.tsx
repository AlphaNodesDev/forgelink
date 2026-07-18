import React, { useCallback, useEffect, useState } from 'react';
import type { NewsEntry, ServerStatus } from '@forgelink/shared';
import type { LauncherConfig } from '../electron/services/launcher-config';
import type { SyncProgress } from '../electron/services/mod-sync';

/**
 * The ForgeLink Launcher UI. A single, polished screen showing server status,
 * player count, ping, news/changelog, and the primary actions: Play (syncs then
 * launches + auto-joins), Repair (full re-verify) and Update (self-update).
 */

type Phase = 'idle' | 'checking' | 'syncing' | 'updating' | 'ready' | 'playing' | 'error';

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  if (n < 1024 * 1024 * 1024) return `${(n / 1024 / 1024).toFixed(1)} MB`;
  return `${(n / 1024 / 1024 / 1024).toFixed(2)} GB`;
}

export function Launcher(): JSX.Element {
  const [config, setConfig] = useState<LauncherConfig | null>(null);
  const [status, setStatus] = useState<ServerStatus | null>(null);
  const [news, setNews] = useState<NewsEntry[]>([]);
  const [phase, setPhase] = useState<Phase>('checking');
  const [progress, setProgress] = useState<SyncProgress | null>(null);
  const [message, setMessage] = useState<string>('Starting up…');
  const [updateAvailable, setUpdateAvailable] = useState(false);

  // Apply branding colors from config.
  useEffect(() => {
    if (!config) return;
    const root = document.documentElement;
    const hexToRgb = (hex: string): string => {
      const n = parseInt(hex.replace('#', ''), 16);
      return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`;
    };
    root.style.setProperty('--brand-primary', hexToRgb(config.branding.primaryColor));
    root.style.setProperty('--brand-accent', hexToRgb(config.branding.accentColor));
  }, [config]);

  const refresh = useCallback(async () => {
    const [s, n] = await Promise.all([window.launcher.getStatus(), window.launcher.getNews()]);
    setStatus(s);
    setNews(n);
  }, []);

  // Boot sequence: load config, check for updates, refresh status/news.
  useEffect(() => {
    const unsub = window.launcher.onSyncProgress((p) => setProgress(p));
    void (async () => {
      const cfg = await window.launcher.getConfig();
      setConfig(cfg);
      await refresh();
      const upd = await window.launcher.checkUpdate();
      setUpdateAvailable(upd.updateAvailable);
      setPhase('ready');
      setMessage(upd.updateAvailable ? `Update available: v${upd.version}` : 'Ready to play');
    })();
    const interval = setInterval(refresh, 30_000);
    return () => {
      unsub();
      clearInterval(interval);
    };
  }, [refresh]);

  const runSync = async (repair: boolean): Promise<boolean> => {
    setPhase('syncing');
    setMessage(repair ? 'Repairing files…' : 'Synchronizing mods…');
    try {
      const result = await window.launcher.sync(repair);
      setMessage(
        `Sync complete — ${result.downloaded} downloaded, ${result.deleted} removed, ${result.unchanged} unchanged.`,
      );
      setPhase('ready');
      setProgress(null);
      return true;
    } catch (e) {
      setPhase('error');
      setMessage(`Sync failed: ${(e as Error).message}`);
      return false;
    }
  };

  const play = async (): Promise<void> => {
    const ok = await runSync(false);
    if (!ok) return;
    setPhase('playing');
    setMessage('Launching game…');
    try {
      const result = await window.launcher.play();
      setMessage(result.description);
      setTimeout(() => setPhase('ready'), 4000);
    } catch (e) {
      setPhase('error');
      setMessage(`Launch failed: ${(e as Error).message}`);
    }
  };

  const applyUpdate = async (): Promise<void> => {
    setPhase('updating');
    setMessage('Downloading update…');
    await window.launcher.applyUpdate();
  };

  if (!config) {
    return (
      <div className="h-screen flex items-center justify-center text-white/60">Loading…</div>
    );
  }

  const busy = phase === 'syncing' || phase === 'updating' || phase === 'playing' || phase === 'checking';
  const bg = config.branding.backgroundImage;

  return (
    <div
      className="h-screen w-screen flex flex-col text-white relative"
      style={
        bg
          ? { backgroundImage: `url('${bg}')`, backgroundSize: 'cover', backgroundPosition: 'center' }
          : { background: 'radial-gradient(circle at 30% 0%, rgba(109,40,217,0.35), transparent 55%), #0b0b12' }
      }
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" />

      {/* Header */}
      <header className="relative flex items-center justify-between px-8 py-6">
        <div className="flex items-center gap-4">
          {config.branding.serverLogo && (
            <img src={config.branding.serverLogo} alt="logo" className="h-12 w-12 rounded-xl object-cover" />
          )}
          <div>
            <h1 className="text-2xl font-black tracking-tight">{config.serverName}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span
                className={`w-2.5 h-2.5 rounded-full ${status?.online ? 'bg-emerald-400 animate-pulse2' : 'bg-rose-500'}`}
              />
              <span className="text-sm text-white/70">{status?.online ? 'Online' : 'Offline'}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {config.autoJoin && (
            <button className="chip" onClick={() => void refresh()}>
              ↻ Refresh
            </button>
          )}
        </div>
      </header>

      {/* Stats */}
      <div className="relative px-8 flex gap-3">
        <div className="glass px-5 py-3">
          <div className="text-xl font-bold">
            {status ? `${status.playersOnline} / ${status.playersMax}` : '—'}
          </div>
          <div className="text-xs text-white/60">Players</div>
        </div>
        <div className="glass px-5 py-3">
          <div className="text-xl font-bold">{status?.pingMs != null ? `${status.pingMs} ms` : '—'}</div>
          <div className="text-xs text-white/60">Ping</div>
        </div>
        <div className="glass px-5 py-3">
          <div className="text-xl font-bold">{config.autoJoin.serverIp}:{config.autoJoin.gamePort}</div>
          <div className="text-xs text-white/60">Address</div>
        </div>
      </div>

      {/* News */}
      <main className="relative flex-1 px-8 py-6 overflow-hidden">
        <h2 className="text-lg font-bold mb-3">Latest News</h2>
        <div className="space-y-3 overflow-y-auto h-full pr-2 pb-24">
          {news.length === 0 && <p className="text-white/50 text-sm">No news yet.</p>}
          {news.map((n) => (
            <article key={n.id} className="glass p-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{n.title}</h3>
                <time className="text-xs text-white/50">{new Date(n.publishedAt).toLocaleDateString()}</time>
              </div>
              <p className="text-sm text-white/70 mt-1 whitespace-pre-wrap">{n.body}</p>
            </article>
          ))}
        </div>
      </main>

      {/* Footer / action bar */}
      <footer className="relative px-8 py-5 border-t border-white/10 bg-black/40 backdrop-blur-xl">
        {progress && phase === 'syncing' && (
          <div className="mb-3">
            <div className="flex justify-between text-xs text-white/60 mb-1">
              <span>
                {progress.phase === 'download'
                  ? `Downloading ${progress.file ?? ''}`
                  : progress.phase}
              </span>
              <span>
                {formatBytes(progress.bytesCompleted)} / {formatBytes(progress.bytesTotal)}
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-brand to-brand-accent transition-all"
                style={{
                  width: `${progress.bytesTotal ? (progress.bytesCompleted / progress.bytesTotal) * 100 : 0}%`,
                }}
              />
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {config.website && (
              <button className="chip" onClick={() => window.launcher.openExternal(config.website)}>
                Website
              </button>
            )}
            {config.discord && (
              <button className="chip" onClick={() => window.launcher.openExternal(config.discord)}>
                Discord
              </button>
            )}
            <button className="chip" disabled={busy} onClick={() => void runSync(true)}>
              🛠 Repair
            </button>
            {updateAvailable && (
              <button className="chip" disabled={busy} onClick={() => void applyUpdate()}>
                ⬆ Update
              </button>
            )}
          </div>

          <div className="flex items-center gap-4">
            <span className={`text-sm ${phase === 'error' ? 'text-rose-400' : 'text-white/70'}`}>{message}</span>
            <button className="play-btn" disabled={busy || !status?.online} onClick={() => void play()}>
              {phase === 'syncing' ? 'Syncing…' : phase === 'playing' ? 'Launching…' : '▶ Play'}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
