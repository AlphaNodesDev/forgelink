// Copies non-TS runtime assets (SQL schema) into dist so the compiled server can
// read them at runtime. Run automatically after `tsc` in the build script.
import { copyFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const src = path.join(root, '..', 'src', 'db', 'schema.sql');
const destDir = path.join(root, '..', 'dist', 'db');
mkdirSync(destDir, { recursive: true });
copyFileSync(src, path.join(destDir, 'schema.sql'));
console.log('Copied schema.sql to dist/db');
