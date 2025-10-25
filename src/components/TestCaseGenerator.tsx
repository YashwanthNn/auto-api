import React, { useState } from 'react';
import { Wand2, Settings, RefreshCw } from 'lucide-react';
import { ApiSpec, TestCase } from '../App';

interface Props {
  apiSpec: ApiSpec;
  onTestCasesGenerated: (testCases: TestCase[]) => void;
}

const TestCaseGenerator: React.FC<Props> = ({ apiSpec, onTestCasesGenerated }) => {
  const [generating, setGenerating] = useState(false);
  const [settings, setSettings] = useState({
    includePositive: true,
    includeNegative: true,
    includeBoundary: true,
    includeSecurity: false,
    includePerformance: false,
    maxTestsPerEndpoint: 5,
    generateEdgeCases: true,
  });

  const generateTestCases = async () => {
    setGenerating(true);
    
    // Simulate AI generation delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const testCases: TestCase[] = [];
    let testId = 1;

    Object.entries(apiSpec.paths).forEach(([path, pathItem]) => {
      Object.entries(pathItem).forEach(([method, operation]: [string, any]) => {
        if (!['get', 'post', 'put', 'patch', 'delete'].includes(method)) return;

        // Generate positive test cases
        if (settings.includePositive) {
          testCases.push({
            id: `test-${testId++}`,
            name: `${method.toUpperCase()} ${path} - Success Case`,
            description: `Verify successful ${method.toUpperCase()} request to ${path}`,
            category: 'positive',
            method: method.toUpperCase(),
            endpoint: path,
            scenario: `Should return success when making valid ${method.toUpperCase()} request`,
            expectedStatus: 200,
            testData: method === 'post' || method === 'put' ? generateValidTestData(operation, apiSpec) : null,
            assertions: [
              'response.status).toBe(200',
              'response.body).toBeDefined(',
              'response.headers["content-type"]).toMatch(/json/)'
            ],
            priority: 'high',
            tags: ['api', 'success', method]
          });
        }

        // Generate negative test cases
        if (settings.includeNegative) {
          testCases.push({
            id: `test-${testId++}`,
            name: `${method.toUpperCase()} ${path} - Invalid Request`,
            description: `Verify proper error handling for invalid ${method.toUpperCase()} request`,
            category: 'negative',
            method: method.toUpperCase(),
            endpoint: path,
            scenario: 'Should return error when making invalid request',
            expectedStatus: 400,
            testData: method === 'post' || method === 'put' ? { invalidField: 'invalid_value' } : null,
            assertions: [
              'response.status).toBe(400',
              'response.body.error).toBeDefined(',
              'response.body.message).toContain("validation")'
            ],
            priority: 'high',
            tags: ['api', 'error', 'validation', method]
          });
        }

        // Generate boundary test cases
        if (settings.includeBoundary && path.includes('{')) {
          testCases.push({
            id: `test-${testId++}`,
            name: `${method.toUpperCase()} ${path} - Not Found`,
            description: `Verify 404 response for non-existent resource`,
            category: 'boundary',
            method: method.toUpperCase(),
            endpoint: path.replace(/\{[^}]+\}/g, 'nonexistent'),
            scenario: 'Should return 404 when resource does not exist',
            expectedStatus: 404,
            testData: null,
            assertions: [
              'response.status).toBe(404',
              'response.body.error).toBeDefined(',
              'response.body.message).toContain("not found")'
            ],
            priority: 'medium',
            tags: ['api', 'boundary', '404', method]
          });
        }

        // Generate security test cases
        if (settings.includeSecurity) {
          testCases.push({
            id: `test-${testId++}`,
            name: `${method.toUpperCase()} ${path} - Unauthorized Access`,
            description: `Verify authentication is required for ${path}`,
            category: 'security',
            method: method.toUpperCase(),
            endpoint: path,
            scenario: 'Should return 401 when no authentication provided',
            expectedStatus: 401,
            testData: null,
            assertions: [
              'response.status).toBe(401',
              'response.body.error).toBeDefined(',
              'response.headers["www-authenticate"]).toBeDefined('
            ],
            priority: 'high',
            tags: ['api', 'security', 'authentication', method]
          });
        }

        // Generate performance test cases
        if (settings.includePerformance && method === 'get') {
          testCases.push({
            id: `test-${testId++}`,
            name: `${method.toUpperCase()} ${path} - Response Time`,
            description: `Verify ${path} responds within acceptable time`,
            category: 'performance',
            method: method.toUpperCase(),
            endpoint: path,
            scenario: 'Should respond within 2 seconds',
            expectedStatus: 200,
            testData: null,
            assertions: [
              'response.status).toBe(200',
              'response.duration).toBeLessThan(2000',
              'response.body).toBeDefined('
            ],
            priority: 'low',
            tags: ['api', 'performance', 'timing', method]
          });
        }
      });
    });

    setGenerating(false);
    onTestCasesGenerated(testCases);
  };

  const generateValidTestData = (operation: any, spec: ApiSpec) => {
    // Simple test data generation based on schema
    if (operation.requestBody?.content?.['application/json']?.schema) {
      const schema = operation.requestBody.content['application/json'].schema;
      
      if (schema.$ref) {
        const schemaName = schema.$ref.split('/').pop();
        const schemaDefinition = spec.components?.schemas?.[schemaName];
        
        if (schemaDefinition?.properties) {
          const testData: any = {};
          Object.entries(schemaDefinition.properties).forEach(([key, prop]: [string, any]) => {
            switch (prop.type) {
              case 'string':
                testData[key] = prop.example || `test_${key}`;
                break;
              case 'integer':
                testData[key] = prop.example || 123;
                break;
              case 'boolean':
                testData[key] = prop.example !== undefined ? prop.example : true;
                break;
              default:
                testData[key] = prop.example || `test_${key}`;
            }
          });
          return testData;
        }
      }
    }
    
    return { name: 'test_data', value: 'example' };
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">AI Test Generation</h3>
          <p className="text-gray-600 mt-1">Configure and generate intelligent test cases</p>
        </div>
        <button
          onClick={generateTestCases}
          disabled={generating}
          className={`inline-flex items-center px-4 py-2 rounded-lg transition-colors ${
            generating
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-indigo-600 text-white hover:bg-indigo-700'
          }`}
        >
          {generating ? (
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Wand2 className="w-4 h-4 mr-2" />
          )}
          {generating ? 'Generating...' : 'Generate Tests'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <label className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={settings.includePositive}
            onChange={(e) => setSettings(prev => ({ ...prev, includePositive: e.target.checked }))}
            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          <span className="text-sm font-medium text-gray-700">Positive Tests</span>
        </label>

        <label className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={settings.includeNegative}
            onChange={(e) => setSettings(prev => ({ ...prev, includeNegative: e.target.checked }))}
            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          <span className="text-sm font-medium text-gray-700">Negative Tests</span>
        </label>

        <label className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={settings.includeBoundary}
            onChange={(e) => setSettings(prev => ({ ...prev, includeBoundary: e.target.checked }))}
            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          <span className="text-sm font-medium text-gray-700">Boundary Tests</span>
        </label>

        <label className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={settings.includeSecurity}
            onChange={(e) => setSettings(prev => ({ ...prev, includeSecurity: e.target.checked }))}
            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          <span className="text-sm font-medium text-gray-700">Security Tests</span>
        </label>

        <label className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={settings.includePerformance}
            onChange={(e) => setSettings(prev => ({ ...prev, includePerformance: e.target.checked }))}
            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          <span className="text-sm font-medium text-gray-700">Performance Tests</span>
        </label>

        <label className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={settings.generateEdgeCases}
            onChange={(e) => setSettings(prev => ({ ...prev, generateEdgeCases: e.target.checked }))}
            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          <span className="text-sm font-medium text-gray-700">Edge Cases</span>
        </label>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Max Tests per Endpoint
        </label>
        <input
          type="number"
          min="1"
          max="10"
          value={settings.maxTestsPerEndpoint}
          onChange={(e) => setSettings(prev => ({ ...prev, maxTestsPerEndpoint: parseInt(e.target.value) }))}
          className="w-32 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>
    </div>
  );
};

export default TestCaseGenerator;