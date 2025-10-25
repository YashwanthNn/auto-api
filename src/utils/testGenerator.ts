import { ApiSpec, TestCase } from '../App';

export const generateTestCases = (apiSpec: ApiSpec): TestCase[] => {
  const testCases: TestCase[] = [];
  let testId = 1;

  Object.entries(apiSpec.paths).forEach(([path, pathItem]) => {
    Object.entries(pathItem).forEach(([method, operation]: [string, any]) => {
      if (!['get', 'post', 'put', 'patch', 'delete'].includes(method)) return;

      const methodUpper = method.toUpperCase();
      const operationId = operation.operationId || `${method}${path.replace(/[^a-zA-Z0-9]/g, '')}`;

      // Positive test cases
      testCases.push({
        id: `test-${testId++}`,
        name: `${methodUpper} ${path} - Success`,
        description: `Verify successful ${methodUpper} request to ${path} returns expected response`,
        category: 'positive',
        method: methodUpper,
        endpoint: path,
        scenario: `Valid ${methodUpper} request should return success response`,
        expectedStatus: getSuccessStatus(method),
        testData: generateValidTestData(operation, method, apiSpec),
        assertions: generatePositiveAssertions(operation, method),
        priority: 'high',
        tags: ['api', 'success', method, 'crud']
      });

      // Negative test cases - Invalid data
      if (['post', 'put', 'patch'].includes(method)) {
        testCases.push({
          id: `test-${testId++}`,
          name: `${methodUpper} ${path} - Invalid Data`,
          description: `Verify proper validation error handling for invalid request data`,
          category: 'negative',
          method: methodUpper,
          endpoint: path,
          scenario: 'Request with invalid data should return validation error',
          expectedStatus: 400,
          testData: generateInvalidTestData(operation, apiSpec),
          assertions: [
            'response.status).toBe(400',
            'response.body.error).toBeDefined(',
            'response.body.message).toContain("validation")',
            'response.body.details).toBeInstanceOf(Array)'
          ],
          priority: 'high',
          tags: ['api', 'validation', 'error', method]
        });

        // Missing required fields
        testCases.push({
          id: `test-${testId++}`,
          name: `${methodUpper} ${path} - Missing Required Fields`,
          description: `Verify error when required fields are missing from request`,
          category: 'negative',
          method: methodUpper,
          endpoint: path,
          scenario: 'Request missing required fields should return validation error',
          expectedStatus: 400,
          testData: {},
          assertions: [
            'response.status).toBe(400',
            'response.body.error).toContain("required")',
            'response.body.message).toBeDefined('
          ],
          priority: 'high',
          tags: ['api', 'validation', 'required-fields', method]
        });
      }

      // Boundary test cases - Resource not found
      if (path.includes('{') && ['get', 'put', 'patch', 'delete'].includes(method)) {
        testCases.push({
          id: `test-${testId++}`,
          name: `${methodUpper} ${path} - Resource Not Found`,
          description: `Verify 404 response when requested resource does not exist`,
          category: 'boundary',
          method: methodUpper,
          endpoint: path.replace(/\{[^}]+\}/g, '99999'),
          scenario: 'Request for non-existent resource should return 404',
          expectedStatus: 404,
          testData: method === 'put' || method === 'patch' ? generateValidTestData(operation, method, apiSpec) : null,
          assertions: [
            'response.status).toBe(404',
            'response.body.error).toContain("not found")',
            'response.body.message).toBeDefined('
          ],
          priority: 'medium',
          tags: ['api', 'boundary', '404', method]
        });
      }

      // Edge case - Empty string parameters
      if (path.includes('{') && method === 'get') {
        testCases.push({
          id: `test-${testId++}`,
          name: `${methodUpper} ${path} - Empty Parameter`,
          description: `Verify handling of empty string in path parameter`,
          category: 'boundary',
          method: methodUpper,
          endpoint: path.replace(/\{[^}]+\}/g, ''),
          scenario: 'Request with empty path parameter should be handled gracefully',
          expectedStatus: 400,
          testData: null,
          assertions: [
            'response.status).toBe(400',
            'response.body.error).toBeDefined(',
          ],
          priority: 'low',
          tags: ['api', 'boundary', 'empty-params', method]
        });
      }

      // Security test cases - Unauthorized access
      testCases.push({
        id: `test-${testId++}`,
        name: `${methodUpper} ${path} - Unauthorized Access`,
        description: `Verify authentication is required for accessing ${path}`,
        category: 'security',
        method: methodUpper,
        endpoint: path,
        scenario: 'Request without authentication should return 401',
        expectedStatus: 401,
        testData: null,
        assertions: [
          'response.status).toBe(401',
          'response.body.error).toContain("unauthorized")',
          'response.headers["www-authenticate"]).toBeDefined('
        ],
        priority: 'high',
        tags: ['api', 'security', 'authentication', method]
      });

      // Security - SQL Injection attempt
      if (['post', 'put', 'patch'].includes(method)) {
        testCases.push({
          id: `test-${testId++}`,
          name: `${methodUpper} ${path} - SQL Injection Protection`,
          description: `Verify protection against SQL injection attacks`,
          category: 'security',
          method: methodUpper,
          endpoint: path,
          scenario: 'Malicious SQL injection payload should be rejected',
          expectedStatus: 400,
          testData: {
            name: "'; DROP TABLE users; --",
            email: "admin'--",
            description: "1' OR '1'='1"
          },
          assertions: [
            'response.status).toBe(400',
            'response.body.error).toBeDefined(',
            'response.body).not.toContain("SQL")'
          ],
          priority: 'high',
          tags: ['api', 'security', 'sql-injection', method]
        });
      }

      // Performance test cases - Response time
      if (method === 'get') {
        testCases.push({
          id: `test-${testId++}`,
          name: `${methodUpper} ${path} - Response Time`,
          description: `Verify ${path} endpoint responds within acceptable time limits`,
          category: 'performance',
          method: methodUpper,
          endpoint: path,
          scenario: 'Response should be received within 2 seconds',
          expectedStatus: getSuccessStatus(method),
          testData: null,
          assertions: [
            'response.status).toBe(' + getSuccessStatus(method),
            'response.duration).toBeLessThan(2000',
            'response.body).toBeDefined('
          ],
          priority: 'low',
          tags: ['api', 'performance', 'timing', method]
        });
      }

      // Load test for critical endpoints
      if (method === 'get' && (path.includes('users') || path.includes('products') || path === '/')) {
        testCases.push({
          id: `test-${testId++}`,
          name: `${methodUpper} ${path} - Concurrent Requests`,
          description: `Verify ${path} can handle multiple concurrent requests`,
          category: 'performance',
          method: methodUpper,
          endpoint: path,
          scenario: 'Should handle 10 concurrent requests without errors',
          expectedStatus: getSuccessStatus(method),
          testData: null,
          assertions: [
            'response.status).toBe(' + getSuccessStatus(method),
            'response.duration).toBeLessThan(5000',
            'response.body).toBeDefined('
          ],
          priority: 'medium',
          tags: ['api', 'performance', 'load', 'concurrent', method]
        });
      }

      // Content-Type validation
      if (['post', 'put', 'patch'].includes(method)) {
        testCases.push({
          id: `test-${testId++}`,
          name: `${methodUpper} ${path} - Invalid Content Type`,
          description: `Verify proper handling of incorrect Content-Type header`,
          category: 'negative',
          method: methodUpper,
          endpoint: path,
          scenario: 'Request with wrong content type should be rejected',
          expectedStatus: 415,
          testData: generateValidTestData(operation, method, apiSpec),
          assertions: [
            'response.status).toBe(415',
            'response.body.error).toContain("media type")',
            'response.body.message).toBeDefined('
          ],
          priority: 'medium',
          tags: ['api', 'content-type', 'headers', method]
        });
      }

      // Large payload test
      if (['post', 'put', 'patch'].includes(method)) {
        testCases.push({
          id: `test-${testId++}`,
          name: `${methodUpper} ${path} - Large Payload`,
          description: `Verify handling of large request payload`,
          category: 'boundary',
          method: methodUpper,
          endpoint: path,
          scenario: 'Large payload should be rejected with appropriate error',
          expectedStatus: 413,
          testData: {
            largeField: 'x'.repeat(10000),
            normalField: 'test'
          },
          assertions: [
            'response.status).toBe(413',
            'response.body.error).toContain("payload")',
          ],
          priority: 'low',
          tags: ['api', 'boundary', 'payload-size', method]
        });
      }
    });
  });

  return testCases;
};

