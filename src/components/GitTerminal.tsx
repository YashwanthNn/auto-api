import React, { useState, useRef, useEffect } from 'react';
import { Terminal, GitBranch, Upload, Download, RefreshCw } from 'lucide-react';

interface Command {
  id: string;
  input: string;
  output: string;
  timestamp: Date;
  type: 'success' | 'error' | 'info';
}

const GitTerminal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [commands, setCommands] = useState<Command[]>([
    {
      id: '1',
      input: 'git status',
      output: `On branch main
Your branch is up to date with 'origin/main'.

Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
        modified:   tests/api-tests.json
        modified:   collections/postman-collection.json

Untracked files:
  (use "git add <file>..." to include in what will be committed)
        results/test-results.xml
        reports/coverage-report.html

no changes added to commit (use "git add ." or "git commit -a")`,
      timestamp: new Date(Date.now() - 60000),
      type: 'info'
    }
  ]);
  const [currentInput, setCurrentInput] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [commands]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const executeCommand = (input: string) => {
    const trimmedInput = input.trim();
    if (!trimmedInput) return;

    // Add to history
    setCommandHistory(prev => [...prev, trimmedInput]);
    setHistoryIndex(-1);

    const newCommand: Command = {
      id: Date.now().toString(),
      input: trimmedInput,
      output: '',
      timestamp: new Date(),
      type: 'info'
    };

    // Simulate command execution
    const output = simulateGitCommand(trimmedInput);
    newCommand.output = output.text;
    newCommand.type = output.type;

    setCommands(prev => [...prev, newCommand]);
    setCurrentInput('');
  };

  const simulateGitCommand = (command: string): { text: string; type: 'success' | 'error' | 'info' } => {
    const cmd = command.toLowerCase();

    if (cmd === 'git status') {
      return {
        text: `On branch main
Your branch is up to date with 'origin/main'.

Changes to be committed:
  (use "git restore --staged <file>..." to unstage)
        new file:   tests/generated-api-tests.json
        new file:   collections/newman-collection.json
        modified:   README.md

Changes not staged for commit:
        modified:   package.json`,
        type: 'info'
      };
    }

    if (cmd.startsWith('git add')) {
      return {
        text: 'Files staged for commit.',
        type: 'success'
      };
    }

    if (cmd.startsWith('git commit')) {
      const message = cmd.includes('-m') ? cmd.split('-m')[1]?.trim().replace(/['"]/g, '') : 'Update API tests';
      return {
        text: `[main ${Math.random().toString(36).substr(2, 7)}] ${message}
 3 files changed, 127 insertions(+), 12 deletions(-)
 create mode 100644 tests/generated-api-tests.json
 create mode 100644 collections/newman-collection.json`,
        type: 'success'
      };
    }

    if (cmd === 'git push' || cmd === 'git push origin main') {
      return {
        text: `Enumerating objects: 8, done.
Counting objects: 100% (8/8), done.
Delta compression using up to 8 threads
Compressing objects: 100% (5/5), done.
Writing objects: 100% (5/5), 2.34 KiB | 2.34 MiB/s, done.
Total 5 (delta 2), reused 0 (delta 0), pack-reused 0
To https://github.com/user/api-tests.git
   a1b2c3d..e4f5g6h  main -> main`,
        type: 'success'
      };
    }

    if (cmd === 'git pull' || cmd === 'git pull origin main') {
      return {
        text: `From https://github.com/user/api-tests
 * branch            main       -> FETCH_HEAD
Already up to date.`,
        type: 'info'
      };
    }

    if (cmd === 'git log' || cmd === 'git log --oneline') {
      return {
        text: `e4f5g6h (HEAD -> main, origin/main) Add comprehensive API test suite
a1b2c3d Update Newman collection with security tests
b2c3d4e Add performance testing scenarios
c3d4e5f Initial API test setup
d4e5f6g Add Postman collection
e5f6g7h Initial commit`,
        type: 'info'
      };
    }

    if (cmd === 'git branch' || cmd === 'git branch -a') {
      return {
        text: `* main
  feature/security-tests
  feature/performance-tests
  remotes/origin/main
  remotes/origin/feature/security-tests`,
        type: 'info'
      };
    }

    if (cmd.startsWith('git checkout') || cmd.startsWith('git switch')) {
      const branch = cmd.split(' ').pop();
      return {
        text: `Switched to branch '${branch}'`,
        type: 'success'
      };
    }

    if (cmd === 'ls' || cmd === 'dir') {
      return {
        text: `collections/
tests/
results/
reports/
package.json
README.md
Jenkinsfile
Dockerfile
.gitignore`,
        type: 'info'
      };
    }

    if (cmd === 'pwd') {
      return {
        text: '/home/user/api-testing-project',
        type: 'info'
      };
    }

    if (cmd === 'clear') {
      setCommands([]);
      return { text: '', type: 'info' };
    }

    if (cmd === 'help' || cmd === 'git help') {
      return {
        text: `Available Git commands:
  git status          - Show working tree status
  git add <files>     - Add files to staging area
  git commit -m "msg" - Commit staged changes
  git push            - Push commits to remote
  git pull            - Pull changes from remote
  git log             - Show commit history
  git branch          - List branches
  git checkout <branch> - Switch branches
  
Other commands:
  ls/dir             - List files
  pwd                - Show current directory
  clear              - Clear terminal
  help               - Show this help`,
        type: 'info'
      };
    }

    return {
      text: `Command not found: ${command}
Type 'help' for available commands.`,
      type: 'error'
    };
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      executeCommand(currentInput);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setCurrentInput(commandHistory[newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex !== -1) {
        const newIndex = historyIndex + 1;
        if (newIndex >= commandHistory.length) {
          setHistoryIndex(-1);
          setCurrentInput('');
        } else {
          setHistoryIndex(newIndex);
          setCurrentInput(commandHistory[newIndex]);
        }
      }
    }
  };

  const quickCommands = [
    { label: 'Status', command: 'git status' },
    { label: 'Add All', command: 'git add .' },
    { label: 'Commit', command: 'git commit -m "Update API tests"' },
    { label: 'Push', command: 'git push' },
    { label: 'Pull', command: 'git pull' },
    { label: 'Log', command: 'git log --oneline' }
  ];

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 w-14 h-14 bg-gray-900 text-white rounded-full shadow-lg hover:bg-gray-800 transition-all duration-200 flex items-center justify-center z-40"
      >
        <Terminal className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 left-6 w-[600px] h-[500px] bg-gray-900 text-green-400 rounded-xl shadow-2xl border border-gray-700 flex flex-col z-50 font-mono">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-700 bg-gray-800 rounded-t-xl">
        <div className="flex items-center space-x-2">
          <Terminal className="w-5 h-5" />
          <span className="text-sm font-semibold text-white">Git Terminal</span>
          <GitBranch className="w-4 h-4 text-blue-400" />
          <span className="text-xs text-blue-400">main</span>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-400 hover:text-white transition-colors"
        >
          ×
        </button>
      </div>

      {/* Quick Commands */}
      <div className="p-2 border-b border-gray-700 bg-gray-800">
        <div className="flex flex-wrap gap-1">
          {quickCommands.map((cmd, index) => (
            <button
              key={index}
              onClick={() => executeCommand(cmd.command)}
              className="px-2 py-1 text-xs bg-gray-700 text-gray-300 rounded hover:bg-gray-600 transition-colors"
            >
              {cmd.label}
            </button>
          ))}
        </div>
      </div>

      {/* Terminal Output */}
      <div ref={terminalRef} className="flex-1 overflow-y-auto p-3 space-y-2 text-sm">
        {commands.map((command) => (
          <div key={command.id} className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-blue-400">user@api-testing:</span>
              <span className="text-yellow-400">~/project$</span>
              <span className="text-white">{command.input}</span>
            </div>
            {command.output && (
              <pre className={`whitespace-pre-wrap ml-4 ${
                command.type === 'error' ? 'text-red-400' :
                command.type === 'success' ? 'text-green-400' :
                'text-gray-300'
              }`}>
                {command.output}
              </pre>
            )}
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="p-3 border-t border-gray-700 bg-gray-800">
        <div className="flex items-center space-x-2">
          <span className="text-blue-400">user@api-testing:</span>
          <span className="text-yellow-400">~/project$</span>
          <input
            ref={inputRef}
            type="text"
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent text-white outline-none"
            placeholder="Enter git command..."
          />
        </div>
      </div>
    </div>
  );
};

export default GitTerminal;