'use client';

import { useState, useCallback, useEffect } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import CodeEditor from './CodeEditor';
import { CodeEditor as CodeEditorType, ExecutionResult, QuestionData, QuestionMode } from '@/types';
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
  const [questionMode, setQuestionMode] = useState<QuestionMode>({ enabled: false });
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);

  // Check for question parameter in URL and load question
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const questionId = urlParams.get('question');
    
    if (questionId) {
      loadQuestion(questionId);
    }
  }, []);

  // Timer functionality for timed questions
  useEffect(() => {
    if (questionMode.enabled && questionMode.question?.timeLimit && questionMode.startTime) {
      const interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - questionMode.startTime!.getTime()) / 1000 / 60);
        const remaining = questionMode.question!.timeLimit! - elapsed;
        
        if (remaining <= 0) {
          setTimeRemaining(0);
          clearInterval(interval);
          // Auto-submit or show time's up message
          alert('Time\'s up! Your coding session has ended.');
        } else {
          setTimeRemaining(remaining);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [questionMode.enabled, questionMode.startTime, questionMode.question?.timeLimit]);

  const loadQuestion = async (questionId: string) => {
    try {
      const response = await fetch(`/api/question?id=${questionId}`);
      const data = await response.json();
      
      if (data.success && data.question) {
        const question: QuestionData = data.question;
        
        setQuestionMode({
          enabled: true,
          question,
          startTime: new Date(),
          timeRemaining: question.timeLimit
        });

        // Set up editor with question language and starter code
        if (question.starterCode || question.language) {
          const newEditor: CodeEditorType = {
            id: '1',
            language: question.language || 'javascript',
            code: question.starterCode || LANGUAGES[question.language || 'javascript']?.defaultCode || '',
            output: '',
            error: '',
            isRunning: false,
          };
          setEditors([newEditor]);
        }

        setTimeRemaining(question.timeLimit || null);
      } else {
        console.error('Failed to load question:', data.error);
      }
    } catch (error) {
      console.error('Error loading question:', error);
    }
  };

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
    <div className="h-screen flex flex-col" style={{ background: 'var(--bg)' }}>
      {/* Header - Sticky with modern design */}
      <header className="sticky top-0 z-50" style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between px-6 py-3">
          {/* Left side - Product name + environment */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                <span style={{ color: 'var(--accent-primary)' }}>Poly</span>Code
              </h1>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-semibold text-white" style={{ background: questionMode.enabled ? 'var(--env-test)' : 'var(--env-dev)' }}>
                  {questionMode.enabled ? 'Interview' : 'Development'}
                </span>
              </div>
            </div>
            
            {/* Breadcrumbs */}
            <div className="breadcrumbs hidden md:block">
              polycode › projects › {questionMode.enabled ? questionMode.question?.title?.toLowerCase().replace(/\s+/g, '-') || 'interview-session' : 'multi-editor'}
            </div>
          </div>
          
          {/* Right side - Actions */}
          <div className="flex items-center space-x-2">
            {/* Primary Action - Run */}
            <button
              onClick={runAllEditors}
              disabled={editors.some(e => e.isRunning)}
              className="btn btn-success"
              title="Execute code in all editors"
            >
              {editors.some(e => e.isRunning) ? (
                <>
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" strokeOpacity="0.3" />
                    <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Running</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"/>
                  </svg>
                  <span>Run</span>
                </>
              )}
            </button>
            
            {/* Stop button (shows when running) */}
            {editors.some(e => e.isRunning) && (
              <button
                onClick={clearAllOutputs}
                className="btn btn-ghost"
                title="Stop execution"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 000 2h4a1 1 0 100-2H8z" clipRule="evenodd"/>
                </svg>
                <span>Stop</span>
              </button>
            )}
            
            {/* Deploy */}
            <button
              onClick={deployFullStack}
              disabled={isDeploying}
              className="btn btn-ghost"
              title="Deploy as full-stack application"
            >
              {isDeploying ? (
                <>
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" strokeOpacity="0.3" />
                    <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                </>
              ) : (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 01-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 111.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 111.414-1.414L15 13.586V12a1 1 0 011-1z" clipRule="evenodd"/>
                </svg>
              )}
              <span>Deploy</span>
            </button>
            
            {/* Save */}
            <button
              className="btn btn-ghost"
              title="Save current state"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6h5a2 2 0 012 2v7a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h5v5.586l-1.293-1.293zM9 4a1 1 0 012 0v2H9V4z"/>
              </svg>
              <span>Save</span>
            </button>
            
            {/* Share */}
            <button
              className="btn btn-ghost"
              title="Share project"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z"/>
              </svg>
              <span>Share</span>
            </button>
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

      {/* Question Display (Interview/Assessment Mode) */}
      {questionMode.enabled && questionMode.question && (
        <div className="bg-gradient-to-r from-blue-900 to-purple-900 border-b border-gray-700 px-6 py-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-3">
                <h2 className="text-xl font-bold text-white">{questionMode.question.title}</h2>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  questionMode.question.difficulty === 'easy' ? 'bg-green-600 text-white' :
                  questionMode.question.difficulty === 'medium' ? 'bg-yellow-600 text-white' :
                  'bg-red-600 text-white'
                }`}>
                  {questionMode.question.difficulty.charAt(0).toUpperCase() + questionMode.question.difficulty.slice(1)}
                </span>
                <span className="px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-sm font-medium">
                  {questionMode.question.language}
                </span>
                {questionMode.question.tags && questionMode.question.tags.map((tag, index) => (
                  <span key={index} className="px-2 py-1 bg-blue-600 text-white rounded text-xs">
                    {tag}
                  </span>
                ))}
              </div>
              
              <div className="text-gray-300 mb-4 whitespace-pre-wrap">
                {questionMode.question.description}
              </div>

              {questionMode.question.expectedOutput && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-400 mb-2">Expected Output:</h4>
                  <div className="bg-gray-800 rounded-md p-3 font-mono text-sm text-green-400">
                    {questionMode.question.expectedOutput}
                  </div>
                </div>
              )}

              {questionMode.question.testCases && questionMode.question.testCases.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-400 mb-2">Test Cases:</h4>
                  <div className="space-y-2">
                    {questionMode.question.testCases.map((testCase, index) => (
                      <div key={index} className="bg-gray-800 rounded-md p-3 text-sm">
                        <div className="text-gray-300 mb-1">
                          <span className="text-blue-400">Input:</span> {testCase.input}
                        </div>
                        <div className="text-gray-300">
                          <span className="text-green-400">Expected:</span> {testCase.expectedOutput}
                        </div>
                        {testCase.description && (
                          <div className="text-gray-500 text-xs mt-1">{testCase.description}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Timer and Controls */}
            <div className="ml-6 flex flex-col items-end space-y-3">
              {timeRemaining !== null && (
                <div className="bg-gray-800 rounded-lg p-4 text-center">
                  <div className="text-sm text-gray-400 mb-1">Time Remaining</div>
                  <div className={`text-2xl font-bold ${
                    timeRemaining <= 5 ? 'text-red-400' : 
                    timeRemaining <= 15 ? 'text-yellow-400' : 'text-green-400'
                  }`}>
                    {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
                  </div>
                  <div className="text-xs text-gray-500">minutes</div>
                </div>
              )}

              {questionMode.question.hints && questionMode.question.hints.length > 0 && (
                <details className="bg-gray-800 rounded-lg p-4 max-w-xs">
                  <summary className="text-yellow-400 cursor-pointer text-sm font-medium">
                    💡 Hints ({questionMode.question.hints.length})
                  </summary>
                  <div className="mt-2 space-y-2">
                    {questionMode.question.hints.map((hint, index) => (
                      <div key={index} className="text-gray-300 text-sm">
                        {index + 1}. {hint}
                      </div>
                    ))}
                  </div>
                </details>
              )}

              <button
                onClick={() => setQuestionMode({ enabled: false })}
                className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
              >
                Exit Question Mode
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 p-3 min-h-0">
        <div className="h-full">
          <PanelGroup direction="horizontal" className="h-full">
            {editors.map((editor, index) => (
              <div key={editor.id} className="contents">
                <Panel defaultSize={100 / editors.length} minSize={20}>
                  <div 
                    className="persistent-panel-background"
                                          style={{
                        position: 'relative',
                        height: '100%',
                        backgroundImage: 'url("/social.jpg")',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat'
                      }}
                  >
                    {/* Background overlay temporarily removed for testing */}
                    {/* Code Editor */}
                    <div style={{ position: 'relative', zIndex: 2, height: '100%' }}>
                      <CodeEditor
                        editor={editor}
                        onCodeChange={handleCodeChange}
                        onLanguageChange={handleLanguageChange}
                        onExecutionResult={handleExecutionResult}
                        onRemove={editors.length > 1 ? removeEditor : undefined}
                        className="h-full"
                      />
                    </div>
                  </div>
                </Panel>
                
                {index < editors.length - 1 && (
                  <PanelResizeHandle className="w-1 react-resizable-handle group cursor-col-resize">
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="w-0.5 h-6 rounded-full transition-all duration-200 group-hover:w-1 group-hover:h-8" style={{ background: 'var(--border)' }}></div>
                    </div>
                  </PanelResizeHandle>
                )}
              </div>
            ))}
          </PanelGroup>
        </div>
      </main>

      {/* Status Bar */}
      <footer className="flex-shrink-0" style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between px-6 py-2 text-xs" style={{ color: 'var(--text-muted)' }}>
          <div className="flex items-center space-x-4">
            <span className="font-medium">main</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
              </svg>
              Auto-saved
            </span>
            <span>•</span>
            <span>Server: localhost:3000</span>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* System Metrics */}
            <div className="flex items-center space-x-2">
              <span className="flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
                </svg>
                CPU: 24%
              </span>
              <span className="flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd"/>
                </svg>
                RAM: 1.2GB
              </span>
            </div>
            
            <span>•</span>
            
            {/* Latency */}
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full" style={{ background: 'var(--success)' }}></div>
              <span>45ms</span>
            </span>
            
            <span>•</span>
            
            {/* Editor count */}
            <span>{editors.length} panel{editors.length !== 1 ? 's' : ''}</span>
          </div>
        </div>
      </footer>
    </div>
  );
} 