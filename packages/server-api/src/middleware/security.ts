import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { sha256, safeHexEqual } from '@forgelink/shared';
import type { AppConfig } from '../config.js';

/**
 * Security middleware: API-key gating for privileged routes and JWT issuing /
 * verification for authenticated sessions. Both are constant-time where it
 * matters and never leak which specific credential failed.
 */

export interface AuthedRequest extends Request {
  auth?: { subject: string; via: 'jwt' | 'apikey' };
}

/**
 * Requires a valid API key (either from the static config allow-list or the
 * database-issued keys). Used to protect publish/write endpoints.
 */
export function requireApiKey(config: AppConfig, isDbKeyValid: (hash: string) => boolean) {
  const configuredHashes = new Set(config.apiKeys.map((k) => sha256(k)));
  return (req: AuthedRequest, res: Response, next: NextFunction): void => {
    const provided = req.header('x-api-key');
    if (!provided) {
      res.status(401).json({ error: 'API key required' });
      return;
    }
    const providedHash = sha256(provided);
    const inConfig = [...configuredHashes].some((h) => safeHexEqual(h, providedHash));
    if (inConfig || isDbKeyValid(providedHash)) {
      req.auth = { subject: 'api-key', via: 'apikey' };
      next();
      return;
    }
    res.status(403).json({ error: 'Invalid API key' });
  };
}

/** Issue a signed JWT for an authenticated subject. */
export function issueJwt(config: AppConfig, subject: string, claims: Record<string, unknown> = {}): string {
  return jwt.sign(claims, config.jwtSecret, {
    subject,
    expiresIn: config.jwtTtl as jwt.SignOptions['expiresIn'],
    issuer: 'forgelink',
  });
}

/** Verify a Bearer JWT and attach the subject to the request. */
export function requireJwt(config: AppConfig) {
  return (req: AuthedRequest, res: Response, next: NextFunction): void => {
    const header = req.header('authorization') ?? '';
    const [scheme, token] = header.split(' ');
    if (scheme !== 'Bearer' || !token) {
      res.status(401).json({ error: 'Bearer token required' });
      return;
    }
    try {
      const payload = jwt.verify(token, config.jwtSecret, { issuer: 'forgelink' });
      req.auth = { subject: typeof payload.sub === 'string' ? payload.sub : 'unknown', via: 'jwt' };
      next();
    } catch {
      res.status(401).json({ error: 'Invalid or expired token' });
    }
  };
}
