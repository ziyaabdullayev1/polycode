'use client';

import { useState, useCallback } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import CodeEditor from './CodeEditor';
import { CodeEditor as CodeEditorType, ExecutionResult } from '@/types';
import { LANGUAGES, DEFAULT_EDITORS } from '@/config/languages';

export default function PolyCode() {
  const [editors, setEditors] = useState<CodeEditorType[]>(() => 
    DEFAULT_EDITORS.map(({ id, language }) => ({
      id,
      language,
      code: LANGUAGES[language]?.defaultCode || '',
      output: '',
      error: '',
      isRunning: false,
    }))
  );

  const [globalInput, setGlobalInput] = useState('');
  const [showGlobalInput, setShowGlobalInput] = useState(false);
  const [fullStackMode, setFullStackMode] = useState(false);
  const [fullStackResult, setFullStackResult] = useState<any>(null);
  const [isDeploying, setIsDeploying] = useState(false);

  const handleCodeChange = useCallback((id: string, code: string) => {
    setEditors(prev => prev.map(editor => 
      editor.id === id ? { ...editor, code } : editor
    ));
  }, []);

  const handleLanguageChange = useCallback((id: string, language: string) => {
    const defaultCode = LANGUAGES[language]?.defaultCode || '';
    setEditors(prev => prev.map(editor => 
      editor.id === id 
        ? { ...editor, language, code: defaultCode, output: '', error: '' }
        : editor
    ));
  }, []);

  const handleExecutionResult = useCallback((id: string, result: ExecutionResult) => {
    setEditors(prev => prev.map(editor => 
      editor.id === id 
        ? { 
            ...editor, 
            output: result.output, 
            error: result.error,
            isRunning: false 
          }
        : editor
    ));
  }, []);

  const runAllEditors = async () => {
    setEditors(prev => prev.map(editor => ({ ...editor, isRunning: true })));

    // Execute all editors in parallel
    const promises = editors.map(async (editor) => {
      try {
        const response = await fetch('/api/execute', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code: editor.code,
            language: editor.language,
            input: globalInput
          })
        });
        
        const result = await response.json();
        return { id: editor.id, result };
      } catch (error) {
        return {
          id: editor.id,
          result: {
            success: false,
            output: '',
            error: 'Execution failed',
            exitCode: 1,
            language: editor.language
          }
        };
      }
    });

    const results = await Promise.all(promises);
    
    // Update all editors with their results
    setEditors(prev => prev.map(editor => {
      const result = results.find(r => r.id === editor.id);
      if (result) {
        return {
          ...editor,
          output: result.result.output,
          error: result.result.error,
          isRunning: false
        };
      }
      return { ...editor, isRunning: false };
    }));
  };

  const clearAllOutputs = () => {
    setEditors(prev => prev.map(editor => ({
      ...editor,
      output: '',
      error: ''
    })));
  };

  const resetAllEditors = () => {
    setEditors(prev => prev.map(editor => ({
      ...editor,
      code: LANGUAGES[editor.language]?.defaultCode || '',
      output: '',
      error: ''
    })));
  };

  const addEditor = () => {
    if (editors.length >= 6) return; // Maximum 6 editors
    
    const newId = String(editors.length + 1);
    const defaultLanguage = 'javascript';
    
    setEditors(prev => [...prev, {
      id: newId,
      language: defaultLanguage,
      code: LANGUAGES[defaultLanguage]?.defaultCode || '',
      output: '',
      error: '',
      isRunning: false,
    }]);
  };

  const removeEditor = (id: string) => {
    if (editors.length <= 1) return; // Keep at least one editor
    
    setEditors(prev => prev.filter(editor => editor.id !== id));
  };

  const deployFullStack = async () => {
    setIsDeploying(true);
    setFullStackResult(null);

    try {
      // Get code from different editors by language
      const htmlEditor = editors.find(e => e.language === 'html');
      const cssEditor = editors.find(e => e.language === 'css');
      const jsEditor = editors.find(e => e.language === 'javascript');
      const nodeEditor = editors.find(e => e.language === 'javascript' && 
        (e.code.includes('express') || e.code.includes('app.') || e.code.includes('router')));

      // If no specific Node.js editor, check for any JavaScript that looks like server code
      const backendEditor = nodeEditor || editors.find(e => 
        e.language === 'javascript' && 
        (e.code.includes('app.get') || e.code.includes('app.post') || e.code.includes('require'))
      );

      const payload = {
        html: htmlEditor?.code,
        css: cssEditor?.code,
        javascript: jsEditor && jsEditor !== backendEditor ? jsEditor.code : undefined,
        nodejs: backendEditor?.code,
        port: 3001 + Math.floor(Math.random() * 19) // Random port between 3001-3020 for Docker compatibility
      };

      const response = await fetch('/api/fullstack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      setFullStackResult(result);

      if (result.success) {
        // Open the application in a new tab
        window.open(result.url, '_blank');
      }

    } catch (error: any) {
      setFullStackResult({
        success: false,
        error: error.message || 'Failed to deploy full-stack application'
      });
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-bold text-white">
                <span className="text-blue-400">Poly</span>Code
              </h1>
              <span className="text-sm text-gray-400 bg-gray-700 px-2 py-1 rounded-full">
                Multi-language coding platform
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
            {/* Editor Controls Group */}
            <div className="flex items-center space-x-3 bg-gray-700/50 rounded-lg p-1">
              <button
                onClick={() => setShowGlobalInput(!showGlobalInput)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                  showGlobalInput 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'text-gray-300 hover:text-white hover:bg-gray-600'
                }`}
                title="Toggle global input for all editors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
                </svg>
                <span>Global Input</span>
              </button>
              
              <button
                onClick={clearAllOutputs}
                className="text-gray-300 hover:text-white hover:bg-gray-600 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center space-x-2"
                title="Clear all editor outputs"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clipRule="evenodd"/>
                  <path fillRule="evenodd" d="M10 5a2 2 0 00-2 2v6a2 2 0 002 2h4a2 2 0 002-2V7a2 2 0 00-2-2H10z" clipRule="evenodd"/>
                </svg>
                <span>Clear All</span>
              </button>
              
              <button
                onClick={resetAllEditors}
                className="text-gray-300 hover:text-white hover:bg-gray-600 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center space-x-2"
                title="Reset all editors to default code"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd"/>
                </svg>
                <span>Reset All</span>
              </button>
            </div>

            {/* Editor Management */}
            <button
              onClick={addEditor}
              disabled={editors.length >= 6}
              className="bg-gray-700 hover:bg-gray-600 disabled:bg-gray-600 disabled:opacity-50 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 shadow-md disabled:cursor-not-allowed"
              title={editors.length >= 6 ? "Maximum 6 editors allowed" : "Add new code editor"}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/>
              </svg>
              <span>Add Editor</span>
              <span className="text-xs bg-gray-600 px-1.5 py-0.5 rounded-full">
                {editors.length}/6
              </span>
            </button>

            {/* Primary Actions */}
            <div className="flex items-center space-x-3">
              <button
                onClick={runAllEditors}
                disabled={editors.some(e => e.isRunning)}
                className="bg-green-600 hover:bg-green-500 disabled:bg-gray-600 disabled:opacity-50 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed"
                title="Execute code in all editors"
              >
                {editors.some(e => e.isRunning) ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" strokeOpacity="0.3" />
                      <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Running All...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"/>
                    </svg>
                    <span>Run All</span>
                    <span className="text-xs bg-green-500 px-1.5 py-0.5 rounded-full">
                      {editors.length}
                    </span>
                  </>
                )}
              </button>

              <div className="h-8 w-px bg-gray-600"></div>

              <button
                onClick={deployFullStack}
                disabled={isDeploying}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:from-gray-600 disabled:to-gray-600 disabled:opacity-50 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed"
                title="Deploy as full-stack application"
              >
                {isDeploying ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" strokeOpacity="0.3" />
                      <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Deploying...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 01-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 111.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 111.414-1.414L15 13.586V12a1 1 0 011-1z" clipRule="evenodd"/>
                    </svg>
                    <span>Deploy Full-Stack</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Global Input */}
        {showGlobalInput && (
          <div className="mt-4 p-4 bg-gray-900 rounded-lg border border-gray-700">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Global Input (stdin for all editors):
            </label>
            <textarea
              value={globalInput}
              onChange={(e) => setGlobalInput(e.target.value)}
              placeholder="Enter input that will be passed to all programs..."
              className="w-full h-24 px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-sm text-white font-mono resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500"
            />
          </div>
        )}

        {/* Full-Stack Deployment Result */}
        {fullStackResult && (
          <div className="mt-4 p-4 bg-gray-900 rounded-lg border border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-medium text-white flex items-center space-x-2">
                {fullStackResult.success ? (
                  <>
                    <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                    </svg>
                    <span>Deployment Successful</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                    </svg>
                    <span>Deployment Failed</span>
                  </>
                )}
              </h3>
              <button
                onClick={() => setFullStackResult(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
                </svg>
              </button>
            </div>

            {fullStackResult.success ? (
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <span className="text-green-400 font-medium">🌐 Application URL:</span>
                  <a 
                    href={fullStackResult.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 underline"
                  >
                    {fullStackResult.url}
                  </a>
                </div>
                
                <div className="bg-gray-800 rounded p-3">
                  <div className="text-sm text-gray-300 mb-2">📁 Project Files:</div>
                  {Object.entries(fullStackResult.files || {}).map(([file, status]) => (
                    <div key={file} className="text-xs text-gray-400 flex justify-between">
                      <span>{file}</span>
                      <span>{String(status)}</span>
                    </div>
                  ))}
                </div>

                <div className="bg-gray-800 rounded p-3">
                  <div className="text-sm text-gray-300 mb-2">⚡ Features:</div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-400">
                    <div>Frontend: {fullStackResult.features?.frontend ? '✅' : '❌'}</div>
                    <div>Backend: {fullStackResult.features?.backend ? '✅' : '❌'}</div>
                    <div>Port: {fullStackResult.features?.port}</div>
                    <div>Project ID: {fullStackResult.projectId}</div>
                  </div>
                </div>

                <div className="text-sm text-green-300">{fullStackResult.message}</div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="text-red-300 text-sm">{fullStackResult.error}</div>
                {fullStackResult.suggestion && (
                  <div className="text-yellow-300 text-sm">💡 {fullStackResult.suggestion}</div>
                )}
              </div>
            )}
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 p-3 min-h-0">
        <div className="h-full">
          <PanelGroup direction="horizontal" className="h-full">
            {editors.map((editor, index) => (
              <div key={editor.id} className="contents">
                <Panel defaultSize={100 / editors.length} minSize={20}>
                  <CodeEditor
                    editor={editor}
                    onCodeChange={handleCodeChange}
                    onLanguageChange={handleLanguageChange}
                    onExecutionResult={handleExecutionResult}
                    onRemove={editors.length > 1 ? removeEditor : undefined}
                    className="h-full"
                  />
                </Panel>
                
                {index < editors.length - 1 && (
                  <PanelResizeHandle className="w-1 bg-gray-700 hover:bg-gray-600 transition-colors flex items-center justify-center">
                    <div className="w-0.5 h-8 bg-gray-500 rounded-full" />
                  </PanelResizeHandle>
                )}
              </div>
            ))}
          </PanelGroup>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 border-t border-gray-700 px-6 py-3">
        <div className="flex items-center justify-between text-sm text-gray-400">
          <div className="flex items-center space-x-4">
            <span>PolyCode v1.0</span>
            <span>•</span>
            <span>{editors.length} editor{editors.length !== 1 ? 's' : ''} active</span>
          </div>
          <div className="flex items-center space-x-4">
            <span>Powered by Piston API</span>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span>Online</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
} 