// Removes build output across all workspaces.
import { rmSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const targets = [
  'packages/shared/dist',
  'packages/adapters/dist',
  'packages/server-api/dist',
  'packages/builder/dist',
  'packages/builder/dist-electron',
  'packages/builder/dist-test',
  'packages/launcher/dist',
  'packages/launcher/dist-electron',
];

for (const t of targets) {
  const full = path.join(root, t);
  rmSync(full, { recursive: true, force: true });
  console.log(`Removed ${t}`);
}
