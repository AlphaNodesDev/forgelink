import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'node:crypto';

/**
 * Encrypted config files. Sensitive configuration (admin passwords, API keys,
 * signing keys) is encrypted at rest using AES-256-GCM with a key derived from
 * a passphrase via scrypt. The output is a self-describing envelope so it can be
 * decrypted later without out-of-band parameters.
 */

const ALGORITHM = 'aes-256-gcm';
const SALT_LEN = 16;
const IV_LEN = 12;
const KEY_LEN = 32;

export interface EncryptedEnvelope {
  v: 1;
  alg: 'aes-256-gcm';
  salt: string; // base64
  iv: string; // base64
  tag: string; // base64
  data: string; // base64 ciphertext
}

function deriveKey(passphrase: string, salt: Buffer): Buffer {
  return scryptSync(passphrase, salt, KEY_LEN);
}

/** Encrypt a UTF-8 plaintext (typically JSON) into a portable envelope object. */
export function encryptConfig(plaintext: string, passphrase: string): EncryptedEnvelope {
  const salt = randomBytes(SALT_LEN);
  const iv = randomBytes(IV_LEN);
  const key = deriveKey(passphrase, salt);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return {
    v: 1,
    alg: ALGORITHM,
    salt: salt.toString('base64'),
    iv: iv.toString('base64'),
    tag: tag.toString('base64'),
    data: encrypted.toString('base64'),
  };
}

/** Decrypt an envelope produced by `encryptConfig`. Throws if tampered/invalid. */
export function decryptConfig(envelope: EncryptedEnvelope, passphrase: string): string {
  const salt = Buffer.from(envelope.salt, 'base64');
  const iv = Buffer.from(envelope.iv, 'base64');
  const tag = Buffer.from(envelope.tag, 'base64');
  const key = deriveKey(passphrase, salt);
  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(envelope.data, 'base64')),
    decipher.final(),
  ]);
  return decrypted.toString('utf8');
}
