import React, { useState } from 'react';
import { Shuffle, Copy, Check, Settings } from 'lucide-react';
import { generateSecurePassword } from '../utils/crypto';

interface PasswordGeneratorProps {
  onPasswordGenerated: (password: string) => void;
}

export const PasswordGenerator: React.FC<PasswordGeneratorProps> = ({ onPasswordGenerated }) => {
  const [password, setPassword] = useState('');
  const [length, setLength] = useState(16);
  const [options, setOptions] = useState({
    includeUppercase: true,
    includeLowercase: true,
    includeNumbers: true,
    includeSymbols: true,
    excludeSimilar: false
  });
  const [copied, setCopied] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const generatePassword = () => {
    try {
      const newPassword = generateSecurePassword({ length, ...options });
      setPassword(newPassword);
      onPasswordGenerated(newPassword);
    } catch (error) {
      console.error('Failed to generate password:', error);
    }
  };

  const copyToClipboard = async () => {
    if (password) {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getStrengthColor = () => {
    if (length < 8) return 'text-red-600';
    if (length < 12) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getStrengthText = () => {
    if (length < 8) return 'Weak';
    if (length < 12) return 'Medium';
    return 'Strong';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Password Generator</h3>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-4">
        {/* Generated Password Display */}
        <div className="relative">
          <input
            type="text"
            value={password}
            readOnly
            className="w-full pr-20 py-3 px-4 border border-gray-300 rounded-lg bg-gray-50 font-mono text-sm"
            placeholder="Generated password will appear here"
          />
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-1">
            <button
              onClick={copyToClipboard}
              disabled={!password}
              className="p-1.5 text-gray-500 hover:text-gray-700 rounded hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
            <button
              onClick={generatePassword}
              className="p-1.5 text-blue-600 hover:text-blue-700 rounded hover:bg-blue-50 transition-colors"
            >
              <Shuffle className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Password Strength */}
        {password && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Strength:</span>
            <span className={`text-sm font-medium ${getStrengthColor()}`}>
              {getStrengthText()}
            </span>
          </div>
        )}

        {/* Settings Panel */}
        {showSettings && (
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            {/* Length Slider */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Length: {length}
              </label>
              <input
                type="range"
                min="4"
                max="128"
                value={length}
                onChange={(e) => setLength(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Character Type Options */}
            <div className="grid grid-cols-2 gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.includeUppercase}
                  onChange={(e) => setOptions({ ...options, includeUppercase: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Uppercase (A-Z)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.includeLowercase}
                  onChange={(e) => setOptions({ ...options, includeLowercase: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Lowercase (a-z)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.includeNumbers}
                  onChange={(e) => setOptions({ ...options, includeNumbers: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Numbers (0-9)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.includeSymbols}
                  onChange={(e) => setOptions({ ...options, includeSymbols: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Symbols (!@#$)</span>
              </label>
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={options.excludeSimilar}
                onChange={(e) => setOptions({ ...options, excludeSimilar: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Exclude similar characters (il1Lo0O)</span>
            </label>
          </div>
        )}

        {/* Generate Button */}
        <button
          onClick={generatePassword}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all"
        >
          Generate Password
        </button>
      </div>
    </div>
  );
};