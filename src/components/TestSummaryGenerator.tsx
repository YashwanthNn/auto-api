import React, { useState } from 'react';
import { FileText, Download, Share, TrendingUp, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

interface TestResult {
  id: string;
  testCase: any;
  status: 'passed' | 'failed' | 'skipped';
  duration: number;
  response?: any;
  error?: string;
  assertions: any[];
}

interface Props {
  testResults: TestResult[];
  apiSpec: any;
}

const TestSummaryGenerator: React.FC<Props> = ({ testResults, apiSpec }) => {
  const [summaryType, setSummaryType] = useState<'executive' | 'technical' | 'detailed'>('executive');

  const generatePlainEnglishSummary: () => string = () => {
    const totalTests = testResults.length;
    const passedTests = testResults.filter(r => r.status === 'passed').length;
    const failedTests = testResults.filter(r => r.status === 'failed').length;
    const passRate = Math.round((passedTests / totalTests) * 100);
    const avgDuration = Math.round(testResults.reduce((sum, r) => sum + r.duration, 0) / totalTests);

    const failedTestsByCategory = testResults
      .filter(r => r.status === 'failed')
      .reduce((acc, r) => {
        const category = r.testCase.category;
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    const criticalIssues = testResults.filter(r => 
      r.status === 'failed' && 
      (r.testCase.category === 'security' || r.testCase.priority === 'high')
    );

    if (summaryType === 'executive') {
      return `# API Testing Executive Summary

## Overall Health Score: ${passRate >= 90 ? '🟢 Excellent' : passRate >= 70 ? '🟡 Good' : '🔴 Needs Attention'} (${passRate}%)

### Key Findings
Your API testing suite ran **${totalTests} tests** with a **${passRate}% success rate**. ${
  passRate >= 90 
    ? 'Your API is performing exceptionally well with minimal issues detected.'
    : passRate >= 70
    ? 'Your API shows good performance but has some areas that need attention.'
    : 'Your API has significant issues that require immediate attention.'
}

### Performance Overview
- **Average Response Time**: ${avgDuration}ms ${avgDuration < 500 ? '(Excellent)' : avgDuration < 1000 ? '(Good)' : '(Needs Improvement)'}
- **Tests Passed**: ${passedTests} out of ${totalTests}
- **Critical Issues**: ${criticalIssues.length} ${criticalIssues.length === 0 ? '✅' : '⚠️'}

### Business Impact
${passRate >= 90 
  ? '✅ **Low Risk**: Your API is ready for production with minimal concerns.'
  : passRate >= 70
  ? '⚠️ **Medium Risk**: Address failing tests before production deployment.'
  : '🚨 **High Risk**: Significant issues detected that could impact user experience.'
}

### Immediate Actions Required
${failedTests === 0 
  ? '• Continue monitoring and maintain current quality standards\n• Consider adding more edge case testing'
  : `• Fix ${failedTests} failing tests immediately\n• Focus on ${Object.keys(failedTestsByCategory)[0] || 'validation'} issues first\n• Review error handling and data validation`
}

### Next Steps
1. ${failedTests > 0 ? 'Address critical failures' : 'Expand test coverage'}
2. ${avgDuration > 1000 ? 'Optimize API performance' : 'Implement continuous monitoring'}
3. ${criticalIssues.length > 0 ? 'Review security vulnerabilities' : 'Add security testing scenarios'}`;
    }

    if (summaryType === 'technical') {
      return `# Technical API Test Report

## Test Execution Summary
- **Total Test Cases**: ${totalTests}
- **Execution Time**: ${Math.round(testResults.reduce((sum, r) => sum + r.duration, 0) / 1000)}s
- **Pass Rate**: ${passRate}% (${passedTests}/${totalTests})
- **API Endpoints Tested**: ${new Set(testResults.map(r => r.testCase.endpoint)).size}

## Test Categories Breakdown
${Object.entries(
  testResults.reduce((acc, r) => {
    const category = r.testCase.category;
    if (!acc[category]) acc[category] = { total: 0, passed: 0, failed: 0 };
    acc[category].total++;
    if (r.status === 'passed') acc[category].passed++;
    if (r.status === 'failed') acc[category].failed++;
    return acc;
  }, {} as Record<string, any>)
).map(([category, stats]) => 
  `- **${category.charAt(0).toUpperCase() + category.slice(1)}**: ${stats.passed}/${stats.total} passed (${Math.round(stats.passed/stats.total*100)}%)`
).join('\n')}

## Performance Metrics
- **Average Response Time**: ${avgDuration}ms
- **Fastest Response**: ${Math.min(...testResults.map(r => r.duration))}ms
- **Slowest Response**: ${Math.max(...testResults.map(r => r.duration))}ms
- **Timeout Failures**: ${testResults.filter(r => r.duration > 5000).length}

## Failed Tests Analysis
${failedTests === 0 ? 'No failed tests detected. ✅' : 
  testResults.filter(r => r.status === 'failed').map(r => 
    `- **${r.testCase.name}**: ${r.error || 'Assertion failure'}`
  ).join('\n')
}

## Security & Compliance
${testResults.filter(r => r.testCase.category === 'security').length > 0 
  ? `- Security tests: ${testResults.filter(r => r.testCase.category === 'security' && r.status === 'passed').length}/${testResults.filter(r => r.testCase.category === 'security').length} passed`
  : '- No security tests configured'
}

## Recommendations
${failedTests > 0 ? '1. **Priority**: Fix failing tests before deployment' : '1. **Enhancement**: Add more comprehensive test scenarios'}
${avgDuration > 1000 ? '\n2. **Performance**: Optimize slow endpoints' : '\n2. **Monitoring**: Implement performance tracking'}
${criticalIssues.length > 0 ? '\n3. **Security**: Address security test failures immediately' : '\n3. **Security**: Consider adding penetration testing'}`;
    }

    // Detailed summary
    return `# Detailed API Test Analysis Report

## Executive Summary
${generatePlainEnglishSummary().split('## Test Execution Summary')[0]}

## Detailed Test Results

### Passed Tests (${passedTests})
${testResults.filter(r => r.status === 'passed').map(r => 
  `- ✅ **${r.testCase.name}** (${r.duration}ms)\n  - Endpoint: ${r.testCase.method} ${r.testCase.endpoint}\n  - Category: ${r.testCase.category}\n  - All assertions passed`
).join('\n\n')}

### Failed Tests (${failedTests})
${testResults.filter(r => r.status === 'failed').map(r => 
  `- ❌ **${r.testCase.name}** (${r.duration}ms)\n  - Endpoint: ${r.testCase.method} ${r.testCase.endpoint}\n  - Category: ${r.testCase.category}\n  - Error: ${r.error || 'Assertion failures'}\n  - Failed Assertions: ${r.assertions.filter(a => !a.passed).map(a => a.description).join(', ')}`
).join('\n\n')}

## API Endpoint Analysis
${Array.from(new Set(testResults.map(r => r.testCase.endpoint))).map(endpoint => {
  const endpointTests = testResults.filter(r => r.testCase.endpoint === endpoint);
  const endpointPassed = endpointTests.filter(r => r.status === 'passed').length;
  const avgResponseTime = Math.round(endpointTests.reduce((sum, r) => sum + r.duration, 0) / endpointTests.length);
  
  return `### ${endpoint}
- **Tests**: ${endpointPassed}/${endpointTests.length} passed
- **Average Response Time**: ${avgResponseTime}ms
- **Methods Tested**: ${Array.from(new Set(endpointTests.map(r => r.testCase.method))).join(', ')}
- **Status**: ${endpointPassed === endpointTests.length ? '✅ Healthy' : '⚠️ Issues Detected'}`;
}).join('\n\n')}

## Quality Metrics
- **Test Coverage**: ${Math.round((new Set(testResults.map(r => r.testCase.endpoint)).size / Object.keys(apiSpec?.paths || {}).length) * 100)}% of API endpoints
- **Assertion Success Rate**: ${Math.round(testResults.reduce((sum, r) => sum + r.assertions.filter(a => a.passed).length, 0) / testResults.reduce((sum, r) => sum + r.assertions.length, 0) * 100)}%
- **Performance Score**: ${avgDuration < 500 ? 'A' : avgDuration < 1000 ? 'B' : avgDuration < 2000 ? 'C' : 'D'}

## Recommendations & Action Items
1. **Immediate Actions** (Next 24 hours)
   ${criticalIssues.length > 0 ? '- Fix critical security/high-priority failures' : '- Monitor production deployment'}
   ${failedTests > 3 ? '- Address systematic validation issues' : '- Continue current quality practices'}

2. **Short-term Improvements** (Next Week)
   - Implement automated regression testing
   - Add performance monitoring alerts
   - Enhance error handling coverage

3. **Long-term Strategy** (Next Month)
   - Expand test coverage to 100% of endpoints
   - Implement contract testing
   - Add chaos engineering scenarios`;
  };

  const downloadSummary = () => {
    const summary = generatePlainEnglishSummary();
    const blob = new Blob([summary], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `api-test-summary-${summaryType}-${new Date().toISOString().split('T')[0]}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const shareSummary = async () => {
    const summary = generatePlainEnglishSummary();
    if (navigator.share) {
      await navigator.share({
        title: 'API Test Summary',
        text: summary
      });
    } else {
      navigator.clipboard.writeText(summary);
      alert('Summary copied to clipboard!');
    }
  };

  if (testResults.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Test Results</h3>
        <p className="text-gray-600">Run some tests first to generate a comprehensive summary.</p>
      </div>
    );
  }

  const totalTests = testResults.length;
  const passedTests = testResults.filter(r => r.status === 'passed').length;
  const failedTests = testResults.filter(r => r.status === 'failed').length;
  const passRate = Math.round((passedTests / totalTests) * 100);

  return (
    <div className="space-y-6">
      {/* Summary Controls */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Test Summary Generator</h3>
          <div className="flex items-center space-x-3">
            <select
              value={summaryType}
              onChange={(e) => setSummaryType(e.target.value as any)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="executive">Executive Summary</option>
              <option value="technical">Technical Report</option>
              <option value="detailed">Detailed Analysis</option>
            </select>
            <button
              onClick={downloadSummary}
              className="flex items-center px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </button>
            <button
              onClick={shareSummary}
              className="flex items-center px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm"
            >
              <Share className="w-4 h-4 mr-2" />
              Share
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-600">{passedTests}</div>
            <div className="text-sm text-gray-600">Passed</div>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <AlertTriangle className="w-8 h-8 text-red-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-red-600">{failedTests}</div>
            <div className="text-sm text-gray-600">Failed</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <TrendingUp className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-600">{passRate}%</div>
            <div className="text-sm text-gray-600">Success Rate</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <Clock className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-purple-600">
              {Math.round(testResults.reduce((sum, r) => sum + r.duration, 0) / totalTests)}ms
            </div>
            <div className="text-sm text-gray-600">Avg Response</div>
          </div>
        </div>
      </div>

      {/* Generated Summary */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">
          {summaryType === 'executive' ? 'Executive Summary' : 
           summaryType === 'technical' ? 'Technical Report' : 
           'Detailed Analysis'}
        </h4>
        <div className="prose max-w-none">
          <pre className="whitespace-pre-wrap text-sm text-gray-700 bg-gray-50 p-4 rounded-lg overflow-x-auto">
            {generatePlainEnglishSummary()}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default TestSummaryGenerator;