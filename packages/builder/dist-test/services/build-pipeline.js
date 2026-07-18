import { mkdirSync, writeFileSync, rmSync, existsSync } from 'node:fs';
import path from 'node:path';
import { buildManifest, createLogger, encryptConfig, } from '@forgelink/shared';
import { defaultRegistry } from '@forgelink/adapters';
import { generateDeploymentBundle, projectSlug } from './deployment.js';
import { generateWebsite } from './website.js';
import { generateNsisInstaller, generateElectronBuilderConfig } from './installer.js';
export class BuildPipeline {
    store;
    logger = createLogger('builder:build');
    constructor(store) {
        this.store = store;
    }
    async run(project, report) {
        const outputDir = this.store.outputDir(project.id);
        const artifacts = [];
        // Clean previous output.
        if (existsSync(outputDir))
            rmSync(outputDir, { recursive: true, force: true });
        mkdirSync(outputDir, { recursive: true });
        const write = (relative, content) => {
            const full = path.join(outputDir, relative);
            mkdirSync(path.dirname(full), { recursive: true });
            writeFileSync(full, content);
            artifacts.push(relative);
        };
        // 1. Scan mods via the game adapter and build a signed manifest.
        report({ step: 'Scanning mods', percent: 10 });
        const adapter = defaultRegistry.get(project.meta.gameId);
        const files = project.installation.valid
            ? await adapter.scanMods(project.installation.path)
            : [];
        const privateKey = project.security.verifySignatures ? this.store.getPrivateKey(project.id) : undefined;
        const manifest = buildManifest({
            gameId: project.meta.gameId,
            version: project.meta.version,
            files,
            privateKeyPem: privateKey,
        });
        write('manifest.json', JSON.stringify(manifest, null, 2));
        this.logger.info('Manifest built', { files: files.length, totalSize: manifest.totalSize });
        // 2. Deployment package.
        report({ step: 'Generating deployment package', percent: 35 });
        const deployment = generateDeploymentBundle(project);
        for (const [name, content] of Object.entries(deployment)) {
            write(path.join('deployment', name), content);
        }
        // 3. Website / web panel.
        report({ step: 'Generating website', percent: 55 });
        write(path.join('website', 'index.html'), generateWebsite(project));
        // 4. Installer scripts.
        report({ step: 'Generating installer', percent: 70 });
        write(path.join('installer', 'installer.nsi'), generateNsisInstaller(project));
        write(path.join('installer', 'electron-builder.json'), generateElectronBuilderConfig(project));
        // 5. Launcher runtime config + embedded public key for signature verify.
        report({ step: 'Writing launcher config', percent: 82 });
        const scheme = project.domain.useHttps ? 'https' : 'http';
        const host = project.domain.ownsDomain && project.domain.domain
            ? project.domain.subdomain
                ? `${project.domain.subdomain}.${project.domain.domain}`
                : project.domain.domain
            : project.server.serverIp;
        const launcherConfig = {
            apiBase: `${scheme}://${host}`,
            serverId: project.id,
            serverName: project.meta.serverName,
            gameId: project.meta.gameId,
            verifySignatures: project.security.verifySignatures,
            verifyChecksums: project.security.verifyChecksums,
            publicKey: project.security.verifySignatures ? this.store.getPublicKey(project.id) : '',
            website: project.server.website,
            discord: project.server.discord,
            branding: project.branding,
            autoJoin: {
                serverIp: project.server.serverIp,
                gamePort: project.server.gamePort,
                password: project.server.serverPassword,
            },
        };
        write(path.join('launcher', 'launcher-config.json'), JSON.stringify(launcherConfig, null, 2));
        // 6. Encrypted sensitive config (admin passwords) for the deployment.
        report({ step: 'Encrypting sensitive config', percent: 90 });
        if (project.security.encryptConfig && project.server.adminPassword) {
            const passphrase = project.id; // In production, prompt the owner for this.
            const envelope = encryptConfig(JSON.stringify({ adminPassword: project.server.adminPassword }), passphrase);
            write(path.join('deployment', 'secrets.enc.json'), JSON.stringify(envelope, null, 2));
        }
        // 7. Branding manifest (asset references + theme).
        write('branding.json', JSON.stringify(project.branding, null, 2));
        // 8. A README describing the output.
        write('README.txt', this.buildReadme(project));
        report({ step: 'Build complete', percent: 100, detail: `${artifacts.length} artifacts` });
        return { outputDir, manifest, artifacts };
    }
    buildReadme(project) {
        const slug = projectSlug(project);
        return `ForgeLink build output for "${project.meta.name}"
Generated: ${new Date().toISOString()}
Game: ${project.meta.gameId}

Contents:
  manifest.json            Signed mod manifest (SHA-256 per file).
  branding.json            Theme + asset references.
  launcher/                Launcher runtime config (+ embedded public key).
  installer/               NSIS script + electron-builder config for the installer.
  website/                 Static web panel (index.html) — deploy to the server.
  deployment/              Linux deployment package:
    deploy.sh              One-shot deploy script (run on the Linux host).
    ecosystem.config.cjs   PM2 process definition.
    forgelink-${slug}.service  systemd unit.
    ${project.domain.reverseProxy === 'nginx' ? 'nginx.conf              Nginx reverse-proxy site.' : project.domain.reverseProxy === 'apache' ? 'apache.conf             Apache vhost.' : ''}
    ${project.domain.useHttps ? "certbot.sh              Let's Encrypt certificate script." : ''}
    firewall.sh            UFW firewall rules.

Deploy:
  1. Upload the server-api build and the deployment/ folder to your Linux host.
  2. Run: sudo bash deployment/deploy.sh
  3. Publish content from the Builder (Publish button) once the API is live.
`;
    }
}
//# sourceMappingURL=build-pipeline.js.map