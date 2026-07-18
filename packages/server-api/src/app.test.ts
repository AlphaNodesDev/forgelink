import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import type { Server } from 'node:http';
import { buildApp, type BuiltApp } from './app.js';
import { loadConfig } from './config.js';
import { buildManifest, sha256 } from '@forgelink/shared';

/**
 * End-to-end API test: boot the real Express app against a temp SQLite db,
 * publish content with an API key, then read it back through the public routes.
 */
let server: Server;
let built: BuiltApp;
let baseUrl: string;
let dataDir: string;
let storageDir: string;
const API_KEY = 'test-key-abcdefghijklmnop';

before(async () => {
  dataDir = mkdtempSync(path.join(tmpdir(), 'fl-api-data-'));
  storageDir = mkdtempSync(path.join(tmpdir(), 'fl-api-store-'));
  const config = loadConfig({
    FORGELINK_DATA_DIR: dataDir,
    FORGELINK_STORAGE_DIR: storageDir,
    FORGELINK_API_KEYS: API_KEY,
    FORGELINK_JWT_SECRET: 'test-secret-value-32-characters!',
  } as NodeJS.ProcessEnv);
  built = buildApp(config);
  await new Promise<void>((resolve) => {
    server = built.app.listen(0, '127.0.0.1', resolve);
  });
  const addr = server.address();
  const port = typeof addr === 'object' && addr ? addr.port : 0;
  baseUrl = `http://127.0.0.1:${port}`;
});

after(async () => {
  await new Promise<void>((resolve) => server?.close(() => resolve()));
  built?.db.close(); // Release the SQLite file handle before removing temp dirs.
  rmSync(dataDir, { recursive: true, force: true });
  rmSync(storageDir, { recursive: true, force: true });
});

test('health endpoint responds', async () => {
  const res = await fetch(`${baseUrl}/healthz`);
  assert.equal(res.status, 200);
});

test('publish requires an API key', async () => {
  const res = await fetch(`${baseUrl}/api/admin/publish/server`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({}),
  });
  assert.equal(res.status, 401);
});

test('publish then read server, manifest and news', async () => {
  const serverId = 'srv-1';
  const publish = async (route: string, body: unknown): Promise<Response> =>
    fetch(`${baseUrl}${route}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': API_KEY },
      body: JSON.stringify(body),
    });

  // Publish server identity.
  let res = await publish('/api/admin/publish/server', {
    id: serverId,
    gameId: 'seven-days-to-die',
    name: 'Test Server',
    description: 'A test',
    server: {
      serverIp: '127.0.0.1',
      port: 443,
      gamePort: 26900,
      queryPort: 26900,
      region: 'NA',
      serverPassword: '',
      adminPassword: '',
      visibility: 'public',
      website: '',
      discord: '',
      rules: [],
    },
  });
  assert.equal(res.status, 200);

  // Publish a manifest.
  const manifest = buildManifest({
    gameId: 'seven-days-to-die',
    version: '1.0.0',
    files: [{ path: 'a.txt', sha256: sha256('a'), size: 1 }],
  });
  res = await publish('/api/admin/publish/manifest', { serverId, manifest });
  assert.equal(res.status, 200);

  // Publish news.
  res = await publish('/api/admin/publish/news', {
    serverId,
    news: [
      {
        id: 'n1',
        title: 'Launch day',
        body: 'We are live!',
        author: 'admin',
        publishedAt: new Date().toISOString(),
        pinned: true,
      },
    ],
  });
  assert.equal(res.status, 200);

  // Read back through public routes.
  const mods = (await (await fetch(`${baseUrl}/api/mods`)).json()) as { files: unknown[] };
  assert.equal(mods.files.length, 1);

  const news = (await (await fetch(`${baseUrl}/api/news`)).json()) as {
    news: { title: string }[];
  };
  assert.equal(news.news[0].title, 'Launch day');

  const status = (await (await fetch(`${baseUrl}/api/status`)).json()) as { online: boolean };
  assert.equal(typeof status.online, 'boolean');
});

test('analytics events are accepted', async () => {
  const res = await fetch(`${baseUrl}/api/analytics/event`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ serverId: 'srv-1', eventType: 'download', clientId: 'client-xyz' }),
  });
  assert.equal(res.status, 200);
});
