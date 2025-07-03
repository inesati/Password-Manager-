import React, { useState } from 'react';
import { Shield, Plus, Download, Upload, Settings, LogOut, Lock, Database } from 'lucide-react';

interface HeaderProps {
  onAddPassword: () => void;
  onLock: () => void;
  onExportData: () => void;
  onImportData: (file: File) => void;
  onCreateExamples: () => void;
  entriesCount: number;
}

export const Header: React.FC<HeaderProps> = ({ 
  onAddPassword, 
  onLock, 
  onExportData, 
  onImportData, 
  onCreateExamples,
  entriesCount 
}) => {
  const [showMenu, setShowMenu] = useState(false);

  const handleImportClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        onImportData(file);
      }
    };
    input.click();
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Title */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">SecurePass</h1>
              <p className="text-sm text-gray-500">{entriesCount} passwords stored</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={onAddPassword}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Password
            </button>

            {/* Settings Menu */}
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Settings className="w-5 h-5" />
              </button>

              {showMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  <div className="py-1">
                    <button
                      onClick={() => {
                        onCreateExamples();
                        setShowMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                    >
                      <Database className="w-4 h-4" />
                      Create Example Passwords
                    </button>
                    <hr className="my-1" />
                    <button
                      onClick={() => {
                        onExportData();
                        setShowMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Export Backup
                    </button>
                    <button
                      onClick={() => {
                        handleImportClick();
                        setShowMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      Import Backup
                    </button>
                    <hr className="my-1" />
                    <button
                      onClick={() => {
                        onLock();
                        setShowMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                    >
                      <Lock className="w-4 h-4" />
                      Lock Application
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};