import React, { useState } from 'react';
import { FileUp as FileUpload, Settings, Code, TestTube, Filter, Download, Play, ChevronRight, CheckCircle2, AlertTriangle, Shield, Zap, Target, User, Terminal, MessageCircle, FileText } from 'lucide-react';
import LandingPage from './components/LandingPage';
import AuthPage from './components/AuthPage';
import UserProfileForm from './components/UserProfileForm';
import ApiSpecUploader from './components/ApiSpecUploader';
import TestCaseViewer from './components/TestCaseViewer';
import TestRunner from './components/TestRunner';
import JenkinsIntegration from './components/JenkinsIntegration';
import ChatBot from './components/ChatBot';
import GitTerminal from './components/GitTerminal';
import TestSummaryGenerator from './components/TestSummaryGenerator';
import CodeExporter from './components/CodeExporter';
import SettingsPanel from './components/SettingsPanel';
import { supabase } from './lib/supabase';

export interface ApiSpec {
  openapi: string;
  info: {
    title: string;
    version: string;
    description?: string;
  };
  paths: Record<string, any>;
  components?: {
    schemas?: Record<string, any>;
  };
}

export interface TestCase {
  id: string;
  name: string;
  description: string;
  category: 'positive' | 'negative' | 'boundary' | 'security' | 'performance';
  method: string;
  endpoint: string;
  scenario: string;
  expectedStatus: number;
  testData: any;
  assertions: string[];
  priority: 'high' | 'medium' | 'low';
  tags: string[];
}

interface TestResult {
  id: string;
  testCase: TestCase;
  status: 'running' | 'passed' | 'failed' | 'skipped';
  duration: number;
  response?: any;
  error?: string;
  assertions: any[];
}

interface UserProfile {
  name: string;
  role: string;
  company: string;
  experience: string;
  interests: string[];
}

type AppState = 'landing' | 'auth' | 'profile' | 'dashboard';

