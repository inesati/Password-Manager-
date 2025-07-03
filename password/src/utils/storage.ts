/**
 * Local storage utilities for encrypted password management
 */

import { encrypt, decrypt, deriveKey, generateSalt, hashPassword } from './crypto';
import { PasswordEntry } from '../types';

const STORAGE_KEYS = {
  MASTER_HASH: 'pm_master_hash',
  MASTER_SALT: 'pm_master_salt',
  ENTRIES: 'pm_entries',
  SETTINGS: 'pm_settings'
};

/**
 * Storage manager for encrypted password data
 */
export class SecureStorage {
  private masterKey: CryptoKey | null = null;
  private masterSalt: Uint8Array | null = null;

  /**
   * Initialize storage with master password
   */
  async initializeMasterPassword(password: string): Promise<void> {
    const salt = generateSalt();
    const hash = await hashPassword(password, salt);
    
    localStorage.setItem(STORAGE_KEYS.MASTER_HASH, hash);
    localStorage.setItem(STORAGE_KEYS.MASTER_SALT, Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join(''));
    
    this.masterSalt = salt;
    this.masterKey = await deriveKey(password, salt);
  }

  /**
   * Verify master password and unlock storage
   */
  async verifyMasterPassword(password: string): Promise<boolean> {
    const storedHash = localStorage.getItem(STORAGE_KEYS.MASTER_HASH);
    const storedSalt = localStorage.getItem(STORAGE_KEYS.MASTER_SALT);
    
    if (!storedHash || !storedSalt) return false;

    const salt = new Uint8Array(storedSalt.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
    const hash = await hashPassword(password, salt);
    
    if (hash === storedHash) {
      this.masterSalt = salt;
      this.masterKey = await deriveKey(password, salt);
      return true;
    }
    
    return false;
  }

  /**
   * Check if master password is set
   */
  isMasterPasswordSet(): boolean {
    return localStorage.getItem(STORAGE_KEYS.MASTER_HASH) !== null;
  }

  /**
   * Save encrypted entries to storage
   */
  async saveEntries(entries: PasswordEntry[]): Promise<void> {
    if (!this.masterKey) throw new Error('Master key not initialized');
    
    const serialized = JSON.stringify(entries);
    const encrypted = await encrypt(serialized, this.masterKey);
    localStorage.setItem(STORAGE_KEYS.ENTRIES, encrypted);
  }

  /**
   * Load and decrypt entries from storage
   */
  async loadEntries(): Promise<PasswordEntry[]> {
    if (!this.masterKey) throw new Error('Master key not initialized');
    
    const encrypted = localStorage.getItem(STORAGE_KEYS.ENTRIES);
    if (!encrypted) return [];

    try {
      const decrypted = await decrypt(encrypted, this.masterKey);
      const entries = JSON.parse(decrypted);
      return entries.map((entry: any) => ({
        ...entry,
        createdAt: new Date(entry.createdAt),
        updatedAt: new Date(entry.updatedAt)
      }));
    } catch (error) {
      console.error('Failed to decrypt entries:', error);
      return [];
    }
  }

  /**
   * Clear all stored data
   */
  clearAll(): void {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    this.masterKey = null;
    this.masterSalt = null;
  }

  /**
   * Export encrypted backup
   */
  async exportBackup(): Promise<string> {
    const entries = localStorage.getItem(STORAGE_KEYS.ENTRIES);
    const masterHash = localStorage.getItem(STORAGE_KEYS.MASTER_HASH);
    const masterSalt = localStorage.getItem(STORAGE_KEYS.MASTER_SALT);
    
    const backup = {
      entries,
      masterHash,
      masterSalt,
      timestamp: new Date().toISOString(),
      version: '1.0'
    };
    
    return JSON.stringify(backup);
  }

  /**
   * Import encrypted backup
   */
  async importBackup(backupData: string): Promise<boolean> {
    try {
      const backup = JSON.parse(backupData);
      
      if (backup.entries) localStorage.setItem(STORAGE_KEYS.ENTRIES, backup.entries);
      if (backup.masterHash) localStorage.setItem(STORAGE_KEYS.MASTER_HASH, backup.masterHash);
      if (backup.masterSalt) localStorage.setItem(STORAGE_KEYS.MASTER_SALT, backup.masterSalt);
      
      return true;
    } catch (error) {
      console.error('Failed to import backup:', error);
      return false;
    }
  }
}