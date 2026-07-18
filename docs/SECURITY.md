# ForgeLink Security

Security is applied at every layer of the platform. This document summarizes the
mechanisms and where they live.

## Transport

- **HTTPS** everywhere in production. The deployment generator emits Certbot scripts and
  configures the reverse proxy for TLS 1.2/1.3 with an HTTP→HTTPS redirect.
- The API is intended to bind `127.0.0.1` behind Nginx/Apache; `trust proxy` is enabled
  so client IPs and rate limiting work correctly.
- **Helmet** sets secure HTTP headers; `x-powered-by` is disabled.
- **CORS** is allow-list driven via `FORGELINK_CORS_ORIGINS`.

## Authentication & authorization

- **API keys** protect all publish/write routes (`/api/admin/*`). Keys are compared in
  constant time; only SHA-256 hashes are stored (DB-issued keys) and config keys are
  matched against hashes, never plaintext.
- **JWT** support (`issueJwt` / `requireJwt`) for authenticated sessions, signed with
  `FORGELINK_JWT_SECRET` and scoped to the `forgelink` issuer.

## Integrity

- **SHA-256 checksums** for every mod file. The launcher verifies each downloaded file
  and repairs (re-downloads) any mismatch. See `shared/manifest.ts` and
  `launcher/services/mod-sync.ts`.
- **Digital signatures**: each project has an RSA-2048 keypair generated on creation. The
  private key signs the manifest and update descriptors; the public key is embedded in
  the launcher. The launcher refuses to sync a manifest whose signature fails
  verification. See `shared/crypto.ts` and `verifyManifest` / `verifyPayload`.
- **Resumable downloads** validate the final file against the expected hash, so a resumed
  or interrupted transfer can never silently install a truncated/corrupt file.

## Encrypted configuration

- Sensitive config (e.g. admin password) is encrypted at rest with **AES-256-GCM**, using
  a key derived from a passphrase via **scrypt**. The envelope is self-describing (salt,
  iv, auth tag). See `shared/config-crypto.ts`. GCM's auth tag means tampering is detected
  on decrypt.

## Input validation

- Every request body and every persisted project is validated with **Zod** schemas
  (`shared/schemas.ts`), the single source of truth for both runtime validation and the
  TypeScript types. Invalid input yields a `400` with structured details.
- SQLite access uses **prepared statements with bound parameters** exclusively — no string
  interpolation of user input — eliminating SQL injection.
- The mod download route resolves and confirms paths stay inside the storage mods root,
  rejecting **path traversal**.

## Rate limiting

- `express-rate-limit` caps requests per IP per minute on `/api` (configurable via
  `FORGELINK_RATE_LIMIT_PER_MIN`, surfaced in the Builder's Security page).

## Electron hardening

- Both desktop apps run with `contextIsolation: true` and `nodeIntegration: false`.
- Renderers never access Node or IPC directly; they use a typed, minimal preload bridge
  (`window.forgelink` / `window.launcher`).
- A Content-Security-Policy is set on the renderer HTML.

## Operational recommendations

- Always override `FORGELINK_JWT_SECRET` and set unique `FORGELINK_API_KEYS` before
  publishing.
- Keep the project's `signing-private.pem` secret; it never needs to leave the owner's
  machine. Only the public key is distributed (inside the launcher).
- Rotate API keys via the `api_keys` table (`revoked = 1` to disable).
