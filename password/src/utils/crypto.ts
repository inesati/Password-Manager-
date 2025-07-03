/**
 * Cryptographic utilities for secure password management
 * Uses Web Crypto API for AES-256-GCM encryption and PBKDF2 key derivation
 */

const SALT_LENGTH = 32;
const IV_LENGTH = 12;
const TAG_LENGTH = 16;
const PBKDF2_ITERATIONS = 100000;

/**
 * Generate a random salt for key derivation
 */
export function generateSalt(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
}

/**
 * Generate a random IV for AES encryption
 */
export function generateIV(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(IV_LENGTH));
}

/**
 * Derive a key from password using PBKDF2
 */
export async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Hash password for master password verification
 */
export async function hashPassword(password: string, salt: Uint8Array): Promise<string> {
  const key = await deriveKey(password, salt);
  const keyBuffer = await crypto.subtle.exportKey('raw', key);
  return Array.from(new Uint8Array(keyBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Encrypt data using AES-256-GCM
 */
export async function encrypt(data: string, key: CryptoKey): Promise<string> {
  const encoder = new TextEncoder();
  const iv = generateIV();
  
  const encrypted = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv,
      tagLength: TAG_LENGTH * 8
    },
    key,
    encoder.encode(data)
  );

  // Combine IV and encrypted data
  const combined = new Uint8Array(iv.length + encrypted.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(encrypted), iv.length);

  return Array.from(combined)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Decrypt data using AES-256-GCM
 */
export async function decrypt(encryptedData: string, key: CryptoKey): Promise<string> {
  const data = new Uint8Array(encryptedData.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
  
  const iv = data.slice(0, IV_LENGTH);
  const encrypted = data.slice(IV_LENGTH);

  const decrypted = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: iv,
      tagLength: TAG_LENGTH * 8
    },
    key,
    encrypted
  );

  return new TextDecoder().decode(decrypted);
}

/**
 * Generate a secure random password
 */
export function generateSecurePassword(options: {
  length: number;
  includeUppercase: boolean;
  includeLowercase: boolean;
  includeNumbers: boolean;
  includeSymbols: boolean;
  excludeSimilar: boolean;
}): string {
  let charset = '';
  
  if (options.includeLowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
  if (options.includeUppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if (options.includeNumbers) charset += '0123456789';
  if (options.includeSymbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';
  
  if (options.excludeSimilar) {
    charset = charset.replace(/[il1Lo0O]/g, '');
  }

  if (charset === '') {
    throw new Error('At least one character type must be selected');
  }

  let password = '';
  const array = new Uint8Array(options.length);
  crypto.getRandomValues(array);

  for (let i = 0; i < options.length; i++) {
    password += charset[array[i] % charset.length];
  }

  return password;
}