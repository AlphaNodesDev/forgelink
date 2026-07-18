import { createHash, createSign, createVerify, generateKeyPairSync, timingSafeEqual } from 'node:crypto';
import { createReadStream } from 'node:fs';

/**
 * Cryptographic primitives shared across ForgeLink:
 *  - SHA-256 hashing (streaming, for large mod files)
 *  - RSA keypair generation + detached signing/verification of manifests
 *
 * These are deliberately dependency-free (Node core `crypto` only) so the same
 * code runs unchanged in the Builder (Electron main), the Launcher and the API.
 */

/** Hash an arbitrary buffer/string to a lowercase hex SHA-256 digest. */
export function sha256(data: Buffer | string): string {
  return createHash('sha256').update(data).digest('hex');
}

/**
 * Stream a file from disk and return its SHA-256 digest without loading the
 * whole file into memory. Safe for multi-gigabyte mod archives.
 */
export function sha256File(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const hash = createHash('sha256');
    const stream = createReadStream(filePath);
    stream.on('error', reject);
    stream.on('data', (chunk) => hash.update(chunk));
    stream.on('end', () => resolve(hash.digest('hex')));
  });
}

/** Constant-time comparison of two hex strings (guards against timing attacks). */
export function safeHexEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  try {
    return timingSafeEqual(Buffer.from(a, 'hex'), Buffer.from(b, 'hex'));
  } catch {
    return false;
  }
}

export interface KeyPairPem {
  publicKey: string;
  privateKey: string;
}

/**
 * Generate an RSA-2048 keypair in PEM format. The Builder generates one keypair
 * per project; the private key signs manifests/updates and the public key is
 * embedded in the Launcher for verification.
 */
export function generateSigningKeyPair(): KeyPairPem {
  const { publicKey, privateKey } = generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  });
  return { publicKey, privateKey };
}

/** Produce a base64 RSA-SHA256 signature over `payload`. */
export function signPayload(payload: string, privateKeyPem: string): string {
  const signer = createSign('RSA-SHA256');
  signer.update(payload);
  signer.end();
  return signer.sign(privateKeyPem, 'base64');
}

/** Verify a base64 RSA-SHA256 signature over `payload`. */
export function verifyPayload(payload: string, signatureBase64: string, publicKeyPem: string): boolean {
  try {
    const verifier = createVerify('RSA-SHA256');
    verifier.update(payload);
    verifier.end();
    return verifier.verify(publicKeyPem, signatureBase64, 'base64');
  } catch {
    return false;
  }
}
