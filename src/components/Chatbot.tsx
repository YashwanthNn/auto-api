import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, X, Bot, User, Lightbulb, Code, TestTube } from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

interface Props {
  testResults?: any[];
  apiSpec?: any;
}

const ChatBot: React.FC<Props> = ({ testResults, apiSpec }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      content: 'Hi! I\'m your API testing assistant. I can help you understand your test results, suggest improvements, and answer questions about API testing best practices.',
      timestamp: new Date(),
      suggestions: [
        'Explain my test results',
        'How to improve test coverage?',
        'Security testing tips',
        'Performance optimization'
      ]
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (message?: string) => {
    const messageText = message || inputValue.trim();
    if (!messageText) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: messageText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate bot response
    setTimeout(() => {
      const botResponse = generateBotResponse(messageText);
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const generateBotResponse = (userMessage: string): Message => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('test results') || lowerMessage.includes('explain')) {
      return {
        id: Date.now().toString(),
        type: 'bot',
        content: generateTestResultsExplanation(),
        timestamp: new Date(),
        suggestions: ['How to fix failing tests?', 'Best practices for API testing', 'Security recommendations']
      };
    }
    
    if (lowerMessage.includes('coverage') || lowerMessage.includes('improve')) {
      return {
        id: Date.now().toString(),
        type: 'bot',
        content: `To improve your API test coverage, consider:

🎯 **Missing Test Scenarios:**
• Add boundary value testing for numeric parameters
• Test with malformed JSON payloads
• Verify rate limiting behavior
• Test concurrent request handling

📊 **Coverage Gaps:**
• Error response validation
• Authentication edge cases
• Data validation scenarios
• Performance under load

💡 **Recommendations:**
• Implement property-based testing
• Add contract testing with Pact
• Use mutation testing to verify test quality
• Monitor real user scenarios`,
        timestamp: new Date(),
        suggestions: ['Generate more test cases', 'Security testing guide', 'Performance testing tips']
      };
    }
    
    if (lowerMessage.includes('security')) {
      return {
        id: Date.now().toString(),
        type: 'bot',
        content: `🔒 **Security Testing Recommendations:**

**Authentication & Authorization:**
• Test with expired tokens
• Verify role-based access controls
• Check for privilege escalation
• Test session management

**Input Validation:**
• SQL injection attempts
• XSS payload testing
• Command injection tests
• Path traversal attempts

**Data Protection:**
• Sensitive data exposure checks
• Encryption verification
• HTTPS enforcement
• CORS policy validation

**Rate Limiting:**
• Brute force protection
• DDoS mitigation testing
• API abuse prevention`,
        timestamp: new Date(),
        suggestions: ['Generate security tests', 'OWASP API Security', 'Penetration testing']
      };
    }
    
    if (lowerMessage.includes('performance')) {
      return {
        id: Date.now().toString(),
        type: 'bot',
        content: `⚡ **Performance Testing Strategy:**

**Load Testing:**
• Gradually increase concurrent users
• Test sustained load over time
• Identify breaking points
• Monitor resource utilization

**Stress Testing:**
• Push beyond normal capacity
• Test recovery mechanisms
• Validate error handling under stress
• Check memory leaks

**Key Metrics:**
• Response time (95th percentile)
• Throughput (requests/second)
• Error rate under load
• Resource consumption

**Tools & Techniques:**
• Use Newman for automated runs
• Implement performance budgets
• Monitor database query performance
• Cache effectiveness testing`,
        timestamp: new Date(),
        suggestions: ['Set up load testing', 'Performance monitoring', 'Optimization tips']
      };
    }

    // Default response
    return {
      id: Date.now().toString(),
      type: 'bot',
      content: `I can help you with various aspects of API testing:

🧪 **Test Analysis:** Understanding your test results and identifying issues
🔍 **Coverage:** Improving test coverage and finding gaps
🛡️ **Security:** Implementing security testing best practices
⚡ **Performance:** Optimizing API performance and load testing
🔧 **Tools:** Using Postman, Newman, Jenkins, and other testing tools
📊 **Reports:** Generating meaningful test reports and summaries

What specific area would you like to explore?`,
      timestamp: new Date(),
      suggestions: ['Analyze my API', 'Test automation tips', 'CI/CD integration', 'Best practices']
    };
  };

  const generateTestResultsExplanation = (): string => {
    if (!testResults || testResults.length === 0) {
      return `I don't see any test results yet. Once you run your API tests, I can provide detailed analysis including:

📊 **Test Summary:** Pass/fail rates and overall health
🔍 **Failure Analysis:** Root cause analysis of failing tests
💡 **Recommendations:** Specific suggestions for improvements
📈 **Trends:** Performance and reliability insights

Run some tests first, and I'll give you a comprehensive breakdown!`;
    }

    const passed = testResults.filter(r => r.status === 'passed').length;
    const failed = testResults.filter(r => r.status === 'failed').length;
    const total = testResults.length;
    const passRate = Math.round((passed / total) * 100);

    return `📊 **Test Results Analysis:**

**Overall Health:** ${passRate}% pass rate (${passed}/${total} tests passed)

${passRate >= 90 ? '✅ **Excellent!** Your API is performing very well.' :
  passRate >= 70 ? '⚠️ **Good** but room for improvement.' :
  '❌ **Needs attention** - several issues detected.'}

**Key Findings:**
${failed > 0 ? `• ${failed} tests are failing - check authentication, data validation, and error handling` : '• All tests passing - great job!'}
• Average response time: ${testResults.reduce((sum, r) => sum + (r.duration || 0), 0) / total}ms
• Most common issues: ${failed > 0 ? 'Authentication errors, validation failures' : 'None detected'}

**Next Steps:**
${failed > 0 ? '1. Fix failing tests first\n2. Add more edge case coverage\n3. Implement performance monitoring' : '1. Add more test scenarios\n2. Implement security testing\n3. Set up continuous monitoring'}`;
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition-all duration-200 flex items-center justify-center z-40"
      >
        <MessageCircle className="w-6 h-6" />
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-xl shadow-2xl border border-gray-200 flex flex-col z-50">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-indigo-600 text-white rounded-t-xl">
            <div className="flex items-center space-x-3">
              <Bot className="w-6 h-6" />
              <div>
                <div className="font-semibold">API Testing Assistant</div>
                <div className="text-xs text-indigo-200">Always here to help</div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-indigo-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] ${message.type === 'user' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-900'} rounded-lg p-3`}>
                  <div className="flex items-start space-x-2">
                    {message.type === 'bot' && <Bot className="w-4 h-4 mt-1 flex-shrink-0" />}
                    {message.type === 'user' && <User className="w-4 h-4 mt-1 flex-shrink-0" />}
                    <div className="flex-1">
                      <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                      {message.suggestions && (
                        <div className="mt-3 space-y-1">
                          {message.suggestions.map((suggestion, index) => (
                            <button
                              key={index}
                              onClick={() => handleSend(suggestion)}
                              className="block w-full text-left text-xs bg-white/20 hover:bg-white/30 rounded px-2 py-1 transition-colors"
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <Bot className="w-4 h-4" />
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me about your API tests..."
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
              />
              <button
                onClick={() => handleSend()}
                disabled={!inputValue.trim() || isTyping}
                className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBot;