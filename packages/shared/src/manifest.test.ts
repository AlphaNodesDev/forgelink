import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildManifest, diffManifest, verifyManifest } from './manifest.js';
import { generateSigningKeyPair, sha256 } from './crypto.js';
import { encryptConfig, decryptConfig } from './config-crypto.js';

test('buildManifest sorts files and totals size', () => {
  const m = buildManifest({
    gameId: 'seven-days-to-die',
    version: '1.0.0',
    files: [
      { path: 'b.txt', sha256: sha256('b'), size: 1 },
      { path: 'a.txt', sha256: sha256('a'), size: 2 },
    ],
  });
  assert.equal(m.files[0].path, 'a.txt');
  assert.equal(m.totalSize, 3);
});

test('signed manifest verifies with its public key and fails with a wrong key', () => {
  const keys = generateSigningKeyPair();
  const other = generateSigningKeyPair();
  const m = buildManifest({
    gameId: 'minecraft',
    version: '2.0.0',
    files: [{ path: 'mod.jar', sha256: sha256('x'), size: 10 }],
    privateKeyPem: keys.privateKey,
  });
  assert.ok(m.signature);
  assert.equal(verifyManifest(m, keys.publicKey), true);
  assert.equal(verifyManifest(m, other.publicKey), false);
});

test('diffManifest identifies downloads, deletes and unchanged files', () => {
  const remote = buildManifest({
    gameId: 'seven-days-to-die',
    version: '1.0.0',
    files: [
      { path: 'keep.txt', sha256: sha256('keep'), size: 4 },
      { path: 'new.txt', sha256: sha256('new'), size: 3 },
    ],
  });
  const local = new Map<string, string>([
    ['keep.txt', sha256('keep')],
    ['old.txt', sha256('old')],
  ]);
  const diff = diffManifest(remote, local);
  assert.deepEqual(
    diff.toDownload.map((f) => f.path),
    ['new.txt'],
  );
  assert.deepEqual(diff.toDelete, ['old.txt']);
  assert.deepEqual(
    diff.unchanged.map((f) => f.path),
    ['keep.txt'],
  );
  assert.equal(diff.downloadSize, 3);
});

test('encryptConfig round-trips and rejects wrong passphrase', () => {
  const envelope = encryptConfig(JSON.stringify({ secret: 42 }), 'hunter2');
  assert.equal(decryptConfig(envelope, 'hunter2'), '{"secret":42}');
  assert.throws(() => decryptConfig(envelope, 'wrong'));
});