const getSuccessStatus = (method: string): number => {
  switch (method.toLowerCase()) {
    case 'post': return 201;
    case 'delete': return 204;
    default: return 200;
  }
};

const generateValidTestData = (operation: any, method: string, apiSpec: ApiSpec) => {
  if (!['post', 'put', 'patch'].includes(method)) return null;

  const requestBody = operation.requestBody?.content?.['application/json']?.schema;
  if (!requestBody) return { name: 'test_item', status: 'active' };

  if (requestBody.$ref) {
    const schemaName = requestBody.$ref.split('/').pop();
    const schema = apiSpec.components?.schemas?.[schemaName];
    
    if (schema?.properties) {
      const testData: any = {};
      Object.entries(schema.properties).forEach(([key, prop]: [string, any]) => {
        testData[key] = generatePropertyValue(prop, key);
      });
      return testData;
    }
  }

  if (requestBody.properties) {
    const testData: any = {};
    Object.entries(requestBody.properties).forEach(([key, prop]: [string, any]) => {
      testData[key] = generatePropertyValue(prop, key);
    });
    return testData;
  }

  return { name: 'test_item', status: 'active' };
};

const generatePropertyValue = (prop: any, key: string) => {
  if (prop.example !== undefined) return prop.example;
  
  switch (prop.type) {
    case 'string':
      if (prop.format === 'email') return 'test@example.com';
      if (prop.format === 'date') return '2024-01-01';
      if (prop.format === 'date-time') return '2024-01-01T00:00:00Z';
      if (prop.enum) return prop.enum[0];
      return `test_${key}`;
    case 'integer':
      return prop.minimum || 1;
    case 'number':
      return prop.minimum || 1.0;
    case 'boolean':
      return true;
    case 'array':
      return ['item1', 'item2'];
    case 'object':
      return { nested: 'value' };
    default:
      return `test_${key}`;
  }
};

