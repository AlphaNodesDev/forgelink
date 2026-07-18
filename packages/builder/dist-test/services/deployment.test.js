import { test } from 'node:test';
import assert from 'node:assert/strict';
import { projectSchema } from '@forgelink/shared';
import { generateDeploymentBundle, generateNginxConfig, generateSystemdService, projectSlug, resolveHost, } from './deployment.js';
/**
 * Deployment generator tests. Pure functions, so we build a representative
 * Project and assert on the emitted config content.
 */
function makeProject(overrides = {}) {
    const now = new Date().toISOString();
    return projectSchema.parse({
        schemaVersion: 1,
        id: 'proj-123',
        createdAt: now,
        updatedAt: now,
        meta: {
            name: 'My Cool Server!!',
            gameId: 'seven-days-to-die',
            serverName: 'Cool',
            description: 'desc',
            version: '1.0.0',
            owner: 'me',
        },
        installation: { path: '/srv', detectedVersion: '', modsPath: 'Mods', valid: true },
        server: {
            serverIp: '203.0.113.10',
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
        domain: {
            ownsDomain: true,
            domain: 'example.com',
            subdomain: 'play',
            useHttps: true,
            reverseProxy: 'nginx',
            certbotEmail: 'admin@example.com',
        },
        branding: {},
        security: {},
        database: 'sqlite',
        news: [],
        ...overrides,
    });
}
test('projectSlug produces a filesystem-safe slug', () => {
    assert.equal(projectSlug(makeProject()), 'my-cool-server');
});
test('resolveHost prefers subdomain.domain', () => {
    assert.equal(resolveHost(makeProject()), 'play.example.com');
});
test('nginx config includes TLS block and proxy pass when HTTPS is on', () => {
    const conf = generateNginxConfig(makeProject());
    assert.match(conf, /listen 443 ssl/);
    assert.match(conf, /proxy_pass http:\/\/127\.0\.0\.1:8080/);
    assert.match(conf, /play\.example\.com/);
});
test('systemd unit references the correct working directory', () => {
    const unit = generateSystemdService(makeProject());
    assert.match(unit, /WorkingDirectory=\/opt\/forgelink\/my-cool-server/);
});
test('deployment bundle contains nginx + certbot for an HTTPS nginx project', () => {
    const bundle = generateDeploymentBundle(makeProject());
    assert.ok(bundle['nginx.conf']);
    assert.ok(bundle['certbot.sh']);
    assert.ok(bundle['ecosystem.config.cjs']);
    assert.ok(bundle['deploy.sh']);
    assert.ok(bundle['firewall.sh']);
    assert.ok(bundle['forgelink-my-cool-server.service']);
    assert.equal(bundle['apache.conf'], undefined);
});
test('deployment bundle uses apache when selected and omits certbot without HTTPS', () => {
    const bundle = generateDeploymentBundle(makeProject({
        domain: {
            ownsDomain: true,
            domain: 'example.com',
            subdomain: '',
            useHttps: false,
            reverseProxy: 'apache',
            certbotEmail: '',
        },
    }));
    assert.ok(bundle['apache.conf']);
    assert.equal(bundle['nginx.conf'], undefined);
    assert.equal(bundle['certbot.sh'], undefined);
});
//# sourceMappingURL=deployment.test.js.map