/**
 * End-to-End Encryption (E2EE) Module
 * Implements Elliptic Curve Diffie-Hellman (ECDH P-256) Key Agreement
 * and authenticated symmetric encryption using AES-GCM 256-bit.
 */

export interface E2EESession {
  keyPair: CryptoKeyPair;
  publicKeyBase64: string;
  sharedKey?: CryptoKey;
  safetyNumber?: string;
  partnerPublicKeyBase64?: string;
}

export function bufferToHex(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export function bufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function base64ToBuffer(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Generates an ephemeral ECDH key pair on the NIST P-256 curve
 */
export async function generateECDHKeyPair(): Promise<CryptoKeyPair> {
  return await window.crypto.subtle.generateKey(
    {
      name: 'ECDH',
      namedCurve: 'P-256',
    },
    true,
    ['deriveKey', 'deriveBits']
  );
}

/**
 * Exports an ECDH public key to base64 SPKI format
 */
export async function exportPublicKey(key: CryptoKey): Promise<string> {
  const exported = await window.crypto.subtle.exportKey('spki', key);
  return bufferToBase64(exported);
}

/**
 * Imports a partner's base64 SPKI ECDH public key
 */
export async function importPublicKey(base64Key: string): Promise<CryptoKey> {
  const buffer = base64ToBuffer(base64Key);
  return await window.crypto.subtle.importKey(
    'spki',
    buffer as unknown as BufferSource,
    {
      name: 'ECDH',
      namedCurve: 'P-256',
    },
    true,
    []
  );
}

/**
 * Derives a 256-bit AES-GCM symmetric session key from local private key and remote public key
 */
export async function deriveAESSharedKey(
  localPrivateKey: CryptoKey,
  remotePublicKey: CryptoKey
): Promise<CryptoKey> {
  return await window.crypto.subtle.deriveKey(
    {
      name: 'ECDH',
      public: remotePublicKey,
    },
    localPrivateKey,
    {
      name: 'AES-GCM',
      length: 256,
    },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Computes a standardized verification safety number (like Signal / WhatsApp)
 * by sorting the two public keys and digesting with SHA-256
 */
export async function computeSafetyNumber(
  pubKeyA: string,
  pubKeyB: string
): Promise<string> {
  const sortedKeys = [pubKeyA, pubKeyB].sort().join(':');
  const encoder = new TextEncoder();
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', encoder.encode(sortedKeys));
  const hashArray = new Uint8Array(hashBuffer);
  
  // Format into 4 chunks of 4 digits for easy optical comparison
  const chunks: string[] = [];
  for (let i = 0; i < 4; i++) {
    const val = (hashArray[i * 2] << 8) | hashArray[i * 2 + 1];
    chunks.push((val % 10000).toString().padStart(4, '0'));
  }
  return chunks.join(' - ');
}

/**
 * Encrypts a plaintext string with AES-GCM 256-bit using a fresh 12-byte IV
 */
export async function encryptPayload(
  text: string,
  key: CryptoKey
): Promise<{
  ciphertextBase64: string;
  ivBase64: string;
  ivHex: string;
  ciphertextHex: string;
}> {
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encodedText = new TextEncoder().encode(text);

  const encryptedBuffer = await window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv,
    },
    key,
    encodedText
  );

  const ciphertextBytes = new Uint8Array(encryptedBuffer);

  return {
    ciphertextBase64: bufferToBase64(ciphertextBytes),
    ivBase64: bufferToBase64(iv),
    ivHex: bufferToHex(iv),
    ciphertextHex: bufferToHex(ciphertextBytes),
  };
}

/**
 * Decrypts an AES-GCM payload
 */
export async function decryptPayload(
  ciphertextBase64: string,
  ivBase64: string,
  key: CryptoKey
): Promise<string> {
  const ciphertextBytes = base64ToBuffer(ciphertextBase64);
  const ivBytes = base64ToBuffer(ivBase64);

  const decryptedBuffer = await window.crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: ivBytes as unknown as BufferSource,
    },
    key,
    ciphertextBytes as unknown as BufferSource
  );

  return new TextDecoder().decode(decryptedBuffer);
}