function App() {
  const [appState, setAppState] = useState<AppState>('landing');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [apiSpec, setApiSpec] = useState<ApiSpec | null>(null);
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'tests' | 'runner' | 'jenkins' | 'summary'>('tests');
  const [showSettings, setShowSettings] = useState(false);
  const [showCodeExporter, setShowCodeExporter] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGetStarted = () => {
    setAppState('auth');
  };

  const handleAuthSuccess = () => {
    setAppState('profile');
  };

  const handleProfileComplete = (profile: UserProfile) => {
    setUserProfile(profile);
    setAppState('dashboard');
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setAppState('landing');
    setUserProfile(null);
    setApiSpec(null);
    setTestCases([]);
    setTestResults([]);
    setSelectedCategory('all');
    setActiveTab('tests');
  };

  const categories = [
    { id: 'all', name: 'All Tests', icon: TestTube, color: 'bg-gray-500' },
    { id: 'positive', name: 'Positive Tests', icon: CheckCircle2, color: 'bg-green-500' },
    { id: 'negative', name: 'Negative Tests', icon: AlertTriangle, color: 'bg-red-500' },
    { id: 'boundary', name: 'Boundary Tests', icon: Target, color: 'bg-yellow-500' },
    { id: 'security', name: 'Security Tests', icon: Shield, color: 'bg-blue-500' },
    { id: 'performance', name: 'Performance Tests', icon: Zap, color: 'bg-purple-500' },
  ];

  const filteredTestCases = selectedCategory === 'all' 
    ? testCases 
    : testCases.filter(tc => tc.category === selectedCategory);

  const getStatsForCategory = (categoryId: string) => {
    if (categoryId === 'all') return testCases.length;
    return testCases.filter(tc => tc.category === categoryId).length;
  };

  // Render based on app state
  if (appState === 'landing') {
    return <LandingPage onGetStarted={handleGetStarted} />;
  }

  if (appState === 'auth') {
    return (
      <AuthPage 
        onBack={() => setAppState('landing')} 
        onAuthSuccess={handleAuthSuccess}
      />
    );
  }

  if (appState === 'profile') {
    return <UserProfileForm onProfileComplete={handleProfileComplete} />;
  }

  // Dashboard (main app)
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <TestTube className="w-8 h-8 text-indigo-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">API Test Generator</h1>
                <p className="text-sm text-gray-500">Automated test case generation from API specifications</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {userProfile && (
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">Welcome, {userProfile.name}</div>
                    <div className="text-xs text-gray-500 capitalize">{userProfile.role.replace('_', ' ')}</div>
                  </div>
                  <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-indigo-600" />
                  </div>
                </div>
              )}
              <button
                onClick={() => setShowCodeExporter(true)}
                disabled={testCases.length === 0}
                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Code className="w-4 h-4 mr-2" />
                Export Tests
              </button>
              <div className="relative group">
                <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                  <Settings className="w-5 h-5" />
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <button
                    onClick={() => setShowSettings(true)}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-t-lg"
                  >
                    Settings
                  </button>
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-b-lg"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!apiSpec ? (
          /* Upload Section */
          <div className="text-center">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Generate Comprehensive API Tests
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Upload your OpenAPI/Swagger specification to automatically generate intelligent test cases with AI-powered scenarios.
              </p>
              <ApiSpecUploader 
                onSpecUploaded={setApiSpec}
                onTestCasesGenerated={(cases) => {
                  setTestCases(cases);
                  setIsGenerating(false);
                }}
                onGenerationStart={() => setIsGenerating(true)}
              />
            </div>
          </div>
        ) : (
          /* Main Dashboard */
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar - Categories */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Test Categories</h3>
                <div className="space-y-2">
                  {categories.map((category) => {
                    const Icon = category.icon;
                    const count = getStatsForCategory(category.id);
                    return (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`w-full flex items-center justify-between p-3 rounded-lg transition-all ${
                          selectedCategory === category.id
                            ? 'bg-indigo-50 border border-indigo-200 text-indigo-700'
                            : 'hover:bg-gray-50 text-gray-700'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-2 h-2 rounded-full ${category.color}`}></div>
                          <Icon className="w-4 h-4" />
                          <span className="font-medium">{category.name}</span>
                        </div>
                        <span className="text-sm font-semibold bg-gray-100 px-2 py-1 rounded-full">
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* API Info */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-2">API Information</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><strong>Title:</strong> {apiSpec.info.title}</p>
                    <p><strong>Version:</strong> {apiSpec.info.version}</p>
                    <p><strong>Endpoints:</strong> {Object.keys(apiSpec.paths).length}</p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setApiSpec(null);
                    setTestCases([]);
                    setTestResults([]);
                    setSelectedCategory('all');
                    setActiveTab('tests');
                  }}
                  className="w-full mt-4 px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Upload New Spec
                </button>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* Tab Navigation */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
                <div className="border-b border-gray-200">
                  <nav className="flex space-x-8 px-6">
                    <button
                      onClick={() => setActiveTab('tests')}
                      className={`py-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === 'tests'
                          ? 'border-indigo-500 text-indigo-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <TestTube className="w-4 h-4 inline mr-2" />
                      Test Cases
                    </button>
                    <button
                      onClick={() => setActiveTab('runner')}
                      className={`py-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === 'runner'
                          ? 'border-indigo-500 text-indigo-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <Play className="w-4 h-4 inline mr-2" />
                      Test Runner
                    </button>
                    <button
                      onClick={() => setActiveTab('jenkins')}
                      className={`py-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === 'jenkins'
                          ? 'border-indigo-500 text-indigo-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <Settings className="w-4 h-4 inline mr-2" />
                      CI/CD
                    </button>
                    <button
                      onClick={() => setActiveTab('summary')}
                      className={`py-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === 'summary'
                          ? 'border-indigo-500 text-indigo-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <FileText className="w-4 h-4 inline mr-2" />
                      Summary
                    </button>
                  </nav>
                </div>
              </div>

              {isGenerating ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                  <div className="animate-spin w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Generating Test Cases</h3>
                  <p className="text-gray-600">Analyzing API specification and creating intelligent test scenarios...</p>
                </div>
              ) : (
                <>
                  {activeTab === 'tests' && <TestCaseViewer testCases={filteredTestCases} />}
                  {activeTab === 'runner' && (
                    <TestRunner 
                      testCases={testCases} 
                      apiSpec={apiSpec} 
                      onTestComplete={setTestResults}
                    />
                  )}
                  {activeTab === 'jenkins' && <JenkinsIntegration onPipelineCreate={() => {}} />}
                  {activeTab === 'summary' && <TestSummaryGenerator testResults={testResults} apiSpec={apiSpec} />}
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <SettingsPanel
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
        />
      )}

      {/* Code Exporter */}
      {showCodeExporter && (
        <CodeExporter
          isOpen={showCodeExporter}
          onClose={() => setShowCodeExporter(false)}
          testCases={testCases}
          apiSpec={apiSpec}
        />
      )}

      {/* Chat Bot and Git Terminal */}
      <ChatBot testResults={testResults} apiSpec={apiSpec} />
      <GitTerminal />
    </div>
  );
}

export default App;