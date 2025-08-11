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

  const [activeTab, setActiveTab] = useState<'code' | 'console' | 'preview'>('code');
  const hasChanges = editor.code !== (LANGUAGES[editor.language]?.defaultCode || '');

  return (
    <div className={`flex flex-col h-full overflow-hidden ${className}`} style={{ background: 'var(--surface)' }}>
      {/* Tab Bar */}
      <div className="tab-bar">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {/* Language Tab */}
            <button
              className={`tab ${activeTab === 'code' ? 'active' : ''} ${hasChanges ? 'dirty' : ''}`}
              onClick={() => setActiveTab('code')}
            >
              <div className={`w-2 h-2 rounded-full ${getLanguageColor(editor.language)}`}></div>
              <span>{currentLanguage?.displayName || editor.language}</span>
              <select
                value={editor.language}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="bg-transparent border-none outline-none cursor-pointer text-xs ml-1 opacity-60 hover:opacity-100"
                onClick={(e) => e.stopPropagation()}
              >
                {Object.values(LANGUAGES).map((lang) => (
                  <option key={lang.name} value={lang.name} style={{ background: 'var(--surface)', color: 'var(--text-primary)' }}>
                    {lang.displayName}
                  </option>
                ))}
              </select>
            </button>
            
            {/* Console Tab */}
            <button
              className={`tab ${activeTab === 'console' ? 'active' : ''}`}
              onClick={() => setActiveTab('console')}
            >
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3.293 1.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L7.586 10 5.293 7.707a1 1 0 010-1.414zM11 12a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"/>
              </svg>
              <span>Console</span>
              {(editor.output || editor.error) && (
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: editor.error ? 'var(--error)' : 'var(--success)' }}></div>
              )}
            </button>
            
            {/* Preview Tab (for HTML/CSS) */}
            {(editor.language === 'html' || editor.language === 'css') && (
              <button
                className={`tab ${activeTab === 'preview' ? 'active' : ''}`}
                onClick={() => setActiveTab('preview')}
              >
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
                </svg>
                <span>Preview</span>
              </button>
            )}
          </div>
          
          {/* Tab Actions */}
          <div className="flex items-center space-x-1 px-3">
            {activeTab === 'code' && (
              <>
                <button
                  onClick={() => setShowInput(!showInput)}
                  className={`btn btn-ghost p-1 text-xs ${
                    showInput ? 'opacity-100' : 'opacity-60 hover:opacity-100'
                  }`}
                  title="Toggle input"
                >
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
                  </svg>
                </button>
                
                <button
                  onClick={executeCode}
                  disabled={isRunning || !editor.code.trim()}
                  className="btn btn-success p-1 text-xs"
                  title="Run code"
                >
                  {isRunning ? (
                    <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" strokeOpacity="0.3" />
                      <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  ) : (
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"/>
                    </svg>
                  )}
                </button>
              </>
            )}
            
            {activeTab === 'console' && (
              <button
                onClick={clearOutput}
                className="btn btn-ghost p-1 text-xs"
                title="Clear output"
              >
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clipRule="evenodd"/>
                  <path fillRule="evenodd" d="M10 5a2 2 0 00-2 2v6a2 2 0 002 2h4a2 2 0 002-2V7a2 2 0 00-2-2H10z" clipRule="evenodd"/>
                </svg>
              </button>
            )}
            
            {/* Menu Button */}
            <div className="relative group">
              <button className="btn btn-ghost p-1 text-xs" title="More options">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"/>
                </svg>
              </button>
              
              {/* Dropdown menu */}
              <div className="absolute right-0 top-full mt-1 w-32 py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10 rounded-md" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                <button
                  onClick={resetCode}
                  className="w-full px-3 py-1 text-left text-xs hover:bg-gray-700 transition-colors"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Reset
                </button>
                {onRemove && (
                  <button
                    onClick={() => onRemove(editor.id)}
                    className="w-full px-3 py-1 text-left text-xs text-red-400 hover:bg-gray-700 transition-colors"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Input Section */}
        {showInput && activeTab === 'code' && (
          <div className="px-4 pb-3" style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)' }}>
            <label className="block text-xs font-medium mb-2" style={{ color: 'var(--text-muted)' }}>
              Input (stdin):
            </label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter input for your program..."
              className="w-full h-16 px-3 py-2 rounded text-sm font-mono resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              style={{ 
                background: 'var(--bg)', 
                border: '1px solid var(--border)', 
                color: 'var(--text-primary)'
              }}
            />
          </div>
        )}
      </div>

      {/* Tab Content */}
      <div className="flex-1 min-h-0">
        {activeTab === 'code' && (
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
              fontFamily: 'var(--font-mono)',
              lineHeight: 1.6,
              scrollbar: {
                verticalScrollbarSize: 6,
                horizontalScrollbarSize: 6,
              },
            }}
          />
        )}
        
        {activeTab === 'console' && (
          <div className="h-full flex flex-col" style={{ background: 'var(--bg)' }}>
            {/* Console Header */}
            <div className="flex items-center justify-between px-4 py-2" style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Console</span>
                {editor.error && (
                  <span className="status-indicator status-error">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                    </svg>
                    Error
                  </span>
                )}
                {editor.output && !editor.error && (
                  <span className="status-indicator status-success">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                    Success
                  </span>
                )}
              </div>
            </div>
            
            {/* Console Output */}
            <div className="flex-1 overflow-auto">
              {editor.output && (
                <pre className="p-4 text-sm font-mono whitespace-pre-wrap" style={{ color: 'var(--success)' }}>
                  {editor.output}
                </pre>
              )}
              {editor.error && (
                <pre className="p-4 text-sm font-mono whitespace-pre-wrap" style={{ color: 'var(--error)' }}>
                  {editor.error}
                </pre>
              )}
              {!editor.output && !editor.error && (
                <div className="p-4 text-sm italic" style={{ color: 'var(--text-muted)' }}>
                  No output yet. Run your code to see results.
                </div>
              )}
            </div>
          </div>
        )}
        
        {activeTab === 'preview' && (editor.language === 'html' || editor.language === 'css') && (
          <div className="h-full" style={{ background: 'var(--bg)' }}>
            <iframe
              srcDoc={editor.language === 'html' ? editor.code : `<style>${editor.code}</style><div>CSS Preview</div>`}
              className="w-full h-full border-0"
              style={{ background: 'white' }}
            />
          </div>
        )}
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