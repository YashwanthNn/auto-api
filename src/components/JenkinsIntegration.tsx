import React, { useState } from 'react';
import { Settings, Play, Download, GitBranch, Clock, CheckCircle, XCircle } from 'lucide-react';

interface JenkinsJob {
  id: string;
  name: string;
  status: 'idle' | 'running' | 'success' | 'failed';
  lastRun?: Date;
  duration?: number;
  buildNumber?: number;
}

interface Props {
  onPipelineCreate: (config: any) => void;
}

const JenkinsIntegration: React.FC<Props> = ({ onPipelineCreate }) => {
  const [jenkinsConfig, setJenkinsConfig] = useState({
    serverUrl: 'http://localhost:8080',
    username: '',
    apiToken: '',
    jobName: 'api-tests'
  });

  const [jobs, setJobs] = useState<JenkinsJob[]>([
    {
      id: '1',
      name: 'api-tests-dev',
      status: 'success',
      lastRun: new Date(Date.now() - 3600000),
      duration: 45000,
      buildNumber: 23
    },
    {
      id: '2',
      name: 'api-tests-staging',
      status: 'running',
      buildNumber: 12
    }
  ]);

  const generateJenkinsfile = () => {
    const jenkinsfile = `pipeline {
    agent any
    
    environment {
        API_BASE_URL = '\${API_BASE_URL}'
        NODE_VERSION = '18'
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Install Dependencies') {
            steps {
                sh 'npm ci'
                sh 'npm install -g newman'
            }
        }
        
        stage('Run API Tests') {
            parallel {
                stage('Postman Tests') {
                    steps {
                        sh 'newman run api-test-collection.json --environment test-env.json --reporters cli,junit --reporter-junit-export results/newman-results.xml'
                    }
                }
                stage('Jest Tests') {
                    steps {
                        sh 'npm test -- --ci --coverage --testResultsProcessor=jest-junit'
                    }
                }
            }
        }
        
        stage('Generate Reports') {
            steps {
                publishHTML([
                    allowMissing: false,
                    alwaysLinkToLastBuild: true,
                    keepAll: true,
                    reportDir: 'coverage',
                    reportFiles: 'index.html',
                    reportName: 'Coverage Report'
                ])
            }
        }
        
        stage('Security Scan') {
            steps {
                sh 'npm audit --audit-level moderate'
                sh 'npm run security-test'
            }
        }
    }
    
    post {
        always {
            junit 'results/*.xml'
            archiveArtifacts artifacts: 'results/**/*', fingerprint: true
        }
        success {
            emailext (
                subject: "API Tests Passed - Build #\${BUILD_NUMBER}",
                body: "All API tests passed successfully. View results: \${BUILD_URL}",
                to: "\${CHANGE_AUTHOR_EMAIL}"
            )
        }
        failure {
            emailext (
                subject: "API Tests Failed - Build #\${BUILD_NUMBER}",
                body: "API tests failed. Please check the build logs: \${BUILD_URL}",
                to: "\${CHANGE_AUTHOR_EMAIL}"
            )
        }
    }
}`;

    const blob = new Blob([jenkinsfile], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Jenkinsfile';
    a.click();
    URL.revokeObjectURL(url);
  };

  const generateDockerfile = () => {
    const dockerfile = `FROM node:18-alpine

WORKDIR /app

# Install Newman globally
RUN npm install -g newman

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy test files
COPY tests/ ./tests/
COPY collections/ ./collections/

# Create results directory
RUN mkdir -p results

# Run tests
CMD ["newman", "run", "collections/api-test-collection.json", "--reporters", "cli,junit", "--reporter-junit-export", "results/newman-results.xml"]`;

    const blob = new Blob([dockerfile], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Dockerfile';
    a.click();
    URL.revokeObjectURL(url);
  };

  const triggerBuild = (jobId: string) => {
    setJobs(jobs.map(job => 
      job.id === jobId 
        ? { ...job, status: 'running', buildNumber: (job.buildNumber || 0) + 1 }
        : job
    ));

    // Simulate build completion
    setTimeout(() => {
      setJobs(jobs.map(job => 
        job.id === jobId 
          ? { 
              ...job, 
              status: Math.random() > 0.3 ? 'success' : 'failed',
              lastRun: new Date(),
              duration: Math.floor(Math.random() * 60000) + 30000
            }
          : job
      ));
    }, 5000);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'running': return <Clock className="w-4 h-4 text-blue-500 animate-spin" />;
      default: return <Settings className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Jenkins Configuration */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Jenkins Configuration</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Jenkins Server URL</label>
            <input
              type="url"
              value={jenkinsConfig.serverUrl}
              onChange={(e) => setJenkinsConfig(prev => ({ ...prev, serverUrl: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="http://localhost:8080"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Job Name</label>
            <input
              type="text"
              value={jenkinsConfig.jobName}
              onChange={(e) => setJenkinsConfig(prev => ({ ...prev, jobName: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="api-tests"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
            <input
              type="text"
              value={jenkinsConfig.username}
              onChange={(e) => setJenkinsConfig(prev => ({ ...prev, username: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="jenkins-user"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">API Token</label>
            <input
              type="password"
              value={jenkinsConfig.apiToken}
              onChange={(e) => setJenkinsConfig(prev => ({ ...prev, apiToken: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="••••••••••••••••"
            />
          </div>
        </div>
      </div>

      {/* Pipeline Templates */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Pipeline Templates</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={generateJenkinsfile}
            className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:border-indigo-300 hover:shadow-sm transition-all"
          >
            <div className="text-center">
              <GitBranch className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
              <div className="font-medium">Jenkinsfile</div>
              <div className="text-sm text-gray-600">Complete pipeline configuration</div>
            </div>
          </button>
          
          <button
            onClick={generateDockerfile}
            className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:border-indigo-300 hover:shadow-sm transition-all"
          >
            <div className="text-center">
              <Download className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <div className="font-medium">Dockerfile</div>
              <div className="text-sm text-gray-600">Containerized test execution</div>
            </div>
          </button>
          
          <button
            onClick={() => onPipelineCreate({ type: 'github-actions' })}
            className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:border-indigo-300 hover:shadow-sm transition-all"
          >
            <div className="text-center">
              <Settings className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <div className="font-medium">GitHub Actions</div>
              <div className="text-sm text-gray-600">CI/CD workflow</div>
            </div>
          </button>
        </div>
      </div>

      {/* Jenkins Jobs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Jenkins Jobs</h3>
        <div className="space-y-4">
          {jobs.map((job) => (
            <div key={job.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-3">
                {getStatusIcon(job.status)}
                <div>
                  <div className="font-medium text-gray-900">{job.name}</div>
                  <div className="text-sm text-gray-600">
                    {job.lastRun && (
                      <span>Last run: {job.lastRun.toLocaleString()}</span>
                    )}
                    {job.duration && (
                      <span className="ml-2">Duration: {Math.round(job.duration / 1000)}s</span>
                    )}
                    {job.buildNumber && (
                      <span className="ml-2">Build #{job.buildNumber}</span>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={() => triggerBuild(job.id)}
                disabled={job.status === 'running'}
                className="flex items-center px-3 py-1 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                <Play className="w-3 h-3 mr-1" />
                Build
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default JenkinsIntegration;