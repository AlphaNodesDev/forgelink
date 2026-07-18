import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { defaultRegistry } from './index.js';

/**
 * Adapter tests use a temporary fake server folder — no real game install
 * required — to validate detection and mod scanning behaviour.
 */

function makeFakeSevenDaysServer(): string {
  const dir = mkdtempSync(path.join(tmpdir(), 'fl-7dtd-'));
  writeFileSync(
    path.join(dir, 'serverconfig.xml'),
    `<?xml version="1.0"?>
<ServerSettings>
  <property name="ServerName" value="Test Horde" />
  <property name="ServerPort" value="26900" />
  <property name="ServerMaxPlayerCount" value="16" />
</ServerSettings>`,
  );
  const mods = path.join(dir, 'Mods', 'CoolMod');
  mkdirSync(mods, { recursive: true });
  writeFileSync(path.join(mods, 'ModInfo.xml'), '<xml/>');
  writeFileSync(path.join(mods, 'assets.bin'), Buffer.from([1, 2, 3, 4]));
  return dir;
}

test('7DTD adapter is registered', () => {
  assert.ok(defaultRegistry.has('seven-days-to-die'));
});

test('7DTD adapter detects a valid server folder', async () => {
  const dir = makeFakeSevenDaysServer();
  const adapter = defaultRegistry.get('seven-days-to-die');
  const result = await adapter.detect(dir);
  assert.equal(result.valid, true);
  assert.ok(result.modsPath);
});

test('7DTD adapter rejects an unrelated folder', async () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'fl-empty-'));
  const adapter = defaultRegistry.get('seven-days-to-die');
  const result = await adapter.detect(dir);
  assert.equal(result.valid, false);
  assert.ok(result.errors.length > 0);
});

test('7DTD adapter scans and hashes mods', async () => {
  const dir = makeFakeSevenDaysServer();
  const adapter = defaultRegistry.get('seven-days-to-die');
  const mods = await adapter.scanMods(dir);
  assert.equal(mods.length, 2);
  for (const m of mods) {
    assert.equal(m.sha256.length, 64);
    assert.ok(m.size >= 0);
  }
});

test('7DTD adapter reads serverconfig.xml into key/value', async () => {
  const dir = makeFakeSevenDaysServer();
  const adapter = defaultRegistry.get('seven-days-to-die');
  const cfg = await adapter.readServerConfig(dir);
  assert.equal(cfg.ServerName, 'Test Horde');
  assert.equal(cfg.ServerMaxPlayerCount, '16');
});

test('7DTD launch plan builds a steam connect URI with the game port', () => {
  const adapter = defaultRegistry.get('seven-days-to-die');
  const plan = adapter.buildLaunchPlan({
    installPath: '',
    server: {
      serverIp: '203.0.113.5',
      port: 443,
      gamePort: 26900,
      queryPort: 26900,
      region: 'NA',
      serverPassword: 'secret',
      adminPassword: '',
      visibility: 'public',
      website: '',
      discord: '',
      rules: [],
    },
  });
  assert.ok(plan.useShell);
  assert.match(plan.target, /203\.0\.113\.5:26900/);
});