const generateInvalidTestData = (operation: any, apiSpec: ApiSpec) => {
  const validData = generateValidTestData(operation, 'post', apiSpec);
  if (!validData) return { invalid: 'data' };

  // Create invalid version of valid data
  const invalidData: any = { ...validData };
  Object.keys(invalidData).forEach(key => {
    if (typeof invalidData[key] === 'string') {
      invalidData[key] = null; // Invalid: null instead of string
    } else if (typeof invalidData[key] === 'number') {
      invalidData[key] = 'not_a_number'; // Invalid: string instead of number
    } else if (typeof invalidData[key] === 'boolean') {
      invalidData[key] = 'not_boolean'; // Invalid: string instead of boolean
    }
  });

  return invalidData;
};

const generatePositiveAssertions = (operation: any, method: string): string[] => {
  const assertions = [`response.status).toBe(${getSuccessStatus(method)}`];

  // Add response body assertions based on operation
  const responses = operation.responses;
  const successResponse = responses?.[getSuccessStatus(method)] || responses?.['200'];

  if (successResponse?.content?.['application/json']) {
    assertions.push('response.body).toBeDefined(');
    assertions.push('response.headers["content-type"]).toMatch(/json/)');
    
    if (method === 'get') {
      assertions.push('response.body).toHaveProperty("id")');
    }
    
    if (method === 'post') {
      assertions.push('response.body).toHaveProperty("id")');
      assertions.push('response.body.id).toBeDefined(');
    }
  }

  return assertions;
};