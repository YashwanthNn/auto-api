import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Play, Copy, ExternalLink, CheckCircle2, AlertTriangle, Shield, Zap, Target, Clock, Tag } from 'lucide-react';
import { TestCase } from '../App';

interface Props {
  testCases: TestCase[];
}

const TestCaseViewer: React.FC<Props> = ({ testCases }) => {
  const [expandedTest, setExpandedTest] = useState<string | null>(null);
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'positive': return CheckCircle2;
      case 'negative': return AlertTriangle;
      case 'boundary': return Target;
      case 'security': return Shield;
      case 'performance': return Zap;
      default: return CheckCircle2;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'positive': return 'text-green-600 bg-green-100';
      case 'negative': return 'text-red-600 bg-red-100';
      case 'boundary': return 'text-yellow-600 bg-yellow-100';
      case 'security': return 'text-blue-600 bg-blue-100';
      case 'performance': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const filteredTestCases = testCases.filter(testCase => {
    const matchesPriority = selectedPriority === 'all' || testCase.priority === selectedPriority;
    const matchesSearch = searchTerm === '' || 
      testCase.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      testCase.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      testCase.scenario.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesPriority && matchesSearch;
  });

  const copyTestCode = (testCase: TestCase) => {
    const testCode = generateJestTestCode(testCase);
    navigator.clipboard.writeText(testCode);
  };

  const generateJestTestCode = (testCase: TestCase) => {
    return `describe('${testCase.name}', () => {
  test('${testCase.scenario}', async () => {
    const response = await request(app)
      .${testCase.method.toLowerCase()}('${testCase.endpoint}')
      ${testCase.testData ? `.send(${JSON.stringify(testCase.testData, null, 6)})` : ''}
      .expect(${testCase.expectedStatus});
    
    ${testCase.assertions.map(assertion => `expect(${assertion});`).join('\n    ')}
  });
});`;
  };

  if (testCases.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
        <div className="text-gray-400 mb-4">
          <Play className="w-12 h-12 mx-auto" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Test Cases Generated</h3>
        <p className="text-gray-600">Upload an API specification to generate test cases automatically.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority Filter</label>
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="all">All Priorities</option>
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>
            </div>
          </div>
          
          <div className="flex-1 max-w-md">
            <label className="block text-sm font-medium text-gray-700 mb-1">Search Tests</label>
            <input
              type="text"
              placeholder="Search by name, description, or scenario..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
          <span>Showing {filteredTestCases.length} of {testCases.length} test cases</span>
          <div className="flex items-center space-x-4">
            <span>High: {testCases.filter(tc => tc.priority === 'high').length}</span>
            <span>Medium: {testCases.filter(tc => tc.priority === 'medium').length}</span>
            <span>Low: {testCases.filter(tc => tc.priority === 'low').length}</span>
          </div>
        </div>
      </div>

      {/* Test Cases */}
      <div className="space-y-4">
        {filteredTestCases.map((testCase) => {
          const Icon = getCategoryIcon(testCase.category);
          const isExpanded = expandedTest === testCase.id;
          
          return (
            <div key={testCase.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div 
                className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setExpandedTest(isExpanded ? null : testCase.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className={`p-2 rounded-lg ${getCategoryColor(testCase.category)}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">{testCase.name}</h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(testCase.priority)}`}>
                          {testCase.priority.toUpperCase()}
                        </span>
                      </div>
                      
                      <p className="text-gray-600 mb-3">{testCase.description}</p>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="flex items-center">
                          <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                            testCase.method === 'GET' ? 'bg-blue-500' :
                            testCase.method === 'POST' ? 'bg-green-500' :
                            testCase.method === 'PUT' ? 'bg-yellow-500' :
                            testCase.method === 'DELETE' ? 'bg-red-500' : 'bg-gray-500'
                          }`}></span>
                          {testCase.method} {testCase.endpoint}
                        </span>
                        <span>Status: {testCase.expectedStatus}</span>
                      </div>
                      
                      {testCase.tags.length > 0 && (
                        <div className="flex items-center flex-wrap gap-1 mt-3">
                          <Tag className="w-3 h-3 text-gray-400" />
                          {testCase.tags.map((tag, index) => (
                            <span key={index} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        copyTestCode(testCase);
                      }}
                      className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      title="Copy test code"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <div className="text-gray-400">
                      {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                    </div>
                  </div>
                </div>
              </div>

              {isExpanded && (
                <div className="border-t border-gray-200 p-6 bg-gray-50">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Test Scenario</h4>
                      <p className="text-gray-700 mb-4">{testCase.scenario}</p>
                      
                      <h4 className="font-semibold text-gray-900 mb-3">Assertions</h4>
                      <ul className="space-y-2">
                        {testCase.assertions.map((assertion, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-gray-700">{assertion}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      {testCase.testData && (
                        <div className="mb-4">
                          <h4 className="font-semibold text-gray-900 mb-3">Test Data</h4>
                          <pre className="bg-white p-3 rounded-lg border text-sm overflow-x-auto">
                            <code>{JSON.stringify(testCase.testData, null, 2)}</code>
                          </pre>
                        </div>
                      )}
                      
                      <h4 className="font-semibold text-gray-900 mb-3">Generated Test Code</h4>
                      <div className="bg-gray-900 p-4 rounded-lg overflow-x-auto">
                        <code className="text-green-400 text-sm">
                          {generateJestTestCode(testCase).split('\n').map((line, index) => (
                            <div key={index}>{line}</div>
                          ))}
                        </code>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredTestCases.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <div className="text-gray-400 mb-4">
            <Play className="w-12 h-12 mx-auto" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Matching Test Cases</h3>
          <p className="text-gray-600">Try adjusting your filters or search criteria.</p>
        </div>
      )}
    </div>
  );
};

export default TestCaseViewer;