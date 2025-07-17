'use client';

import { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { CodeEditor as CodeEditorType, ExecutionResult } from '@/types';
import { LANGUAGES } from '@/config/languages';
import axios from 'axios';

interface CodeEditorProps {
  editor: CodeEditorType;
  onCodeChange: (id: string, code: string) => void;
  onLanguageChange: (id: string, language: string) => void;
  onExecutionResult: (id: string, result: ExecutionResult) => void;
  onRemove?: (id: string) => void;
  className?: string;
}

export default function CodeEditor({
  editor,
  onCodeChange,
  onLanguageChange,
  onExecutionResult,
  onRemove,
  className = ''
}: CodeEditorProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [input, setInput] = useState('');
  const [showInput, setShowInput] = useState(false);

  const currentLanguage = LANGUAGES[editor.language];

  const handleCodeChange = (value: string | undefined) => {
    onCodeChange(editor.id, value || '');
  };

  const handleLanguageChange = (newLanguage: string) => {
    onLanguageChange(editor.id, newLanguage);
  };

  const executeCode = async () => {
    if (!editor.code.trim()) return;

    setIsRunning(true);
    try {
      const response = await axios.post('/api/execute', {
        code: editor.code,
        language: editor.language,
        input: input
      });

      onExecutionResult(editor.id, response.data);
    } catch (error: any) {
      onExecutionResult(editor.id, {
        success: false,
        output: '',
        error: error.response?.data?.error || 'Execution failed',
        exitCode: 1,
        language: editor.language
      });
    } finally {
      setIsRunning(false);
    }
  };

  const clearOutput = () => {
    onExecutionResult(editor.id, {
      success: true,
      output: '',
      error: '',
      exitCode: 0,
      language: editor.language
    });
  };

  const resetCode = () => {
    const defaultCode = LANGUAGES[editor.language]?.defaultCode || '';
    onCodeChange(editor.id, defaultCode);
  };

  const getLanguageColor = (lang: string) => {
    const colors: { [key: string]: string } = {
      javascript: 'bg-yellow-500',
      python: 'bg-blue-500',
      go: 'bg-cyan-500',
      java: 'bg-orange-500',
      cpp: 'bg-purple-500',
      csharp: 'bg-green-500',
      typescript: 'bg-blue-600',
      php: 'bg-indigo-500',
      html: 'bg-red-500',
      css: 'bg-pink-500',
    };
    return colors[lang] || 'bg-gray-500';
  };

  const getLanguageIcon = (lang: string) => {
    const icons: { [key: string]: string } = {
      javascript: 'JS',
      python: 'PY',
      go: 'GO',
      java: 'JV',
      cpp: 'C++',
      csharp: 'C#',
      typescript: 'TS',
      php: 'PHP',
      html: 'HTML',
      css: 'CSS',
    };
    return icons[lang] || lang.toUpperCase().substring(0, 2);
  };

  return (
    <div className={`flex flex-col h-full bg-gray-900 rounded-lg overflow-hidden ${className}`}>
      {/* Tab Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="flex items-center space-x-2 px-4 py-3 bg-gray-900 border-r border-gray-700">
              <div className={`w-3 h-3 rounded-full ${getLanguageColor(editor.language)}`}></div>
              <span className="text-white font-medium text-sm">
                {getLanguageIcon(editor.language)}
              </span>
              <select
                value={editor.language}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="bg-transparent text-white text-sm border-none outline-none cursor-pointer"
              >
                {Object.values(LANGUAGES).map((lang) => (
                  <option key={lang.name} value={lang.name} className="bg-gray-800 text-white">
                    {lang.displayName}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="flex items-center space-x-1 px-3">
            <button
              onClick={() => setShowInput(!showInput)}
              className={`p-2 rounded text-xs transition-colors ${
                showInput 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
              title="Toggle input"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
              </svg>
            </button>
            
            <button
              onClick={resetCode}
              className="p-2 rounded text-xs text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
              title="Reset code"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd"/>
              </svg>
            </button>

            <button
              onClick={clearOutput}
              className="p-2 rounded text-xs text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
              title="Clear output"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clipRule="evenodd"/>
                <path fillRule="evenodd" d="M10 5a2 2 0 00-2 2v6a2 2 0 002 2h4a2 2 0 002-2V7a2 2 0 00-2-2H10z" clipRule="evenodd"/>
              </svg>
            </button>

            <button
              onClick={executeCode}
              disabled={isRunning || !editor.code.trim()}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-3 py-2 rounded text-xs font-medium transition-colors flex items-center space-x-1"
            >
              {isRunning ? (
                <>
                  <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" strokeOpacity="0.3" />
                    <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Running</span>
                </>
              ) : (
                <>
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"/>
                  </svg>
                  <span>Run</span>
                </>
              )}
            </button>

            {onRemove && (
              <button
                onClick={() => onRemove(editor.id)}
                className="p-2 rounded text-xs text-gray-400 hover:text-red-400 hover:bg-gray-700 transition-colors"
                title="Remove editor"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Input Section */}
        {showInput && (
          <div className="px-4 pb-3 bg-gray-800">
            <label className="block text-xs font-medium text-gray-300 mb-2">
              Input (stdin):
            </label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter input for your program..."
              className="w-full h-16 px-3 py-2 bg-gray-900 border border-gray-600 rounded text-sm text-white font-mono resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500"
            />
          </div>
        )}
      </div>

      {/* Code Editor */}
      <div className="flex-1 min-h-0">
        <Editor
          height="100%"
          language={getMonacoLanguage(editor.language)}
          value={editor.code}
          onChange={handleCodeChange}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            roundedSelection: false,
            automaticLayout: true,
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            tabSize: 2,
            insertSpaces: true,
            padding: { top: 16, bottom: 16 },
            fontFamily: 'JetBrains Mono, Fira Code, SF Mono, Monaco, Cascadia Code, Roboto Mono, Consolas, Courier New, monospace',
            lineHeight: 1.6,
          }}
        />
      </div>

      {/* Output Section */}
      <div className="h-32 border-t border-gray-700 bg-gray-900">
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between px-4 py-2 bg-gray-800 text-sm font-medium text-gray-300">
            <span>Output</span>
            {editor.error && (
              <span className="text-red-400 text-xs flex items-center">
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                </svg>
                Error
              </span>
            )}
          </div>
          <div className="flex-1 overflow-auto">
            {editor.output && (
              <pre className="p-4 text-sm font-mono text-green-300 whitespace-pre-wrap">
                {editor.output}
              </pre>
            )}
            {editor.error && (
              <pre className="p-4 text-sm font-mono text-red-300 whitespace-pre-wrap">
                {editor.error}
              </pre>
            )}
            {!editor.output && !editor.error && (
              <div className="p-4 text-sm text-gray-500 italic">
                No output yet. Run your code to see results.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Map our language names to Monaco editor language identifiers
function getMonacoLanguage(language: string): string {
  const monacoMap: { [key: string]: string } = {
    javascript: 'javascript',
    python: 'python',
    go: 'go',
    java: 'java',
    cpp: 'cpp',
    csharp: 'csharp',
    typescript: 'typescript',
    php: 'php',
    html: 'html',
    css: 'css',
  };
  return monacoMap[language] || 'plaintext';
} 