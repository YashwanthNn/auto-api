import React, { useState } from 'react';
import { X, Download, Copy, CheckCircle, Code, FileText, Terminal, Globe } from 'lucide-react';
import { TestCase, ApiSpec } from '../App';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  testCases: TestCase[];
  apiSpec: ApiSpec | null;
}

const CodeExporter: React.FC<Props> = ({ isOpen, onClose, testCases, apiSpec }) => {
  const [selectedFormat, setSelectedFormat] = useState('jest');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [copySuccess, setCopySuccess] = useState(false);

  const formats = [
    { id: 'jest', name: 'Jest Tests', icon: Code, description: 'JavaScript testing framework' },
    { id: 'cypress', name: 'Cypress Tests', icon: Globe, description: 'E2E testing framework' },
    { id: 'postman', name: 'Postman Collection', icon: FileText, description: 'API testing collection' },
    { id: 'curl', name: 'cURL Commands', icon: Terminal, description: 'Command line requests' },
  ];

  const categories = ['all', 'positive', 'negative', 'boundary', 'security', 'performance'];

  const filteredTestCases = selectedCategory === 'all' 
    ? testCases 
    : testCases.filter(tc => tc.category === selectedCategory);

  const generateJestCode = (cases: TestCase[]) => {
    const imports = `import request from 'supertest';
import app from '../app';

describe('${apiSpec?.info.title || 'API'} Tests', () => {`;

    const tests = cases.map(testCase => `
  describe('${testCase.name}', () => {
    test('${testCase.scenario}', async () => {
      const response = await request(app)
        .${testCase.method.toLowerCase()}('${testCase.endpoint}')${testCase.testData ? `
        .send(${JSON.stringify(testCase.testData, null, 8)})` : ''}
        .expect(${testCase.expectedStatus});
      
      ${testCase.assertions.map(assertion => `expect(${assertion});`).join('\n      ')}
    });
  });`).join('\n');

    return imports + tests + '\n});';
  };

  const generateCypressCode = (cases: TestCase[]) => {
    return `describe('${apiSpec?.info.title || 'API'} Tests', () => {
${cases.map(testCase => `
  it('${testCase.scenario}', () => {
    cy.request({
      method: '${testCase.method}',
      url: '${testCase.endpoint}',${testCase.testData ? `
      body: ${JSON.stringify(testCase.testData, null, 6)},` : ''}
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(${testCase.expectedStatus});
      ${testCase.assertions.map(assertion => `// ${assertion}`).join('\n      ')}
    });
  });`).join('')}
});`;
  };

  const generatePostmanCollection = (cases: TestCase[]) => {
    const collection = {
      info: {
        name: `${apiSpec?.info.title || 'API'} Test Collection`,
        description: `Auto-generated test collection for ${apiSpec?.info.title || 'API'}`,
        version: apiSpec?.info.version || '1.0.0'
      },
      item: cases.map(testCase => ({
        name: testCase.name,
        request: {
          method: testCase.method,
          header: testCase.testData ? [
            { key: 'Content-Type', value: 'application/json' }
          ] : [],
          body: testCase.testData ? {
            mode: 'raw',
            raw: JSON.stringify(testCase.testData, null, 2)
          } : undefined,
          url: {
            raw: `{{baseUrl}}${testCase.endpoint}`,
            host: ['{{baseUrl}}'],
            path: testCase.endpoint.split('/').filter(p => p)
          }
        },
        event: [
          {
            listen: 'test',
            script: {
              exec: [
                `pm.test("${testCase.scenario}", function () {`,
                `    pm.response.to.have.status(${testCase.expectedStatus});`,
                ...testCase.assertions.map(assertion => `    // ${assertion}`),
                '});'
              ]
            }
          }
        ]
      })),
      variable: [
        {
          key: 'baseUrl',
          value: 'https://api.example.com'
        }
      ]
    };

    return JSON.stringify(collection, null, 2);
  };

  const generateCurlCommands = (cases: TestCase[]) => {
    return cases.map(testCase => {
      let curlCmd = `# ${testCase.name}\n# ${testCase.scenario}\n`;
      curlCmd += `curl -X ${testCase.method} \\\n`;
      curlCmd += `  "https://api.example.com${testCase.endpoint}" \\\n`;
      
      if (testCase.testData) {
        curlCmd += `  -H "Content-Type: application/json" \\\n`;
        curlCmd += `  -d '${JSON.stringify(testCase.testData)}' \\\n`;
      }
      
      curlCmd += `  -w "HTTP Status: %{http_code}\\n"`;
      
      return curlCmd;
    }).join('\n\n');
  };

  const generateCIConfig = () => {
    return `# GitHub Actions CI/CD Pipeline for API Tests
name: API Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      api:
        image: your-api-image:latest
        ports:
          - 3000:3000
        env:
          NODE_ENV: test
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Wait for API to be ready
      run: |
        timeout 60 bash -c 'until curl -f http://localhost:3000/health; do sleep 2; done'
    
    - name: Run API tests
      run: npm test
      env:
        API_BASE_URL: http://localhost:3000
    
    - name: Upload test results
      uses: actions/upload-artifact@v3
      if: always()
      with:
        name: test-results
        path: test-results.xml`;
  };

  const getGeneratedCode = () => {
    switch (selectedFormat) {
      case 'jest': return generateJestCode(filteredTestCases);
      case 'cypress': return generateCypressCode(filteredTestCases);
      case 'postman': return generatePostmanCollection(filteredTestCases);
      case 'curl': return generateCurlCommands(filteredTestCases);
      default: return '';
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(getGeneratedCode());
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const downloadCode = () => {
    const code = getGeneratedCode();
    const extensions = {
      jest: 'test.js',
      cypress: 'cy.js',
      postman: 'json',
      curl: 'sh'
    };
    
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `api-tests.${extensions[selectedFormat as keyof typeof extensions]}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Export Test Cases</h2>
            <p className="text-gray-600 mt-1">Generate test code in your preferred format</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        <div className="flex h-[calc(90vh-120px)]">
          {/* Sidebar */}
          <div className="w-80 border-r border-gray-200 p-6 space-y-6 overflow-y-auto">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Export Format</h3>
              <div className="space-y-2">
                {formats.map((format) => {
                  const Icon = format.icon;
                  return (
                    <button
                      key={format.id}
                      onClick={() => setSelectedFormat(format.id)}
                      className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors text-left ${
                        selectedFormat === format.id
                          ? 'bg-indigo-50 border border-indigo-200 text-indigo-700'
                          : 'hover:bg-gray-50 text-gray-700 border border-gray-200'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <div>
                        <div className="font-medium">{format.name}</div>
                        <div className="text-xs opacity-70">{format.description}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Test Categories</h3>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="all">All Categories ({testCases.length})</option>
                {categories.slice(1).map(category => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)} Tests 
                    ({testCases.filter(tc => tc.category === category).length})
                  </option>
                ))}
              </select>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">Export Summary</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <div>Selected Tests: {filteredTestCases.length}</div>
                <div>Format: {formats.find(f => f.id === selectedFormat)?.name}</div>
                <div>Category: {selectedCategory === 'all' ? 'All' : selectedCategory}</div>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={copyToClipboard}
                className={`w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg transition-colors ${
                  copySuccess
                    ? 'bg-green-100 text-green-700 border border-green-200'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
              >
                {copySuccess ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copySuccess ? 'Copied!' : 'Copy to Clipboard'}</span>
              </button>
              
              <button
                onClick={downloadCode}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Download File</span>
              </button>
            </div>
          </div>

          {/* Code Preview */}
          <div className="flex-1 p-6 overflow-hidden">
            <div className="h-full flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Generated Code</h3>
                <span className="text-sm text-gray-500">
                  {filteredTestCases.length} test{filteredTestCases.length !== 1 ? 's' : ''}
                </span>
              </div>
              
              <div className="flex-1 bg-gray-900 rounded-lg p-4 overflow-auto">
                <pre className="text-green-400 text-sm">
                  <code>{getGeneratedCode()}</code>
                </pre>
              </div>
            </div>
          </div>
        </div>

        {/* CI/CD Integration */}
        <div className="border-t border-gray-200 p-6">
          <details className="group">
            <summary className="cursor-pointer flex items-center space-x-2 text-gray-700 hover:text-gray-900">
              <span className="font-medium">CI/CD Integration Template</span>
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">GitHub Actions</span>
            </summary>
            <div className="mt-4 bg-gray-900 rounded-lg p-4 overflow-x-auto">
              <pre className="text-green-400 text-sm">
                <code>{generateCIConfig()}</code>
              </pre>
            </div>
          </details>
        </div>
      </div>
    </div>
  );
};

export default CodeExporter;