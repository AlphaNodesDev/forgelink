# ForgeLink Server API reference

Base URL: `https://<your-host>` (behind Nginx/Apache; the API listens on `127.0.0.1:8080`).

All responses are JSON. Public read routes are unauthenticated. Publish routes require an
API key via the `x-api-key` header.

## Health

### `GET /healthz`
Liveness probe for load balancers / PM2 / systemd.
```json
{ "status": "ok", "uptime": 123.4 }
```

## Public routes

### `GET /api/status`
Live server status (cached for 30s; falls back to an adapter query).
```json
{ "online": true, "playersOnline": 7, "playersMax": 16, "pingMs": 24, "version": null, "checkedAt": "2026-01-01T00:00:00.000Z" }
```

### `GET /api/playercount`
Compact player count from the cache.
```json
{ "online": true, "playersOnline": 7, "playersMax": 16 }
```

### `GET /api/news`
```json
{ "news": [ { "id": "n1", "title": "...", "body": "...", "author": "...", "publishedAt": "...", "pinned": true } ] }
```

### `GET /api/changelog`
Same shape as news under a `changelog` key.

### `GET /api/version`
Latest launcher auto-update descriptor. `url` is a ready-to-use download link.
```json
{ "version": "1.2.0", "releasedAt": "...", "url": "https://.../api/download?type=launcher&version=1.2.0", "sha256": "...", "size": 12345, "mandatory": false, "notes": "...", "signature": "..." }
```

### `GET /api/mods`
The current signed mod manifest.
```json
{ "schemaVersion": 1, "gameId": "seven-days-to-die", "version": "1.0.0", "generatedAt": "...", "totalSize": 999, "files": [ { "path": "Mods/X/file.dll", "sha256": "...", "size": 100 } ], "signature": "..." }
```

### `GET /api/launcher`
302 redirect to the latest launcher installer download.

### `GET /api/download?type=launcher&version=<v>`
### `GET /api/download?type=mod&path=<relative-path>`
Streams a file. Supports HTTP `Range` requests (`206 Partial Content`) for **resumable**
downloads. Mod paths are sandboxed to the server's storage mods directory (path traversal
is rejected).

## Analytics

### `POST /api/analytics/event`
Anonymous event ingestion (no auth). Body:
```json
{ "serverId": "srv-1", "eventType": "download|update_success|update_fail|mod_download|crash|launch", "clientId": "<uuid>", "bytes": 0, "metadata": {} }
```

## Publish routes (require `x-api-key`)

### `POST /api/admin/publish/server`
```json
{ "id": "srv-1", "gameId": "seven-days-to-die", "name": "...", "description": "...", "server": { /* ServerConfig */ } }
```

### `POST /api/admin/publish/version`
```json
{ "serverId": "srv-1", "descriptor": { /* UpdateDescriptor */ }, "filePath": "srv-1/launcher/Setup.exe" }
```

### `POST /api/admin/publish/manifest`
```json
{ "serverId": "srv-1", "manifest": { /* Manifest */ } }
```

### `POST /api/admin/publish/news`
```json
{ "serverId": "srv-1", "news": [ { /* NewsEntry */ } ] }
```

### `GET /api/admin/analytics/:serverId`
```json
{ "downloads": 0, "uniquePlayers": 0, "updateSuccess": 0, "updateFail": 0, "crashes": 0, "modDownloads": 0, "bandwidthBytes": 0 }
```

## Environment variables

| Variable | Default | Purpose |
| --- | --- | --- |
| `FORGELINK_PORT` | `8080` | Listen port. |
| `FORGELINK_HOST` | `0.0.0.0` | Bind address (use `127.0.0.1` behind a proxy). |
| `FORGELINK_DATA_DIR` | `./data` | SQLite database location. |
| `FORGELINK_STORAGE_DIR` | `./storage` | Distributable files (installers, mods). |
| `FORGELINK_JWT_SECRET` | dev default | **Override in production.** |
| `FORGELINK_JWT_TTL` | `12h` | JWT lifetime. |
| `FORGELINK_API_KEYS` | empty | Comma-separated API keys for publish routes. |
| `FORGELINK_RATE_LIMIT_PER_MIN` | `120` | Per-IP request cap per minute on `/api`. |
| `FORGELINK_CORS_ORIGINS` | `*` | Comma-separated CORS allow-list. |
| `FORGELINK_PUBLIC_URL` | `http://localhost:8080` | Base URL used to build download links. |
| `FORGELINK_LOG_LEVEL` | `info` | `debug` / `info` / `warn` / `error`. |
