import React from 'react';
import { 
  TestTube, 
  Zap, 
  Shield, 
  Code, 
  CheckCircle, 
  ArrowRight, 
  Play,
  Target,
  Clock,
  Users,
  Sparkles,
  FileText,
  Download,
  Settings
} from 'lucide-react';

interface Props {
  onGetStarted: () => void;
}

const LandingPage: React.FC<Props> = ({ onGetStarted }) => {
  const features = [
    {
      icon: Sparkles,
      title: 'AI-Powered Generation',
      description: 'Automatically generate comprehensive test cases from your API specifications using advanced AI algorithms.',
      color: 'bg-purple-100 text-purple-600'
    },
    {
      icon: Target,
      title: 'Smart Test Categorization',
      description: 'Intelligently categorize tests into positive, negative, boundary, security, and performance scenarios.',
      color: 'bg-blue-100 text-blue-600'
    },
    {
      icon: Shield,
      title: 'Security Testing',
      description: 'Generate security-focused test cases including authentication, authorization, and vulnerability checks.',
      color: 'bg-red-100 text-red-600'
    },
    {
      icon: Code,
      title: 'Multiple Export Formats',
      description: 'Export tests in Jest, Cypress, Postman collections, or cURL commands for seamless integration.',
      color: 'bg-green-100 text-green-600'
    },
    {
      icon: Zap,
      title: 'CI/CD Integration',
      description: 'Ready-to-use GitHub Actions templates and pipeline configurations for automated testing.',
      color: 'bg-yellow-100 text-yellow-600'
    },
    {
      icon: FileText,
      title: 'OpenAPI/Swagger Support',
      description: 'Full support for OpenAPI 3.x and Swagger 2.x specifications with intelligent parsing.',
      color: 'bg-indigo-100 text-indigo-600'
    }
  ];

  const benefits = [
    'Reduce manual test writing time by 90%',
    'Ensure comprehensive API coverage',
    'Catch edge cases and security vulnerabilities',
    'Maintain consistent testing standards',
    'Accelerate development cycles',
    'Improve API reliability and quality'
  ];

  const useCases = [
    {
      title: 'For Developers',
      description: 'Quickly generate test suites for your APIs without manual effort',
      icon: Code
    },
    {
      title: 'For QA Teams',
      description: 'Ensure comprehensive test coverage with AI-generated scenarios',
      icon: CheckCircle
    },
    {
      title: 'For DevOps',
      description: 'Integrate automated testing into your CI/CD pipelines seamlessly',
      icon: Settings
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/10 to-purple-600/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <div className="p-4 bg-indigo-100 rounded-2xl">
                <TestTube className="w-16 h-16 text-indigo-600" />
              </div>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Automated
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"> API Testing</span>
              <br />Made Simple
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Transform your API specifications into comprehensive test suites with AI-powered generation. 
              Save time, improve coverage, and catch bugs before they reach production.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <button
                onClick={onGetStarted}
                className="inline-flex items-center px-8 py-4 bg-indigo-600 text-white text-lg font-semibold rounded-xl hover:bg-indigo-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </button>
              
              <button className="inline-flex items-center px-8 py-4 text-indigo-600 text-lg font-semibold rounded-xl border-2 border-indigo-200 hover:bg-indigo-50 transition-all duration-200">
                <Play className="w-5 h-5 mr-2" />
                Watch Demo
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-indigo-600 mb-2">90%</div>
                <div className="text-gray-600">Time Saved</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-indigo-600 mb-2">10x</div>
                <div className="text-gray-600">Faster Testing</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-indigo-600 mb-2">100%</div>
                <div className="text-gray-600">Coverage</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Powerful Features for Modern API Testing
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our AI-powered platform provides everything you need to create, manage, and execute comprehensive API tests.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="bg-white p-8 rounded-2xl border border-gray-200 hover:border-indigo-300 hover:shadow-lg transition-all duration-300 group">
                  <div className={`inline-flex p-3 rounded-xl ${feature.color} mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Why Choose Our API Testing Solution?
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Stop writing repetitive test cases manually. Our AI understands your API specifications and generates intelligent, comprehensive test scenarios automatically.
              </p>
              
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-xl">
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Upload API Spec</div>
                    <div className="text-sm text-gray-600">OpenAPI/Swagger JSON or YAML</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">AI Generation</div>
                    <div className="text-sm text-gray-600">Intelligent test case creation</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Download className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Export & Integrate</div>
                    <div className="text-sm text-gray-600">Ready-to-use test code</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Use Cases Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Perfect for Every Team
            </h2>
            <p className="text-xl text-gray-600">
              Whether you're a developer, QA engineer, or DevOps professional, our platform adapts to your workflow.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {useCases.map((useCase, index) => {
              const Icon = useCase.icon;
              return (
                <div key={index} className="text-center p-8 rounded-2xl border border-gray-200 hover:border-indigo-300 hover:shadow-lg transition-all duration-300">
                  <div className="inline-flex p-4 bg-indigo-100 rounded-2xl mb-6">
                    <Icon className="w-8 h-8 text-indigo-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{useCase.title}</h3>
                  <p className="text-gray-600">{useCase.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-gradient-to-r from-indigo-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Transform Your API Testing?
          </h2>
          <p className="text-xl text-indigo-100 mb-8">
            Join thousands of developers who have already automated their API testing workflow.
          </p>
          <button
            onClick={onGetStarted}
            className="inline-flex items-center px-8 py-4 bg-white text-indigo-600 text-lg font-semibold rounded-xl hover:bg-gray-50 transform hover:scale-105 transition-all duration-200 shadow-lg"
          >
            Start Testing Now
            <ArrowRight className="w-5 h-5 ml-2" />
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <TestTube className="w-8 h-8 text-indigo-400" />
              <span className="text-xl font-bold">API Test Generator</span>
            </div>
            <div className="text-gray-400">
              © 2025 API Test Generator. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;