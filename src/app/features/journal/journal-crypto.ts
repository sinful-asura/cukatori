import { Injectable, signal } from '@angular/core';
import type { JournalPlaintext } from '@ascend-os/shared/journal';

const PBKDF2_ITERATIONS = 210_000;
const SALT_BYTES = 16;
const IV_BYTES = 12;
const KEY_BITS = 256;
const VAULT_CHECK = 'ascend-os.journal.vault.v1';

const textEnc = new TextEncoder();
const textDec = new TextDecoder();

@Injectable({ providedIn: 'root' })
export class JournalCrypto {
  readonly unlocked = signal(false);
  private key: CryptoKey | null = null;

  lock(): void {
    this.key = null;
    this.unlocked.set(false);
  }

  async createVault(passphrase: string) {
    const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
    const key = await deriveKey(passphrase, salt);
    const sealed = await encryptBytes(key, textEnc.encode(VAULT_CHECK));
    this.key = key;
    this.unlocked.set(true);
    return {
      salt: bytesToB64(salt),
      verifier: sealed.ciphertext,
      verifierIv: sealed.iv,
    };
  }

  async unlock(passphrase: string, saltB64: string, verifier: string, verifierIv: string) {
    const key = await deriveKey(passphrase, b64ToBytes(saltB64));
    try {
      const opened = textDec.decode(await decryptBytes(key, verifier, verifierIv));
      if (opened !== VAULT_CHECK) {
        return false;
      }
    } catch {
      return false;
    }
    this.key = key;
    this.unlocked.set(true);
    return true;
  }

  async encrypt(plain: JournalPlaintext): Promise<{ ciphertext: string; iv: string }> {
    const key = this.requireKey();
    return encryptBytes(key, textEnc.encode(JSON.stringify(plain)));
  }

  async decrypt(ciphertext: string, iv: string): Promise<JournalPlaintext> {
    const key = this.requireKey();
    const raw = textDec.decode(await decryptBytes(key, ciphertext, iv));
    const parsed = JSON.parse(raw) as JournalPlaintext;
    return {
      body: typeof parsed.body === 'string' ? parsed.body : '',
      image:
        parsed.image && typeof parsed.image.data === 'string'
          ? { mime: parsed.image.mime || 'application/octet-stream', data: parsed.image.data }
          : undefined,
    };
  }

  private requireKey(): CryptoKey {
    if (!this.key) {
      throw new Error('Journal is locked');
    }
    return this.key;
  }
}

async function deriveKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  const material = await crypto.subtle.importKey('raw', textEnc.encode(passphrase), 'PBKDF2', false, [
    'deriveKey',
  ]);
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: toArrayBuffer(salt), iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
    material,
    { name: 'AES-GCM', length: KEY_BITS },
    false,
    ['encrypt', 'decrypt'],
  );
}

async function encryptBytes(key: CryptoKey, data: Uint8Array) {
  const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES));
  const buf = await crypto.subtle.encrypt({ name: 'AES-GCM', iv: toArrayBuffer(iv) }, key, toArrayBuffer(data));
  return { ciphertext: bytesToB64(new Uint8Array(buf)), iv: bytesToB64(iv) };
}

async function decryptBytes(key: CryptoKey, ciphertext: string, iv: string) {
  const buf = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: toArrayBuffer(b64ToBytes(iv)) },
    key,
    toArrayBuffer(b64ToBytes(ciphertext)),
  );
  return new Uint8Array(buf);
}

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const copy = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(copy).set(bytes);
  return copy;
}

function bytesToB64(bytes: Uint8Array): string {
  let bin = '';
  for (const byte of bytes) {
    bin += String.fromCharCode(byte);
  }
  return btoa(bin);
}

function b64ToBytes(value: string): Uint8Array {
  const bin = atob(value);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i += 1) {
    out[i] = bin.charCodeAt(i);
  }
  return out;
}
