import React, { useState } from 'react';
import { Eye, EyeOff, Copy, Edit, Trash2, Check, ExternalLink } from 'lucide-react';
import { PasswordEntry as PasswordEntryType } from '../types';

interface PasswordEntryProps {
  entry: PasswordEntryType;
  onEdit: (entry: PasswordEntryType) => void;
  onDelete: (id: string) => void;
  globalShowPasswords: boolean;
}

export const PasswordEntry: React.FC<PasswordEntryProps> = ({ 
  entry, 
  onEdit, 
  onDelete, 
  globalShowPasswords 
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState<'username' | 'password' | null>(null);

  const copyToClipboard = async (text: string, type: 'username' | 'password') => {
    await navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const openUrl = () => {
    if (entry.url) {
      window.open(entry.url.startsWith('http') ? entry.url : `https://${entry.url}`, '_blank');
    }
  };

  const shouldShowPassword = globalShowPasswords || showPassword;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{entry.service}</h3>
          <p className="text-sm text-gray-500">
            Updated {entry.updatedAt.toLocaleDateString()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {entry.url && (
            <button
              onClick={openUrl}
              className="p-2 text-gray-500 hover:text-blue-600 rounded-lg hover:bg-gray-100 transition-colors"
              title="Open URL"
            >
              <ExternalLink className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => onEdit(entry)}
            className="p-2 text-gray-500 hover:text-blue-600 rounded-lg hover:bg-gray-100 transition-colors"
            title="Edit entry"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(entry.id)}
            className="p-2 text-gray-500 hover:text-red-600 rounded-lg hover:bg-gray-100 transition-colors"
            title="Delete entry"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {/* Username */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={entry.username}
              readOnly
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm"
            />
            <button
              onClick={() => copyToClipboard(entry.username, 'username')}
              className="p-2 text-gray-500 hover:text-blue-600 rounded-lg hover:bg-gray-100 transition-colors"
              title="Copy username"
            >
              {copied === 'username' ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <div className="flex items-center gap-2">
            <input
              type={shouldShowPassword ? 'text' : 'password'}
              value={entry.password}
              readOnly
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm font-mono"
            />
            <button
              onClick={() => setShowPassword(!showPassword)}
              className="p-2 text-gray-500 hover:text-blue-600 rounded-lg hover:bg-gray-100 transition-colors"
              title="Toggle password visibility"
            >
              {shouldShowPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
            <button
              onClick={() => copyToClipboard(entry.password, 'password')}
              className="p-2 text-gray-500 hover:text-blue-600 rounded-lg hover:bg-gray-100 transition-colors"
              title="Copy password"
            >
              {copied === 'password' ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* URL */}
        {entry.url && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
            <input
              type="text"
              value={entry.url}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm"
            />
          </div>
        )}

        {/* Notes */}
        {entry.notes && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              value={entry.notes}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm resize-none"
              rows={2}
            />
          </div>
        )}
      </div>
    </div>
  );
};