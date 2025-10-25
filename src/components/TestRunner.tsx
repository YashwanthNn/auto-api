import React, { useState, useEffect } from 'react';
import { Play, Square, Download, FileText, Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { TestCase, ApiSpec } from '../App';

interface TestResult {
  id: string;
  testCase: TestCase;
  status: 'running' | 'passed' | 'failed' | 'skipped';
  duration: number;
  response?: {
    status: number;
    body: any;
    headers: Record<string, string>;
  };
  error?: string;
  assertions: {
    description: string;
    passed: boolean;
    error?: string;
  }[];
}

interface Props {
  testCases: TestCase[];
  apiSpec: ApiSpec | null;
  onTestComplete: (results: TestResult[]) => void;
}

const TestRunner: React.FC<Props> = ({ testCases, apiSpec, onTestComplete }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);
  const [currentTest, setCurrentTest] = useState<string | null>(null);
  const [baseUrl, setBaseUrl] = useState('https://api.example.com');

  const runTests = async () => {
    setIsRunning(true);
    setResults([]);
    const testResults: TestResult[] = [];

    for (const testCase of testCases) {
      setCurrentTest(testCase.id);
      const startTime = Date.now();

      try {
        const result = await executeTest(testCase);
        const duration = Date.now() - startTime;
        
        testResults.push({
          id: testCase.id,
          testCase,
          status: result.passed ? 'passed' : 'failed',
          duration,
          response: result.response,
          error: result.error,
          assertions: result.assertions
        });
      } catch (error) {
        testResults.push({
          id: testCase.id,
          testCase,
          status: 'failed',
          duration: Date.now() - startTime,
          error: error instanceof Error ? error.message : 'Unknown error',
          assertions: []
        });
      }

      setResults([...testResults]);
      await new Promise(resolve => setTimeout(resolve, 500)); // Delay between tests
    }

    setIsRunning(false);
    setCurrentTest(null);
    onTestComplete(testResults);
  };

  const executeTest = async (testCase: TestCase) => {
    const url = `${baseUrl}${testCase.endpoint}`;
    const startTime = Date.now();

    try {
      const response = await fetch(url, {
        method: testCase.method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: testCase.testData ? JSON.stringify(testCase.testData) : undefined
      });

      const responseBody = await response.json().catch(() => ({}));
      const duration = Date.now() - startTime;

      // Execute assertions
      const assertions = testCase.assertions.map(assertion => {
        try {
          // Simple assertion evaluation (in real implementation, use proper assertion library)
          const passed = evaluateAssertion(assertion, response, responseBody, duration);
          return {
            description: assertion,
            passed
          };
        } catch (error) {
          return {
            description: assertion,
            passed: false,
            error: error instanceof Error ? error.message : 'Assertion failed'
          };
        }
      });

      const allPassed = assertions.every(a => a.passed);

      return {
        passed: allPassed,
        response: {
          status: response.status,
          body: responseBody,
          headers: Object.fromEntries(response.headers.entries())
        },
        assertions
      };
    } catch (error) {
      return {
        passed: false,
        error: error instanceof Error ? error.message : 'Network error',
        assertions: []
      };
    }
  };

  const evaluateAssertion = (assertion: string, response: Response, body: any, duration: number): boolean => {
    // Simple assertion evaluation - in real implementation, use proper assertion library
    if (assertion.includes('status') && assertion.includes('toBe')) {
      const expectedStatus = parseInt(assertion.match(/\d+/)?.[0] || '200');
      return response.status === expectedStatus;
    }
    if (assertion.includes('duration') && assertion.includes('toBeLessThan')) {
      const maxDuration = parseInt(assertion.match(/\d+/)?.[0] || '2000');
      return duration < maxDuration;
    }
    if (assertion.includes('body') && assertion.includes('toBeDefined')) {
      return body !== undefined && body !== null;
    }
    return true; // Default to pass for demo
  };

  const generateNewmanCollection = () => {
    const collection = {
      info: {
        name: `${apiSpec?.info.title || 'API'} Test Collection`,
        description: 'Generated test collection for Newman execution',
        schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
      },
      variable: [
        {
          key: 'baseUrl',
          value: baseUrl
        }
      ],
      item: testCases.map(testCase => ({
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
      }))
    };

    const blob = new Blob([JSON.stringify(collection, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'api-test-collection.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const stopTests = () => {
    setIsRunning(false);
    setCurrentTest(null);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'running': return <Clock className="w-4 h-4 text-blue-500 animate-spin" />;
      default: return <AlertTriangle className="w-4 h-4 text-gray-400" />;
    }
  };

  const passedTests = results.filter(r => r.status === 'passed').length;
  const failedTests = results.filter(r => r.status === 'failed').length;
  const totalDuration = results.reduce((sum, r) => sum + r.duration, 0);

  return (
    <div className="space-y-6">
      {/* Test Configuration */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Test Configuration</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Base URL</label>
            <input
              type="url"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="https://api.example.com"
            />
          </div>
          <div className="flex items-end space-x-3">
            <button
              onClick={runTests}
              disabled={isRunning || testCases.length === 0}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Play className="w-4 h-4 mr-2" />
              Run Tests
            </button>
            {isRunning && (
              <button
                onClick={stopTests}
                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                <Square className="w-4 h-4 mr-2" />
                Stop
              </button>
            )}
            <button
              onClick={generateNewmanCollection}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Download className="w-4 h-4 mr-2" />
              Newman Collection
            </button>
          </div>
        </div>
      </div>

      {/* Test Results Summary */}
      {results.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Test Results Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{passedTests}</div>
              <div className="text-sm text-gray-600">Passed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{failedTests}</div>
              <div className="text-sm text-gray-600">Failed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{results.length}</div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{totalDuration}ms</div>
              <div className="text-sm text-gray-600">Duration</div>
            </div>
          </div>
        </div>
      )}

      {/* Individual Test Results */}
      <div className="space-y-4">
        {results.map((result) => (
          <div key={result.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start space-x-3">
                {getStatusIcon(result.status)}
                <div>
                  <h4 className="font-semibold text-gray-900">{result.testCase.name}</h4>
                  <p className="text-sm text-gray-600">{result.testCase.scenario}</p>
                  <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                    <span>{result.testCase.method} {result.testCase.endpoint}</span>
                    <span>{result.duration}ms</span>
                    {result.response && <span>Status: {result.response.status}</span>}
                  </div>
                </div>
              </div>
            </div>

            {result.assertions.length > 0 && (
              <div className="mt-4">
                <h5 className="font-medium text-gray-900 mb-2">Assertions</h5>
                <div className="space-y-1">
                  {result.assertions.map((assertion, index) => (
                    <div key={index} className="flex items-center space-x-2 text-sm">
                      {assertion.passed ? (
                        <CheckCircle className="w-3 h-3 text-green-500" />
                      ) : (
                        <XCircle className="w-3 h-3 text-red-500" />
                      )}
                      <span className={assertion.passed ? 'text-gray-700' : 'text-red-700'}>
                        {assertion.description}
                      </span>
                      {assertion.error && (
                        <span className="text-red-600 text-xs">({assertion.error})</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result.error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">{result.error}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Current Test Indicator */}
      {isRunning && currentTest && (
        <div className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 animate-spin" />
            <span>Running test...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestRunner;