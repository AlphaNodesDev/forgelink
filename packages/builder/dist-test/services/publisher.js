import { readFileSync } from 'node:fs';
import path from 'node:path';
import { createLogger } from '@forgelink/shared';
/**
 * Publisher: pushes generated content to a live Server API when the owner
 * clicks "Publish". Uses the project's API key and the fetch API (Node 20+ has
 * global fetch). Each call validates the response and surfaces failures.
 */
export class Publisher {
    apiBase;
    apiKey;
    logger = createLogger('builder:publish');
    constructor(apiBase, apiKey) {
        this.apiBase = apiBase;
        this.apiKey = apiKey;
    }
    async post(route, body) {
        const res = await fetch(`${this.apiBase}${route}`, {
            method: 'POST',
            headers: { 'content-type': 'application/json', 'x-api-key': this.apiKey },
            body: JSON.stringify(body),
        });
        if (!res.ok) {
            const text = await res.text().catch(() => '');
            throw new Error(`Publish ${route} failed: ${res.status} ${text}`);
        }
    }
    /** Publish server identity, manifest and news in one flow. */
    async publishAll(project, outputDir) {
        this.logger.info('Publishing server identity', { server: project.id });
        await this.post('/api/admin/publish/server', {
            id: project.id,
            gameId: project.meta.gameId,
            name: project.meta.serverName,
            description: project.meta.description,
            server: project.server,
        });
        const manifestPath = path.join(outputDir, 'manifest.json');
        const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
        this.logger.info('Publishing manifest', { version: manifest.version });
        await this.post('/api/admin/publish/manifest', { serverId: project.id, manifest });
        this.logger.info('Publishing news', { count: project.news.length });
        await this.post('/api/admin/publish/news', { serverId: project.id, news: project.news });
    }
}
//# sourceMappingURL=publisher.js.map