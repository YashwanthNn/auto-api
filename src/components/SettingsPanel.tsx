import React, { useState } from 'react';
import { X, Save, RotateCcw } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsPanel: React.FC<Props> = ({ isOpen, onClose }) => {
  const [settings, setSettings] = useState({
    // AI Generation Settings
    aiProvider: 'openai',
    maxTokens: 2000,
    temperature: 0.7,
    
    // Test Generation Settings
    defaultTestFramework: 'jest',
    includeTypeScript: true,
    generateDocumentation: true,
    useDataDrivenTests: false,
    
    // Code Style Settings
    indentSize: 2,
    useESLint: true,
    usePrettier: true,
    
    // Output Settings
    fileNamingConvention: 'kebab-case',
    testFileExtension: '.test.js',
    includeImports: true,
  });

  const handleSave = () => {
    // Save settings to localStorage or API
    localStorage.setItem('apiTestGeneratorSettings', JSON.stringify(settings));
    onClose();
  };

  const handleReset = () => {
    setSettings({
      aiProvider: 'openai',
      maxTokens: 2000,
      temperature: 0.7,
      defaultTestFramework: 'jest',
      includeTypeScript: true,
      generateDocumentation: true,
      useDataDrivenTests: false,
      indentSize: 2,
      useESLint: true,
      usePrettier: true,
      fileNamingConvention: 'kebab-case',
      testFileExtension: '.test.js',
      includeImports: true,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="space-y-8">
            {/* AI Generation Settings */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Generation</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    AI Provider
                  </label>
                  <select
                    value={settings.aiProvider}
                    onChange={(e) => setSettings(prev => ({ ...prev, aiProvider: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="openai">OpenAI GPT</option>
                    <option value="anthropic">Anthropic Claude</option>
                    <option value="local">Local Model</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Tokens
                    </label>
                    <input
                      type="number"
                      min="500"
                      max="4000"
                      value={settings.maxTokens}
                      onChange={(e) => setSettings(prev => ({ ...prev, maxTokens: parseInt(e.target.value) }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Temperature
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="1"
                      step="0.1"
                      value={settings.temperature}
                      onChange={(e) => setSettings(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Test Generation Settings */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Test Generation</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Default Test Framework
                  </label>
                  <select
                    value={settings.defaultTestFramework}
                    onChange={(e) => setSettings(prev => ({ ...prev, defaultTestFramework: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="jest">Jest</option>
                    <option value="mocha">Mocha</option>
                    <option value="cypress">Cypress</option>
                    <option value="playwright">Playwright</option>
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={settings.includeTypeScript}
                      onChange={(e) => setSettings(prev => ({ ...prev, includeTypeScript: e.target.checked }))}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Generate TypeScript tests</span>
                  </label>

                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={settings.generateDocumentation}
                      onChange={(e) => setSettings(prev => ({ ...prev, generateDocumentation: e.target.checked }))}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Include test documentation</span>
                  </label>

                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={settings.useDataDrivenTests}
                      onChange={(e) => setSettings(prev => ({ ...prev, useDataDrivenTests: e.target.checked }))}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Use data-driven test patterns</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Code Style Settings */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Code Style</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Indent Size
                  </label>
                  <select
                    value={settings.indentSize}
                    onChange={(e) => setSettings(prev => ({ ...prev, indentSize: parseInt(e.target.value) }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value={2}>2 spaces</option>
                    <option value={4}>4 spaces</option>
                    <option value={8}>Tab character</option>
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={settings.useESLint}
                      onChange={(e) => setSettings(prev => ({ ...prev, useESLint: e.target.checked }))}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Use ESLint configuration</span>
                  </label>

                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={settings.usePrettier}
                      onChange={(e) => setSettings(prev => ({ ...prev, usePrettier: e.target.checked }))}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Use Prettier formatting</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Output Settings */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Output Settings</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      File Naming Convention
                    </label>
                    <select
                      value={settings.fileNamingConvention}
                      onChange={(e) => setSettings(prev => ({ ...prev, fileNamingConvention: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="kebab-case">kebab-case</option>
                      <option value="camelCase">camelCase</option>
                      <option value="snake_case">snake_case</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Test File Extension
                    </label>
                    <select
                      value={settings.testFileExtension}
                      onChange={(e) => setSettings(prev => ({ ...prev, testFileExtension: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value=".test.js">.test.js</option>
                      <option value=".test.ts">.test.ts</option>
                      <option value=".spec.js">.spec.js</option>
                      <option value=".spec.ts">.spec.ts</option>
                    </select>
                  </div>
                </div>

                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={settings.includeImports}
                    onChange={(e) => setSettings(prev => ({ ...prev, includeImports: e.target.checked }))}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Include import statements</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={handleReset}
            className="inline-flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset to Defaults
          </button>
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-900 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;