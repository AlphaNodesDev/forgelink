import { mkdirSync, readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import {
  projectSchema,
  brandingSchema,
  domainConfigSchema,
  securityConfigSchema,
  serverConfigSchema,
  serverInstallationSchema,
  generateSigningKeyPair,
  type Project,
  type ProjectMeta,
} from '@forgelink/shared';

/**
 * Persists ForgeLink projects to disk as JSON documents under a workspace dir.
 * Each project also gets an RSA signing keypair generated on creation; the
 * private key is stored beside the project and never leaves the owner's machine
 * unless they explicitly embed the public key in a launcher build.
 */
export class ProjectStore {
  constructor(private readonly workspaceDir: string) {
    mkdirSync(workspaceDir, { recursive: true });
  }

  private projectDir(id: string): string {
    return path.join(this.workspaceDir, id);
  }

  private projectFile(id: string): string {
    return path.join(this.projectDir(id), 'project.json');
  }

  /** Create a new project with sane defaults derived from the provided meta. */
  create(meta: ProjectMeta): Project {
    const id = randomUUID();
    const now = new Date().toISOString();
    const project: Project = projectSchema.parse({
      schemaVersion: 1,
      id,
      createdAt: now,
      updatedAt: now,
      meta,
      installation: serverInstallationSchema.parse({ path: '', valid: false }),
      server: serverConfigSchema.parse({ serverIp: '' }),
      domain: domainConfigSchema.parse({}),
      branding: brandingSchema.parse({}),
      security: securityConfigSchema.parse({}),
      database: 'sqlite',
      news: [],
    });

    const dir = this.projectDir(id);
    mkdirSync(dir, { recursive: true });

    // Generate and store the per-project signing keypair.
    const keys = generateSigningKeyPair();
    writeFileSync(path.join(dir, 'signing-private.pem'), keys.privateKey, { mode: 0o600 });
    writeFileSync(path.join(dir, 'signing-public.pem'), keys.publicKey);

    this.save(project);
    return project;
  }

  save(project: Project): Project {
    const validated = projectSchema.parse({ ...project, updatedAt: new Date().toISOString() });
    mkdirSync(this.projectDir(validated.id), { recursive: true });
    writeFileSync(this.projectFile(validated.id), JSON.stringify(validated, null, 2));
    return validated;
  }

  get(id: string): Project | null {
    const file = this.projectFile(id);
    if (!existsSync(file)) return null;
    return projectSchema.parse(JSON.parse(readFileSync(file, 'utf8')));
  }

  list(): Project[] {
    if (!existsSync(this.workspaceDir)) return [];
    const projects: Project[] = [];
    for (const entry of readdirSync(this.workspaceDir, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const file = this.projectFile(entry.name);
      if (existsSync(file)) {
        try {
          projects.push(projectSchema.parse(JSON.parse(readFileSync(file, 'utf8'))));
        } catch {
          /* skip corrupt project */
        }
      }
    }
    return projects.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }

  getPrivateKey(id: string): string {
    return readFileSync(path.join(this.projectDir(id), 'signing-private.pem'), 'utf8');
  }

  getPublicKey(id: string): string {
    return readFileSync(path.join(this.projectDir(id), 'signing-public.pem'), 'utf8');
  }

  outputDir(id: string): string {
    return path.join(this.projectDir(id), 'output');
  }
}
