import React, { useState, useEffect } from 'react';
import { LoginForm } from './components/LoginForm';
import { Header } from './components/Header';
import { SearchBar } from './components/SearchBar';
import { PasswordEntry } from './components/PasswordEntry';
import { PasswordForm } from './components/PasswordForm';
import { PasswordEntry as PasswordEntryType } from './types';
import { SecureStorage } from './utils/storage';
import { Shield, Clock, Eye, EyeOff } from 'lucide-react';
import { generateSecurePassword } from './utils/crypto';

const LOCK_TIMEOUT = 5 * 60 * 1000; // 5 minutes

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSetup, setIsSetup] = useState(false);
  const [entries, setEntries] = useState<PasswordEntryType[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEntry, setSelectedEntry] = useState<PasswordEntryType | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [showAllPasswords, setShowAllPasswords] = useState(false);
  const [storage] = useState(() => new SecureStorage());

  // Auto-lock functionality
  useEffect(() => {
    const updateActivity = () => setLastActivity(Date.now());
    
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => document.addEventListener(event, updateActivity, true));

    const checkLock = setInterval(() => {
      if (isAuthenticated && Date.now() - lastActivity > LOCK_TIMEOUT) {
        handleLock();
      }
    }, 1000);

    return () => {
      events.forEach(event => document.removeEventListener(event, updateActivity, true));
      clearInterval(checkLock);
    };
  }, [isAuthenticated, lastActivity]);

  // Initialize app
  useEffect(() => {
    const initialize = async () => {
      const hasPassword = storage.isMasterPasswordSet();
      setIsSetup(!hasPassword);
    };
    initialize();
  }, [storage]);

  const handleLogin = async (password: string): Promise<boolean> => {
    const success = await storage.verifyMasterPassword(password);
    if (success) {
      setIsAuthenticated(true);
      await loadEntries();
      return true;
    }
    return false;
  };

  const handleSetupMasterPassword = async (password: string) => {
    await storage.initializeMasterPassword(password);
    setIsSetup(false);
    setIsAuthenticated(true);
    setEntries([]);
  };

  const handleLock = () => {
    setIsAuthenticated(false);
    setEntries([]);
    setSelectedEntry(null);
    setShowForm(false);
    setSearchQuery('');
    setShowAllPasswords(false);
  };

  const loadEntries = async () => {
    try {
      const loadedEntries = await storage.loadEntries();
      setEntries(loadedEntries);
    } catch (error) {
      console.error('Failed to load entries:', error);
    }
  };

  const saveEntries = async (updatedEntries: PasswordEntryType[]) => {
    try {
      await storage.saveEntries(updatedEntries);
      setEntries(updatedEntries);
    } catch (error) {
      console.error('Failed to save entries:', error);
    }
  };

  const handleAddPassword = () => {
    setSelectedEntry(null);
    setShowForm(true);
  };

  const handleEditPassword = (entry: PasswordEntryType) => {
    setSelectedEntry(entry);
    setShowForm(true);
  };

  const handleSavePassword = async (entryData: Omit<PasswordEntryType, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date();
    let updatedEntries: PasswordEntryType[];

    if (selectedEntry) {
      // Update existing entry
      updatedEntries = entries.map(entry =>
        entry.id === selectedEntry.id
          ? { ...entry, ...entryData, updatedAt: now }
          : entry
      );
    } else {
      // Add new entry
      const newEntry: PasswordEntryType = {
        id: crypto.randomUUID(),
        ...entryData,
        createdAt: now,
        updatedAt: now
      };
      updatedEntries = [...entries, newEntry];
    }

    await saveEntries(updatedEntries);
    setShowForm(false);
    setSelectedEntry(null);
  };

  const handleDeletePassword = async (id: string) => {
    if (confirm('Are you sure you want to delete this password?')) {
      const updatedEntries = entries.filter(entry => entry.id !== id);
      await saveEntries(updatedEntries);
    }
  };

  const handleCreateExamples = async () => {
    if (confirm('This will add example passwords to your vault. Continue?')) {
      const exampleEntries: Omit<PasswordEntryType, 'id' | 'createdAt' | 'updatedAt'>[] = [
        {
          service: 'Gmail',
          username: 'john.doe@gmail.com',
          password: generateSecurePassword({
            length: 16,
            includeUppercase: true,
            includeLowercase: true,
            includeNumbers: true,
            includeSymbols: true,
            excludeSimilar: false
          }),
          url: 'https://gmail.com',
          notes: 'Personal email account'
        },
        {
          service: 'GitHub',
          username: 'johndoe',
          password: generateSecurePassword({
            length: 20,
            includeUppercase: true,
            includeLowercase: true,
            includeNumbers: true,
            includeSymbols: true,
            excludeSimilar: false
          }),
          url: 'https://github.com',
          notes: 'Development platform account'
        },
        {
          service: 'Netflix',
          username: 'john.doe@example.com',
          password: generateSecurePassword({
            length: 14,
            includeUppercase: true,
            includeLowercase: true,
            includeNumbers: true,
            includeSymbols: false,
            excludeSimilar: true
          }),
          url: 'https://netflix.com',
          notes: 'Streaming service subscription'
        },
        {
          service: 'Bank of America',
          username: 'johndoe123',
          password: generateSecurePassword({
            length: 18,
            includeUppercase: true,
            includeLowercase: true,
            includeNumbers: true,
            includeSymbols: true,
            excludeSimilar: true
          }),
          url: 'https://bankofamerica.com',
          notes: 'Primary banking account - high security'
        },
        {
          service: 'LinkedIn',
          username: 'john.doe.professional',
          password: generateSecurePassword({
            length: 16,
            includeUppercase: true,
            includeLowercase: true,
            includeNumbers: true,
            includeSymbols: true,
            excludeSimilar: false
          }),
          url: 'https://linkedin.com',
          notes: 'Professional networking platform'
        }
      ];

      const now = new Date();
      const newEntries: PasswordEntryType[] = exampleEntries.map(entry => ({
        id: crypto.randomUUID(),
        ...entry,
        createdAt: now,
        updatedAt: now
      }));

      const updatedEntries = [...entries, ...newEntries];
      await saveEntries(updatedEntries);
    }
  };

  const handleExportData = async () => {
    try {
      const backup = await storage.exportBackup();
      const blob = new Blob([backup], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `securepass-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export data:', error);
    }
  };

  const handleImportData = async (file: File) => {
    try {
      const text = await file.text();
      const success = await storage.importBackup(text);
      if (success) {
        await loadEntries();
        alert('Data imported successfully!');
      } else {
        alert('Failed to import data. Please check the file format.');
      }
    } catch (error) {
      console.error('Failed to import data:', error);
      alert('Failed to import data. Please check the file format.');
    }
  };

  const filteredEntries = entries.filter(entry =>
    entry.service.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entry.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isAuthenticated) {
    return (
      <LoginForm
        onLogin={handleLogin}
        onSetupMasterPassword={handleSetupMasterPassword}
        isSetup={isSetup}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        onAddPassword={handleAddPassword}
        onLock={handleLock}
        onExportData={handleExportData}
        onImportData={handleImportData}
        onCreateExamples={handleCreateExamples}
        entriesCount={entries.length}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Controls */}
        <div className="mb-8 space-y-4">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search passwords by service or username..."
          />
          
          {/* Show All Passwords Toggle */}
          {entries.length > 0 && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowAllPasswords(!showAllPasswords)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                    showAllPasswords
                      ? 'bg-blue-50 border-blue-200 text-blue-700'
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {showAllPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  {showAllPasswords ? 'Hide All Passwords' : 'Show All Passwords'}
                </button>
              </div>
              
              <div className="text-sm text-gray-500">
                {filteredEntries.length} of {entries.length} passwords
              </div>
            </div>
          )}
        </div>

        {/* Password Entries */}
        <div className="space-y-6">
          {filteredEntries.length === 0 ? (
            <div className="text-center py-12">
              <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {entries.length === 0 ? 'No passwords saved yet' : 'No passwords found'}
              </h3>
              <p className="text-gray-500 mb-6">
                {entries.length === 0
                  ? 'Start by adding your first password or create some examples to get started.'
                  : 'Try adjusting your search terms or browse all passwords.'}
              </p>
              <div className="flex items-center justify-center gap-4">
                {entries.length === 0 && (
                  <>
                    <button
                      onClick={handleAddPassword}
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Add Your First Password
                    </button>
                    <button
                      onClick={handleCreateExamples}
                      className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      Create Examples
                    </button>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredEntries.map(entry => (
                <PasswordEntry
                  key={entry.id}
                  entry={entry}
                  onEdit={handleEditPassword}
                  onDelete={handleDeletePassword}
                  globalShowPasswords={showAllPasswords}
                />
              ))}
            </div>
          )}
        </div>

        {/* Auto-lock Timer */}
        <div className="fixed bottom-4 right-4">
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-3 flex items-center gap-2 text-sm text-gray-600">
            <Clock className="w-4 h-4" />
            <span>Auto-lock in {Math.max(0, Math.ceil((LOCK_TIMEOUT - (Date.now() - lastActivity)) / 1000 / 60))} min</span>
          </div>
        </div>
      </main>

      {/* Password Form Modal */}
      {showForm && (
        <PasswordForm
          entry={selectedEntry}
          onSave={handleSavePassword}
          onCancel={() => {
            setShowForm(false);
            setSelectedEntry(null);
          }}
        />
      )}
    </div>
  );
}

export default App;