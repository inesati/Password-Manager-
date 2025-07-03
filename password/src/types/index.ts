export interface PasswordEntry {
  id: string;
  service: string;
  username: string;
  password: string;
  url?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PasswordGeneratorOptions {
  length: number;
  includeUppercase: boolean;
  includeLowercase: boolean;
  includeNumbers: boolean;
  includeSymbols: boolean;
  excludeSimilar: boolean;
}

export interface AppState {
  isAuthenticated: boolean;
  masterPasswordHash: string | null;
  entries: PasswordEntry[];
  searchQuery: string;
  selectedEntry: PasswordEntry | null;
  isLocked: boolean;
  lastActivity: number;
}