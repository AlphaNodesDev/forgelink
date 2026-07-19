import type { Manifest, NewsEntry, ServerStatus, UpdateDescriptor } from '@forgelink/shared';

/**
 * Typed client for the ForgeLink Server API. The launcher only ever talks to
 * the API through this class. All methods fail soft where the UI can tolerate
 * it (status/news) and throw where correctness matters (manifest/version).
 */
export class ApiClient {
  constructor(
    private readonly apiBase: string,
    private readonly clientId: string,
  ) {}

  private url(path: string): string {
    return `${this.apiBase}${path}`;
  }

  async getStatus(): Promise<ServerStatus | null> {
    try {
      const res = await fetch(this.url('/api/status'));
      if (!res.ok) return null;
      return (await res.json()) as ServerStatus;
    } catch {
      return null;
    }
  }

  async getNews(): Promise<NewsEntry[]> {
    try {
      const res = await fetch(this.url('/api/news'));
      if (!res.ok) return [];
      const data = (await res.json()) as { news: NewsEntry[] };
      return data.news ?? [];
    } catch {
      return [];
    }
  }

  /**
   * Fetch the server-published branding + auto-join config. This lets a generic
   * launcher be re-branded from the server without shipping a new build. Returns
   * null if the server hasn't published one.
   */
  async getRemoteConfig(): Promise<Record<string, unknown> | null> {
    try {
      const res = await fetch(this.url('/api/config'));
      if (!res.ok) return null;
      return (await res.json()) as Record<string, unknown>;
    } catch {
      return null;
    }
  }

  async getManifest(): Promise<Manifest> {
    const res = await fetch(this.url('/api/mods'));
    if (!res.ok) throw new Error(`Failed to fetch manifest: ${res.status}`);
    return (await res.json()) as Manifest;
  }

  async getLatestVersion(): Promise<UpdateDescriptor | null> {
    try {
      const res = await fetch(this.url('/api/version'));
      if (!res.ok) return null;
      return (await res.json()) as UpdateDescriptor;
    } catch {
      return null;
    }
  }

  /** Build a resumable download URL for a mod file. */
  modDownloadUrl(relativePath: string): string {
    return this.url(`/api/download?type=mod&path=${encodeURIComponent(relativePath)}`);
  }

  /** Fire-and-forget analytics event. Never throws. */
  async track(
    serverId: string,
    eventType: 'download' | 'update_success' | 'update_fail' | 'mod_download' | 'crash' | 'launch',
    extra: { bytes?: number; metadata?: Record<string, unknown> } = {},
  ): Promise<void> {
    try {
      await fetch(this.url('/api/analytics/event'), {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-client-id': this.clientId },
        body: JSON.stringify({ serverId, eventType, clientId: this.clientId, ...extra }),
      });
    } catch {
      /* analytics best-effort */
    }
  }
}
