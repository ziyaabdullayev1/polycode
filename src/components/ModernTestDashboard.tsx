'use client';

import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';

interface Question {
  id: string;
  title: string;
  difficulty: 'easy' | 'medium' | 'hard';
  language: string;
  tags: string[];
  timeLimit: number; // in minutes
  description: string;
  expectedInput?: string;
  expectedOutput?: string;
  starterCode?: string;
  testCases: TestCase[];
  hints: string[];
  status: 'draft' | 'testing' | 'approved' | 'published';
  createdAt?: Date;
  expiresAt?: Date;
  testResults?: {
    passed: boolean;
    score: number;
    feedback: string;
  };
}

interface TestCase {
  input: string;
  expectedOutput: string;
  description?: string;
  hidden?: boolean;
}

interface TimerState {
  timeRemaining: number;
  isRunning: boolean;
  isWarning: boolean;
  isCritical: boolean;
}

export default function ModernTestDashboard() {
  // Core state
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  
  // UI state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [editingQuestion, setEditingQuestion] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'test-cases' | 'hints' | 'history'>('overview');
  
  // New question form state
  const [showNewQuestionForm, setShowNewQuestionForm] = useState(false);
  const [newQuestionForm, setNewQuestionForm] = useState({
    title: '',
    description: '',
    language: 'javascript',
    difficulty: 'medium' as 'easy' | 'medium' | 'hard',
    expectedInput: '',
    expectedOutput: '',
    starterCode: '',
    timeLimit: 30,
    hints: [''],
    testCases: [{ input: '', expectedOutput: '', description: '' }],
    tags: ['interview']
  });
  
  // Question mode state
  const [questionMode, setQuestionMode] = useState(false);
  const [timer, setTimer] = useState<TimerState>({
    timeRemaining: 0,
    isRunning: false,
    isWarning: false,
    isCritical: false
  });
  const [expandedHints, setExpandedHints] = useState<number[]>([]);
  const [currentHintIndex, setCurrentHintIndex] = useState(0);
  
  // Solve mode state
  const [solveMode, setSolveMode] = useState(false);
  const [currentCode, setCurrentCode] = useState('');
  const [codeOutput, setCodeOutput] = useState('');
  const [codeError, setCodeError] = useState('');
  const [isRunningCode, setIsRunningCode] = useState(false);
  const [testResults, setTestResults] = useState<{
    passed: number;
    total: number;
    results: Array<{
      input: string;
      expected: string;
      actual: string;
      passed: boolean;
    }>;
  } | null>(null);

  // Programming languages
  const programmingLanguages = [
    { value: 'javascript', label: 'JavaScript' },
    { value: 'python', label: 'Python' },
    { value: 'java', label: 'Java' },
    { value: 'cpp', label: 'C++' },
    { value: 'c', label: 'C' },
    { value: 'csharp', label: 'C#' },
    { value: 'go', label: 'Go' },
    { value: 'rust', label: 'Rust' },
    { value: 'typescript', label: 'TypeScript' },
    { value: 'php', label: 'PHP' },
    { value: 'ruby', label: 'Ruby' },
    { value: 'swift', label: 'Swift' },
    { value: 'kotlin', label: 'Kotlin' },
    { value: 'sql', label: 'SQL' },
    { value: 'html', label: 'HTML' },
    { value: 'css', label: 'CSS' }
  ];

  const filteredQuestions = questions.filter(question => {
    const matchesSearch = question.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty = selectedDifficulty === 'all' || question.difficulty === selectedDifficulty;
    return matchesSearch && matchesDifficulty;
  });

  // Timer management
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (timer.isRunning && timer.timeRemaining > 0) {
      interval = setInterval(() => {
        setTimer(prev => {
          const newTimeRemaining = prev.timeRemaining - 1;
          const totalTime = selectedQuestion?.timeLimit ? selectedQuestion.timeLimit * 60 : 0;
          const warningThreshold = totalTime * 0.25; // 25% remaining
          const criticalThreshold = totalTime * 0.1; // 10% remaining
          
          return {
            ...prev,
            timeRemaining: newTimeRemaining,
            isWarning: newTimeRemaining <= warningThreshold && newTimeRemaining > criticalThreshold,
            isCritical: newTimeRemaining <= criticalThreshold,
            isRunning: newTimeRemaining > 0
          };
        });
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [timer.isRunning, timer.timeRemaining, selectedQuestion?.timeLimit]);

  // Load questions on mount
  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/question');
      const result = await response.json();

      if (result.success) {
        const loadedQuestions: Question[] = result.questions.map((q: any) => ({
          id: q.id,
          title: q.title,
          difficulty: q.difficulty,
          language: q.language,
          tags: q.tags || [],
          timeLimit: q.timeLimit || 30,
          description: q.description || '',
          expectedOutput: q.expectedOutput,
          starterCode: q.starterCode,
          testCases: q.testCases?.map((tc: any) => ({
            input: tc.input,
            expectedOutput: tc.expectedOutput,
            description: tc.description,
            hidden: tc.hidden || false
          })) || [],
          hints: q.hints || [],
          status: 'published' as const,
          createdAt: q.createdAt ? new Date(q.createdAt) : new Date()
        }));

        setQuestions(loadedQuestions);
      } else {
        showNotification('Failed to load questions', 'error');
      }
    } catch (error) {
      console.error('Error loading questions:', error);
      showNotification('Error loading questions', 'error');
    } finally {
      setLoading(false);
    }
  };

  const resetNewQuestionForm = () => {
    setNewQuestionForm({
      title: '',
      description: '',
      language: 'javascript',
      difficulty: 'medium',
      expectedInput: '',
      expectedOutput: '',
      starterCode: '',
      timeLimit: 30,
      hints: [''],
      testCases: [{ input: '', expectedOutput: '', description: '' }],
      tags: ['interview']
    });
  };

  const createNewQuestion = () => {
    resetNewQuestionForm();
    setShowNewQuestionForm(true);
  };

  const addTestCase = () => {
    setNewQuestionForm(prev => ({
      ...prev,
      testCases: [...prev.testCases, { input: '', expectedOutput: '', description: '' }]
    }));
  };

  const removeTestCase = (index: number) => {
    if (newQuestionForm.testCases.length > 1) {
      setNewQuestionForm(prev => ({
        ...prev,
        testCases: prev.testCases.filter((_, i) => i !== index)
      }));
    }
  };

  const updateTestCase = (index: number, field: string, value: string) => {
    setNewQuestionForm(prev => ({
      ...prev,
      testCases: prev.testCases.map((tc, i) => 
        i === index ? { ...tc, [field]: value } : tc
      )
    }));
  };

  const addHint = () => {
    setNewQuestionForm(prev => ({
      ...prev,
      hints: [...prev.hints, '']
    }));
  };

  const removeHint = (index: number) => {
    if (newQuestionForm.hints.length > 1) {
      setNewQuestionForm(prev => ({
        ...prev,
        hints: prev.hints.filter((_, i) => i !== index)
      }));
    }
  };

  const updateHint = (index: number, value: string) => {
    setNewQuestionForm(prev => ({
      ...prev,
      hints: prev.hints.map((hint, i) => i === index ? value : hint)
    }));
  };

  const submitNewQuestion = async () => {
    // Validation
    if (!newQuestionForm.title.trim()) {
      showNotification('Title is required', 'error');
      return;
    }
    if (!newQuestionForm.description.trim()) {
      showNotification('Description is required', 'error');
      return;
    }
    if (newQuestionForm.testCases.some(tc => !tc.input.trim() || !tc.expectedOutput.trim())) {
      showNotification('All test cases must have input and expected output', 'error');
      return;
    }

    const questionData = {
      title: newQuestionForm.title,
      description: newQuestionForm.description,
      language: newQuestionForm.language,
      difficulty: newQuestionForm.difficulty,
      expectedInput: newQuestionForm.expectedInput || undefined,
      expectedOutput: newQuestionForm.expectedOutput || undefined,
      starterCode: newQuestionForm.starterCode || undefined,
      timeLimit: newQuestionForm.timeLimit,
      testCases: newQuestionForm.testCases.map(tc => ({
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        description: tc.description || undefined
      })),
      hints: newQuestionForm.hints.filter(hint => hint.trim()),
      tags: newQuestionForm.tags
    };

    try {
      setLoading(true);
      const response = await fetch('/api/question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(questionData)
      });

      const result = await response.json();

      if (result.success) {
        const newQuestion: Question = {
          ...result.question,
          status: 'draft' as const,
          testCases: result.question.testCases?.map((tc: any) => ({
            input: tc.input,
            expectedOutput: tc.expectedOutput,
            description: tc.description,
            hidden: tc.hidden || false
          })) || [],
          createdAt: new Date()
        };

        setQuestions(prev => [newQuestion, ...prev]);
        setSelectedQuestion(newQuestion);
        setShowNewQuestionForm(false);
        setActiveTab('overview');
        
        showNotification(`Question created successfully! URL: ${result.url}`, 'success');
      } else {
        showNotification(`Failed to create question: ${result.error}`, 'error');
      }
    } catch (error) {
      console.error('Error creating question:', error);
      showNotification('Error creating question. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const testQuestion = async (questionId: string) => {
    try {
      setLoading(true);
      
      // Update question status to testing
      setQuestions(prev => prev.map(q => 
        q.id === questionId ? { ...q, status: 'testing' as const } : q
      ));
      
      // Simulate testing process
      setTimeout(() => {
        const testResults = {
          passed: Math.random() > 0.3, // 70% pass rate
          score: Math.floor(Math.random() * 30) + 70, // 70-100 score
          feedback: 'Test completed successfully'
        };
        
        setQuestions(prev => prev.map(q => 
          q.id === questionId ? { 
            ...q, 
            status: testResults.passed ? 'approved' : 'draft',
            testResults 
          } : q
        ));
        
        showNotification(
          testResults.passed 
            ? `Question tested successfully! Score: ${testResults.score}/100`
            : 'Question failed testing. Please review and try again.',
          testResults.passed ? 'success' : 'error'
        );
        
        setLoading(false);
      }, 3000);
      
    } catch (error) {
      console.error('Error testing question:', error);
      showNotification('Error testing question', 'error');
      setLoading(false);
    }
  };

  const approveQuestion = async (questionId: string) => {
    try {
      // Move to question pool (published status)
      setQuestions(prev => prev.map(q => 
        q.id === questionId ? { ...q, status: 'published' as const } : q
      ));
      
      showNotification('Question approved and added to question pool!', 'success');
    } catch (error) {
      console.error('Error approving question:', error);
      showNotification('Error approving question', 'error');
    }
  };

  const startQuestionMode = (question: Question) => {
    setSelectedQuestion(question);
    setQuestionMode(true);
    setExpandedHints([]);
    setCurrentHintIndex(0);
    
    // Initialize timer
    if (question.timeLimit) {
      setTimer({
        timeRemaining: question.timeLimit * 60,
        isRunning: true,
        isWarning: false,
        isCritical: false
      });
    }
    
    setActiveTab('overview');
  };

  const startSolveMode = (question: Question) => {
    setSelectedQuestion(question);
    setSolveMode(true);
    setCurrentCode(question.starterCode || '// Write your solution here\n');
    setCodeOutput('');
    setCodeError('');
    setTestResults(null);
    setExpandedHints([]);
    setCurrentHintIndex(0);
    
    // Initialize timer
    if (question.timeLimit) {
      setTimer({
        timeRemaining: question.timeLimit * 60,
        isRunning: true,
        isWarning: false,
        isCritical: false
      });
    }
  };

  const exitSolveMode = () => {
    setSolveMode(false);
    setCurrentCode('');
    setCodeOutput('');
    setCodeError('');
    setTestResults(null);
    setTimer({
      timeRemaining: 0,
      isRunning: false,
      isWarning: false,
      isCritical: false
    });
    setExpandedHints([]);
    setCurrentHintIndex(0);
  };

  const exitQuestionMode = () => {
    setQuestionMode(false);
    setTimer({
      timeRemaining: 0,
      isRunning: false,
      isWarning: false,
      isCritical: false
    });
    setExpandedHints([]);
    setCurrentHintIndex(0);
  };

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), type === 'success' ? 5000 : 3000);
  };

  const runCode = async () => {
    if (!selectedQuestion || !currentCode.trim()) {
      showNotification('Please write some code first', 'error');
      return;
    }

    setIsRunningCode(true);
    setCodeOutput('');
    setCodeError('');

    try {
      const response = await fetch('/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: currentCode,
          language: selectedQuestion.language,
          input: ''
        })
      });

      const result = await response.json();

      if (result.success) {
        setCodeOutput(result.output || '');
        setCodeError('');
      } else {
        setCodeError(result.error || 'Execution failed');
        setCodeOutput('');
      }
    } catch (error) {
      console.error('Error running code:', error);
      setCodeError('Failed to execute code');
    } finally {
      setIsRunningCode(false);
    }
  };

  const runTests = async () => {
    if (!selectedQuestion || !currentCode.trim()) {
      showNotification('Please write some code first', 'error');
      return;
    }

    if (!selectedQuestion.testCases || selectedQuestion.testCases.length === 0) {
      showNotification('No test cases available for this question', 'error');
      return;
    }

    setIsRunningCode(true);
    setTestResults(null);

    try {
      const results = [];
      let passed = 0;

      for (const testCase of selectedQuestion.testCases) {
        const response = await fetch('/api/execute', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code: currentCode,
            language: selectedQuestion.language,
            input: testCase.input
          })
        });

        const result = await response.json();
        const actual = result.success ? (result.output || '').trim() : 'Error';
        const expected = testCase.expectedOutput.trim();
        const testPassed = actual === expected;

        if (testPassed) passed++;

        results.push({
          input: testCase.input,
          expected: expected,
          actual: actual,
          passed: testPassed
        });
      }

      setTestResults({
        passed,
        total: selectedQuestion.testCases.length,
        results
      });

      if (passed === selectedQuestion.testCases.length) {
        showNotification(`All tests passed! (${passed}/${selectedQuestion.testCases.length})`, 'success');
      } else {
        showNotification(`${passed}/${selectedQuestion.testCases.length} tests passed`, 'error');
      }

    } catch (error) {
      console.error('Error running tests:', error);
      showNotification('Failed to run tests', 'error');
    } finally {
      setIsRunningCode(false);
    }
  };

  const resetCode = () => {
    setCurrentCode(selectedQuestion?.starterCode || '// Write your solution here\n');
    setCodeOutput('');
    setCodeError('');
    setTestResults(null);
  };

  // Map our language names to Monaco editor language identifiers
  const getMonacoLanguage = (language: string): string => {
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
      rust: 'rust',
      ruby: 'ruby',
      swift: 'swift',
      kotlin: 'kotlin',
    };
    return monacoMap[language] || 'plaintext';
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const revealNextHint = () => {
    if (selectedQuestion && currentHintIndex < selectedQuestion.hints.length) {
      setExpandedHints(prev => [...prev, currentHintIndex]);
      setCurrentHintIndex(prev => prev + 1);
    }
  };

  const updateQuestion = async (questionId: string, updates: Partial<Question>) => {
    // Update local state immediately
    setQuestions(prev => prev.map(q => 
      q.id === questionId ? { ...q, ...updates } : q
    ));
    
    if (selectedQuestion?.id === questionId) {
      setSelectedQuestion(prev => prev ? { ...prev, ...updates } : null);
    }

    // Save to API
    try {
      const currentQuestion = questions.find(q => q.id === questionId);
      if (currentQuestion) {
        const updatedQuestion = { ...currentQuestion, ...updates };
        
        const apiData = {
          id: updatedQuestion.id,
          title: updatedQuestion.title,
          description: updatedQuestion.description,
          language: updatedQuestion.language,
          difficulty: updatedQuestion.difficulty,
          starterCode: updatedQuestion.starterCode || '',
          expectedOutput: updatedQuestion.expectedOutput,
          timeLimit: updatedQuestion.timeLimit,
          testCases: updatedQuestion.testCases.map(tc => ({
            input: tc.input,
            expectedOutput: tc.expectedOutput,
            description: tc.description
          })),
          hints: updatedQuestion.hints,
          tags: updatedQuestion.tags
        };

        await fetch('/api/question', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(apiData)
        });
      }
    } catch (error) {
      console.error('Error updating question:', error);
    }
  };

  const deleteQuestion = async (questionId: string) => {
    try {
      const response = await fetch(`/api/question?id=${questionId}`, {
        method: 'DELETE'
      });

      const result = await response.json();

      if (result.success) {
        setQuestions(prev => prev.filter(q => q.id !== questionId));
        if (selectedQuestion?.id === questionId) {
          setSelectedQuestion(null);
          setQuestionMode(false);
        }
        showNotification('Question deleted successfully', 'success');
      } else {
        showNotification(`Failed to delete question: ${result.error}`, 'error');
      }
    } catch (error) {
      console.error('Error deleting question:', error);
      showNotification('Error deleting question', 'error');
    }
  };

  // Render solve mode
  const renderSolveMode = () => {
    if (!selectedQuestion || !solveMode) return null;

    return (
      <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
        {/* Header */}
        <header className="sticky top-0 z-50" style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  Solving: {selectedQuestion.title}
                </h1>
                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                  selectedQuestion.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                  selectedQuestion.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {selectedQuestion.difficulty}
                </span>
                <span className="px-2 py-1 rounded text-xs font-semibold" style={{ background: 'var(--border)', color: 'var(--text-secondary)' }}>
                  {selectedQuestion.language}
                </span>
                {testResults && (
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    testResults.passed === testResults.total ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {testResults.passed}/{testResults.total} tests passed
                  </span>
                )}
              </div>
              
              {/* Timer and Actions */}
              <div className="flex items-center space-x-4">
                {selectedQuestion.timeLimit && (
                  <div className={`flex items-center gap-2 px-3 py-2 rounded-lg font-mono text-lg ${
                    timer.isCritical ? 'bg-red-100 text-red-800' :
                    timer.isWarning ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L10 9.586V6z" clipRule="evenodd"/>
                    </svg>
                    <span>{formatTime(timer.timeRemaining)}</span>
                  </div>
                )}
                
                <button
                  onClick={exitSolveMode}
                  className="btn btn-ghost"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
                  </svg>
                  Exit Solve Mode
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex h-[calc(100vh-5rem)]">
          {/* Left Panel - Problem Description */}
          <div className="w-2/5 flex flex-col" style={{ background: 'var(--surface)', borderRight: '1px solid var(--border)' }}>
            <div className="flex-1 overflow-y-auto p-6">
              {/* Problem Description */}
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Problem</h2>
                <div className="prose prose-sm max-w-none" style={{ color: 'var(--text-secondary)' }}>
                  <div dangerouslySetInnerHTML={{ __html: selectedQuestion.description.replace(/\n/g, '<br/>') }} />
                </div>
              </div>

              {/* Expected Input/Output */}
              {(selectedQuestion.expectedInput || selectedQuestion.expectedOutput) && (
                <div className="mb-6">
                  <h3 className="text-md font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Input/Output Format</h3>
                  {selectedQuestion.expectedInput && (
                    <div className="mb-3">
                      <h4 className="text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Input:</h4>
                      <div className="p-3 rounded" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
                        <code className="text-sm" style={{ color: 'var(--text-primary)' }}>
                          {selectedQuestion.expectedInput}
                        </code>
                      </div>
                    </div>
                  )}
                  {selectedQuestion.expectedOutput && (
                    <div>
                      <h4 className="text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Output:</h4>
                      <div className="p-3 rounded" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
                        <code className="text-sm" style={{ color: 'var(--text-primary)' }}>
                          {selectedQuestion.expectedOutput}
                        </code>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Test Cases */}
              <div className="mb-6">
                <h3 className="text-md font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Examples</h3>
                <div className="space-y-3">
                  {selectedQuestion.testCases.filter(tc => !tc.hidden).slice(0, 3).map((testCase, index) => (
                    <div key={index} className="p-4 rounded" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
                      <div className="mb-2">
                        <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                          Example {index + 1}
                        </span>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-medium" style={{ color: 'var(--text-secondary)' }}>Input: </span>
                          <code style={{ color: 'var(--text-primary)' }}>{testCase.input}</code>
                        </div>
                        <div>
                          <span className="font-medium" style={{ color: 'var(--text-secondary)' }}>Output: </span>
                          <code style={{ color: 'var(--text-primary)' }}>{testCase.expectedOutput}</code>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Hints */}
              {selectedQuestion.hints.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-md font-semibold" style={{ color: 'var(--text-primary)' }}>
                      Hints ({expandedHints.length}/{selectedQuestion.hints.length})
                    </h3>
                    {currentHintIndex < selectedQuestion.hints.length && (
                      <button
                        onClick={revealNextHint}
                        className="btn btn-ghost text-sm"
                      >
                        💡 Show Hint
                      </button>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    {selectedQuestion.hints.map((hint, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded transition-all duration-300 ${
                          expandedHints.includes(index) 
                            ? 'opacity-100' 
                            : 'opacity-30 blur-sm'
                        }`}
                        style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: 'var(--accent-primary)', color: 'white' }}>
                            {index + 1}
                          </span>
                          {expandedHints.includes(index) && (
                            <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                            </svg>
                          )}
                        </div>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                          {expandedHints.includes(index) ? hint : '••••••••••••••••••••'}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Code Editor */}
          <div className="flex-1 flex flex-col">
            {/* Editor Header */}
            <div className="p-4" style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    Solution Editor
                  </span>
                  <span className="text-xs px-2 py-1 rounded" style={{ background: 'var(--border)', color: 'var(--text-secondary)' }}>
                    {selectedQuestion.language}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={resetCode}
                    className="btn btn-ghost text-sm"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd"/>
                    </svg>
                    Reset
                  </button>
                  <button 
                    onClick={runCode}
                    disabled={isRunningCode}
                    className="btn btn-ghost text-sm"
                  >
                    {isRunningCode ? (
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" strokeOpacity="0.3" />
                        <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"/>
                      </svg>
                    )}
                    Run
                  </button>
                  <button 
                    onClick={runTests}
                    disabled={isRunningCode}
                    className="btn btn-primary"
                  >
                    {isRunningCode ? (
                      <>
                        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" strokeOpacity="0.3" />
                          <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Testing...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                        </svg>
                        Run Tests
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Code Editor Area */}
            <div className="flex-1" style={{ background: 'var(--bg)' }}>
              <Editor
                height="100%"
                language={getMonacoLanguage(selectedQuestion.language)}
                value={currentCode}
                onChange={(value) => setCurrentCode(value || '')}
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
                  fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, "Liberation Mono", "Consolas", monospace',
                  lineHeight: 1.6,
                  scrollbar: {
                    verticalScrollbarSize: 8,
                    horizontalScrollbarSize: 8,
                  },
                  suggestOnTriggerCharacters: true,
                  acceptSuggestionOnEnter: 'on',
                  quickSuggestions: true,
                  formatOnPaste: true,
                  formatOnType: true,
                  autoClosingBrackets: 'always',
                  autoClosingQuotes: 'always',
                  autoIndent: 'full',
                  contextmenu: true,
                  mouseWheelZoom: true,
                }}
              />
            </div>

            {/* Output Panel */}
            <div className="h-48" style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)' }}>
              <div className="h-full overflow-y-auto">
                {/* Output Tabs */}
                <div className="flex border-b" style={{ borderColor: 'var(--border)' }}>
                  <div className="px-4 py-2 text-sm font-medium" style={{ 
                    background: 'var(--bg)', 
                    color: 'var(--text-primary)',
                    borderBottom: '2px solid var(--accent-primary)'
                  }}>
                    Console Output
                  </div>
                  {testResults && (
                    <div className="px-4 py-2 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                      Test Results ({testResults.passed}/{testResults.total})
                    </div>
                  )}
                </div>

                {/* Console Output */}
                <div className="p-4">
                  {codeOutput && (
                    <div className="mb-4">
                      <div className="text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Output:</div>
                      <pre className="text-sm font-mono p-3 rounded" style={{ 
                        background: 'var(--bg)', 
                        color: 'var(--success)',
                        border: '1px solid var(--border)'
                      }}>
                        {codeOutput}
                      </pre>
                    </div>
                  )}

                  {codeError && (
                    <div className="mb-4">
                      <div className="text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Error:</div>
                      <pre className="text-sm font-mono p-3 rounded" style={{ 
                        background: 'var(--bg)', 
                        color: 'var(--error)',
                        border: '1px solid var(--border)'
                      }}>
                        {codeError}
                      </pre>
                    </div>
                  )}

                  {testResults && (
                    <div>
                      <div className="text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                        Test Results: {testResults.passed}/{testResults.total} passed
                      </div>
                      <div className="space-y-2">
                        {testResults.results.map((result, index) => (
                          <div key={index} className="p-3 rounded" style={{ 
                            background: 'var(--bg)', 
                            border: `1px solid ${result.passed ? 'var(--success)' : 'var(--error)'}` 
                          }}>
                            <div className="flex items-center gap-2 mb-2">
                              <span className={`w-2 h-2 rounded-full ${result.passed ? 'bg-green-400' : 'bg-red-400'}`}></span>
                              <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
                                Test Case {index + 1}
                              </span>
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-xs">
                              <div>
                                <div className="font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Input:</div>
                                <code style={{ color: 'var(--text-primary)' }}>{result.input || 'none'}</code>
                              </div>
                              <div>
                                <div className="font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Expected:</div>
                                <code style={{ color: 'var(--text-primary)' }}>{result.expected}</code>
                              </div>
                              <div>
                                <div className="font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Actual:</div>
                                <code style={{ color: result.passed ? 'var(--success)' : 'var(--error)' }}>{result.actual}</code>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {!codeOutput && !codeError && !testResults && (
                    <div className="text-sm italic" style={{ color: 'var(--text-muted)' }}>
                      Run your code or tests to see output here...
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render question in interview mode
  const renderQuestionMode = () => {
    if (!selectedQuestion || !questionMode) return null;

    return (
      <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
        {/* Question Header */}
        <header className="sticky top-0 z-50" style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  {selectedQuestion.title}
                </h1>
                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                  selectedQuestion.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                  selectedQuestion.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {selectedQuestion.difficulty}
                </span>
                <span className="px-2 py-1 rounded text-xs font-semibold" style={{ background: 'var(--border)', color: 'var(--text-secondary)' }}>
                  {selectedQuestion.language}
                </span>
                <div className="flex gap-1">
                  {selectedQuestion.tags.map(tag => (
                    <span key={tag} className="px-1.5 py-0.5 rounded text-xs" style={{ background: 'var(--border)', color: 'var(--text-secondary)' }}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              
              {/* Timer and Actions */}
              <div className="flex items-center space-x-4">
                {selectedQuestion.timeLimit && (
                  <div className={`flex items-center gap-2 px-3 py-2 rounded-lg font-mono text-lg ${
                    timer.isCritical ? 'bg-red-100 text-red-800' :
                    timer.isWarning ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L10 9.586V6z" clipRule="evenodd"/>
                    </svg>
                    <span>{formatTime(timer.timeRemaining)}</span>
                  </div>
                )}
                
                <button
                  onClick={exitQuestionMode}
                  className="btn btn-ghost"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
                  </svg>
                  Exit Question Mode
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Question Content */}
        <div className="flex h-[calc(100vh-5rem)]">
          {/* Left Panel - Question Details */}
          <div className="w-1/2 flex flex-col" style={{ background: 'var(--surface)', borderRight: '1px solid var(--border)' }}>
            <div className="flex-1 overflow-y-auto p-6">
              {/* Description */}
              <div className="mb-8">
                <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Problem Description</h2>
                <div className="prose prose-sm max-w-none" style={{ color: 'var(--text-secondary)' }}>
                  <div dangerouslySetInnerHTML={{ __html: selectedQuestion.description.replace(/\n/g, '<br/>') }} />
                </div>
              </div>

              {/* Expected Output */}
              {selectedQuestion.expectedOutput && (
                <div className="mb-8">
                  <h3 className="text-md font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Expected Output</h3>
                  <div className="p-4 rounded-lg" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
                    <code className="text-sm" style={{ color: 'var(--text-primary)' }}>
                      {selectedQuestion.expectedOutput}
                    </code>
                  </div>
                </div>
              )}

              {/* Test Cases */}
              <div className="mb-8">
                <h3 className="text-md font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Test Cases</h3>
                <div className="space-y-3">
                  {selectedQuestion.testCases.filter(tc => !tc.hidden).map((testCase, index) => (
                    <div key={index} className="p-4 rounded-lg" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
                      <div className="mb-2">
                        <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                          Example {index + 1}
                        </span>
                        {testCase.description && (
                          <span className="text-xs ml-2" style={{ color: 'var(--text-muted)' }}>
                            ({testCase.description})
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Input:</div>
                          <code className="block p-2 rounded" style={{ background: 'var(--surface)', color: 'var(--text-primary)' }}>
                            {testCase.input}
                          </code>
                        </div>
                        <div>
                          <div className="font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Output:</div>
                          <code className="block p-2 rounded" style={{ background: 'var(--surface)', color: 'var(--text-primary)' }}>
                            {testCase.expectedOutput}
                          </code>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Hints Section */}
              {selectedQuestion.hints.length > 0 && (
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-md font-semibold" style={{ color: 'var(--text-primary)' }}>
                      Hints ({expandedHints.length}/{selectedQuestion.hints.length})
                    </h3>
                    {currentHintIndex < selectedQuestion.hints.length && (
                      <button
                        onClick={revealNextHint}
                        className="btn btn-ghost text-sm"
                      >
                        Reveal Next Hint
                      </button>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    {selectedQuestion.hints.map((hint, index) => (
                      <div
                        key={index}
                        className={`p-4 rounded-lg transition-all duration-300 ${
                          expandedHints.includes(index) 
                            ? 'opacity-100' 
                            : 'opacity-50 blur-sm'
                        }`}
                        style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: 'var(--accent-primary)', color: 'white' }}>
                            {index + 1}
                          </span>
                          <span className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
                            Hint {index + 1}
                          </span>
                          {expandedHints.includes(index) && (
                            <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                            </svg>
                          )}
                        </div>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                          {expandedHints.includes(index) ? hint : '••••••••••••••••••••'}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Code Editor */}
          <div className="w-1/2 flex flex-col">
            {/* Editor Header */}
            <div className="p-4" style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    Code Editor
                  </span>
                  <span className="text-xs px-2 py-1 rounded" style={{ background: 'var(--border)', color: 'var(--text-secondary)' }}>
                    {selectedQuestion.language}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button className="btn btn-ghost text-sm">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd"/>
                    </svg>
                    Reset
                  </button>
                  <button className="btn btn-primary">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"/>
                    </svg>
                    Run Code
                  </button>
                </div>
              </div>
            </div>

            {/* Code Editor Area */}
            <div className="flex-1" style={{ background: 'var(--bg)' }}>
              <textarea
                className="w-full h-full p-4 font-mono text-sm resize-none focus:outline-none"
                style={{ 
                  background: 'var(--bg)', 
                  color: 'var(--text-primary)',
                  border: 'none'
                }}
                defaultValue={selectedQuestion.starterCode}
                placeholder="// Write your solution here..."
              />
            </div>

            {/* Output Panel */}
            <div className="h-32" style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)' }}>
              <div className="p-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Console Output</span>
                  <span className="status-indicator status-success">Ready</span>
                </div>
                <div className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                  Click "Run Code" to see output...
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render new question form
  const renderNewQuestionForm = () => {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto m-4" style={{ background: 'var(--surface)' }}>
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Create New Interview Question</h2>
              <button
                onClick={() => setShowNewQuestionForm(false)}
                className="btn btn-ghost p-1"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Basic Information */}
                <div>
                  <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Basic Information</h3>
                  
                  {/* Title */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                      Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={newQuestionForm.title}
                      onChange={(e) => setNewQuestionForm(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="e.g., Two Sum Problem"
                      className="w-full px-3 py-2 rounded border focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      style={{ 
                        background: 'var(--bg)', 
                        border: '1px solid var(--border)', 
                        color: 'var(--text-primary)'
                      }}
                    />
                  </div>

                  {/* Language and Difficulty */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                        Programming Language
                      </label>
                      <select
                        value={newQuestionForm.language}
                        onChange={(e) => setNewQuestionForm(prev => ({ ...prev, language: e.target.value }))}
                        className="w-full px-3 py-2 rounded border focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        style={{ 
                          background: 'var(--bg)', 
                          border: '1px solid var(--border)', 
                          color: 'var(--text-primary)'
                        }}
                      >
                        {programmingLanguages.map(lang => (
                          <option key={lang.value} value={lang.value}>{lang.label}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                        Difficulty
                      </label>
                      <select
                        value={newQuestionForm.difficulty}
                        onChange={(e) => setNewQuestionForm(prev => ({ ...prev, difficulty: e.target.value as 'easy' | 'medium' | 'hard' }))}
                        className="w-full px-3 py-2 rounded border focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        style={{ 
                          background: 'var(--bg)', 
                          border: '1px solid var(--border)', 
                          color: 'var(--text-primary)'
                        }}
                      >
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                      </select>
                    </div>
                  </div>

                  {/* Time Limit */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                      Time Limit (minutes)
                    </label>
                    <input
                      type="number"
                      min="5"
                      max="180"
                      value={newQuestionForm.timeLimit}
                      onChange={(e) => setNewQuestionForm(prev => ({ ...prev, timeLimit: parseInt(e.target.value) || 30 }))}
                      className="w-full px-3 py-2 rounded border focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      style={{ 
                        background: 'var(--bg)', 
                        border: '1px solid var(--border)', 
                        color: 'var(--text-primary)'
                      }}
                    />
                  </div>

                  {/* Description */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                      Problem Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={newQuestionForm.description}
                      onChange={(e) => setNewQuestionForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe the problem clearly with examples..."
                      rows={8}
                      className="w-full px-3 py-2 rounded border focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      style={{ 
                        background: 'var(--bg)', 
                        border: '1px solid var(--border)', 
                        color: 'var(--text-primary)'
                      }}
                    />
                  </div>

                  {/* Expected Input/Output */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                        Expected Input <span className="text-xs text-gray-500">(optional)</span>
                      </label>
                      <textarea
                        value={newQuestionForm.expectedInput}
                        onChange={(e) => setNewQuestionForm(prev => ({ ...prev, expectedInput: e.target.value }))}
                        placeholder="Describe input format..."
                        rows={3}
                        className="w-full px-3 py-2 rounded border focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        style={{ 
                          background: 'var(--bg)', 
                          border: '1px solid var(--border)', 
                          color: 'var(--text-primary)'
                        }}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                        Expected Output <span className="text-xs text-gray-500">(optional)</span>
                      </label>
                      <textarea
                        value={newQuestionForm.expectedOutput}
                        onChange={(e) => setNewQuestionForm(prev => ({ ...prev, expectedOutput: e.target.value }))}
                        placeholder="Describe output format..."
                        rows={3}
                        className="w-full px-3 py-2 rounded border focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        style={{ 
                          background: 'var(--bg)', 
                          border: '1px solid var(--border)', 
                          color: 'var(--text-primary)'
                        }}
                      />
                    </div>
                  </div>

                  {/* Starter Code */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                      Starter Code <span className="text-xs text-gray-500">(optional)</span>
                    </label>
                    <div className="h-32 rounded-md overflow-hidden" style={{ border: '1px solid var(--border)' }}>
                      <Editor
                        height="100%"
                        language={getMonacoLanguage(newQuestionForm.language)}
                        value={newQuestionForm.starterCode}
                        onChange={(value) => setNewQuestionForm(prev => ({ ...prev, starterCode: value || '' }))}
                        theme="vs-dark"
                        options={{
                          minimap: { enabled: false },
                          fontSize: 12,
                          lineNumbers: 'on',
                          automaticLayout: true,
                          scrollBeyondLastLine: false,
                          wordWrap: 'on',
                          tabSize: 2,
                          insertSpaces: true,
                          scrollbar: {
                            verticalScrollbarSize: 6,
                            horizontalScrollbarSize: 6,
                          },
                          suggestOnTriggerCharacters: true,
                          quickSuggestions: true,
                          formatOnPaste: true,
                          autoClosingBrackets: 'always',
                          contextmenu: false,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Test Cases */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                      Test Cases <span className="text-red-500">*</span>
                    </h3>
                    <button
                      onClick={addTestCase}
                      className="btn btn-primary text-sm"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/>
                      </svg>
                      Add Test Case
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    {newQuestionForm.testCases.map((testCase, index) => (
                      <div key={index} className="p-4 rounded border" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
                            Test Case {index + 1}
                          </span>
                          {newQuestionForm.testCases.length > 1 && (
                            <button
                              onClick={() => removeTestCase(index)}
                              className="btn btn-ghost p-1 text-red-500"
                            >
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
                              </svg>
                            </button>
                          )}
                        </div>
                        
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>
                              Input
                            </label>
                            <textarea
                              value={testCase.input}
                              onChange={(e) => updateTestCase(index, 'input', e.target.value)}
                              placeholder="Test input..."
                              rows={2}
                              className="w-full px-2 py-1 text-sm rounded border focus:ring-1 focus:ring-blue-500 focus:border-transparent resize-none font-mono"
                              style={{ 
                                background: 'var(--surface)', 
                                border: '1px solid var(--border)', 
                                color: 'var(--text-primary)'
                              }}
                            />
                          </div>
                          
                          <div>
                            <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>
                              Expected Output
                            </label>
                            <textarea
                              value={testCase.expectedOutput}
                              onChange={(e) => updateTestCase(index, 'expectedOutput', e.target.value)}
                              placeholder="Expected output..."
                              rows={2}
                              className="w-full px-2 py-1 text-sm rounded border focus:ring-1 focus:ring-blue-500 focus:border-transparent resize-none font-mono"
                              style={{ 
                                background: 'var(--surface)', 
                                border: '1px solid var(--border)', 
                                color: 'var(--text-primary)'
                              }}
                            />
                          </div>
                          
                          <div>
                            <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>
                              Description (optional)
                            </label>
                            <input
                              type="text"
                              value={testCase.description}
                              onChange={(e) => updateTestCase(index, 'description', e.target.value)}
                              placeholder="Test case description..."
                              className="w-full px-2 py-1 text-sm rounded border focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                              style={{ 
                                background: 'var(--surface)', 
                                border: '1px solid var(--border)', 
                                color: 'var(--text-primary)'
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Hints */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                      Hints <span className="text-xs text-gray-500">(optional)</span>
                    </h3>
                    <button
                      onClick={addHint}
                      className="btn btn-primary text-sm"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/>
                      </svg>
                      Add Hint
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {newQuestionForm.hints.map((hint, index) => (
                      <div key={index} className="flex gap-2">
                        <div className="flex-1">
                          <textarea
                            value={hint}
                            onChange={(e) => updateHint(index, e.target.value)}
                            placeholder={`Hint ${index + 1}...`}
                            rows={2}
                            className="w-full px-3 py-2 text-sm rounded border focus:ring-1 focus:ring-blue-500 focus:border-transparent resize-none"
                            style={{ 
                              background: 'var(--bg)', 
                              border: '1px solid var(--border)', 
                              color: 'var(--text-primary)'
                            }}
                          />
                        </div>
                        {newQuestionForm.hints.length > 1 && (
                          <button
                            onClick={() => removeHint(index)}
                            className="btn btn-ghost p-1 text-red-500"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
                            </svg>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-end gap-3 mt-8 pt-6" style={{ borderTop: '1px solid var(--border)' }}>
              <button
                onClick={() => setShowNewQuestionForm(false)}
                className="btn btn-ghost"
              >
                Cancel
              </button>
              <button
                onClick={submitNewQuestion}
                disabled={loading}
                className="btn btn-primary"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" strokeOpacity="0.3" />
                      <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Creating...
                  </>
                ) : (
                  'Create Question'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render admin dashboard
  const renderDashboard = () => {
    return (
      <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
        {/* Header */}
        <header className="sticky top-0 z-50" style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  <span style={{ color: 'var(--accent-primary)' }}>Poly</span>Code
                </h1>
                <span className="px-3 py-1 rounded-full text-xs font-semibold text-white" style={{ background: 'var(--env-test)' }}>
                  Interview Questions
                </span>
                <div className="breadcrumbs hidden md:block">
                  polycode › admin › interview-questions
                </div>
              </div>
              
              <div className="flex items-center space-x-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'var(--success)' }}></div>
                <span>System Active</span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Layout */}
        <div className="flex h-[calc(100vh-4rem)]">
          {/* Left Sidebar */}
          <div className="w-80 flex-shrink-0" style={{ background: 'var(--surface)', borderRight: '1px solid var(--border)' }}>
            <div className="h-full flex flex-col">
              {/* Sidebar Header */}
              <div className="p-6" style={{ borderBottom: '1px solid var(--border)' }}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Questions</h2>
                  <button 
                    onClick={createNewQuestion}
                    disabled={loading}
                    className="btn btn-primary text-sm"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/>
                    </svg>
                    {loading ? 'Creating...' : 'New Question'}
                  </button>
                </div>
                
                              {/* Search */}
              <div className="relative mb-4">
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: 'var(--text-muted)' }} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"/>
                </svg>
                <input
                  type="text"
                  placeholder="Search questions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-11 pr-3 py-2 text-sm rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  style={{ 
                    background: 'var(--bg)', 
                    border: '1px solid var(--border)', 
                    color: 'var(--text-primary)'
                  }}
                />
              </div>
                
                {/* Filters */}
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>
                    Difficulty
                  </label>
                  <select
                    value={selectedDifficulty}
                    onChange={(e) => setSelectedDifficulty(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    style={{ 
                      background: 'var(--bg)', 
                      border: '1px solid var(--border)', 
                      color: 'var(--text-primary)'
                    }}
                  >
                    <option value="all">All Difficulties</option>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>
              
              {/* Question List */}
              <div className="flex-1 overflow-y-auto">
                {loading ? (
                  <div className="p-6 text-center">
                    <div className="animate-spin w-6 h-6 mx-auto mb-2" style={{ color: 'var(--accent-primary)' }}>
                      <svg fill="currentColor" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" strokeOpacity="0.3" />
                        <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                    </div>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Loading questions...</p>
                  </div>
                ) : filteredQuestions.length === 0 ? (
                  <div className="p-6 text-center">
                    <svg className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--text-muted)' }} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 01-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 111.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 111.414-1.414L15 13.586V12a1 1 0 011-1z" clipRule="evenodd"/>
                    </svg>
                    <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>No questions found</h3>
                    <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>Create your first interview question to get started</p>
                  </div>
                ) : (
                  <div className="space-y-1 p-3">
                    {filteredQuestions.map((question) => {
                      const isSelected = selectedQuestion?.id === question.id;
                      
                      return (
                        <div
                          key={question.id}
                          className={`group p-3 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${
                            isSelected ? 'shadow-lg' : ''
                          }`}
                          style={{
                            background: isSelected ? 'var(--accent-primary)' : 'transparent',
                            color: isSelected ? 'white' : 'var(--text-primary)',
                            border: isSelected ? 'none' : '1px solid var(--border)'
                          }}
                          onClick={() => setSelectedQuestion(question)}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium text-sm leading-tight truncate">
                                {question.title}
                              </h3>
                              <div className="flex items-center gap-2 mt-1">
                                <span className={`w-2 h-2 rounded-full ${
                                  question.difficulty === 'easy' ? 'bg-green-400' :
                                  question.difficulty === 'medium' ? 'bg-yellow-400' :
                                  'bg-red-400'
                                }`}></span>
                                <span className="text-xs opacity-70">{question.timeLimit}min</span>
                                <span className={`text-xs px-1.5 py-0.5 rounded ${
                                  question.status === 'published' ? 'bg-green-100 text-green-800' :
                                  question.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                                  question.status === 'testing' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-gray-100 text-gray-600'
                                }`}>
                                  {question.status}
                                </span>
                              </div>
                            </div>
                            
                            {/* Quick Actions */}
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  startSolveMode(question);
                                }}
                                className="p-1 rounded hover:bg-white/20 transition-colors"
                                title="Solve Question"
                              >
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd"/>
                                </svg>
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  startQuestionMode(question);
                                }}
                                className="p-1 rounded hover:bg-white/20 transition-colors"
                                title="Preview Question"
                              >
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"/>
                                </svg>
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingQuestion(question.id);
                                }}
                                className="p-1 rounded hover:bg-white/20 transition-colors"
                                title="Edit"
                              >
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
                                </svg>
                              </button>
                            </div>
                          </div>
                          
                          {/* Tags */}
                          <div className="flex gap-1 mt-2">
                            {question.tags.slice(0, 2).map(tag => (
                              <span key={tag} className="text-xs px-1.5 py-0.5 rounded opacity-70" style={{ background: 'rgba(255,255,255,0.1)' }}>
                                {tag}
                              </span>
                            ))}
                            {question.tags.length > 2 && (
                              <span className="text-xs px-1.5 py-0.5 rounded opacity-70" style={{ background: 'rgba(255,255,255,0.1)' }}>
                                +{question.tags.length - 2}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              
              {/* Sidebar Footer */}
              <div className="p-4" style={{ borderTop: '1px solid var(--border)' }}>
                <div className="flex items-center justify-between text-xs" style={{ color: 'var(--text-muted)' }}>
                  <span>{filteredQuestions.length} question{filteredQuestions.length !== 1 ? 's' : ''}</span>
                  <button
                    onClick={loadQuestions}
                    disabled={loading}
                    className="btn btn-ghost p-1"
                    title="Refresh"
                  >
                    <svg className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0114.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Main Content Area */}
          <div className="flex-1 flex flex-col min-w-0">
            {selectedQuestion ? (
              <div>
                {/* Question Header */}
                <div className="p-6" style={{ borderBottom: '1px solid var(--border)' }}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {editingQuestion === selectedQuestion.id ? (
                          <input
                            type="text"
                            value={selectedQuestion.title}
                            onChange={(e) => updateQuestion(selectedQuestion.id, { title: e.target.value })}
                            className="text-2xl font-bold bg-transparent border-none outline-none p-0 m-0"
                            style={{ color: 'var(--text-primary)' }}
                            placeholder="Question title..."
                          />
                        ) : (
                          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                            {selectedQuestion.title}
                          </h1>
                        )}
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          selectedQuestion.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                          selectedQuestion.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {selectedQuestion.difficulty}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          selectedQuestion.status === 'published' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {selectedQuestion.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm" style={{ color: 'var(--text-muted)' }}>
                        <span>Language: {selectedQuestion.language}</span>
                        <span>Time Limit: {selectedQuestion.timeLimit}min</span>
                        <div className="flex gap-1">
                          {selectedQuestion.tags.map(tag => (
                            <span key={tag} className="px-1.5 py-0.5 rounded text-xs" style={{ background: 'var(--border)', color: 'var(--text-secondary)' }}>
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => startSolveMode(selectedQuestion)}
                        className="btn btn-success"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd"/>
                        </svg>
                        Solve
                      </button>
                      
                      <button
                        onClick={() => startQuestionMode(selectedQuestion)}
                        className="btn btn-ghost"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"/>
                        </svg>
                        Preview
                      </button>
                      
                      {selectedQuestion.status === 'draft' && (
                        <button
                          onClick={() => testQuestion(selectedQuestion.id)}
                          disabled={loading}
                          className="btn btn-primary"
                        >
                          {loading ? (
                            <>
                              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" strokeOpacity="0.3" />
                                <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                              </svg>
                              Testing...
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                              </svg>
                              Test Question
                            </>
                          )}
                        </button>
                      )}
                      
                      {selectedQuestion.status === 'testing' && (
                        <button
                          disabled
                          className="btn btn-ghost"
                        >
                          <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" strokeOpacity="0.3" />
                            <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Testing...
                        </button>
                      )}
                      
                      {selectedQuestion.status === 'approved' && (
                        <button
                          onClick={() => approveQuestion(selectedQuestion.id)}
                          className="btn btn-success"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                          </svg>
                          Add to Question Pool
                        </button>
                      )}
                      
                      <button
                        onClick={() => {
                          if (editingQuestion === selectedQuestion.id) {
                            setEditingQuestion(null);
                          } else {
                            setEditingQuestion(selectedQuestion.id);
                          }
                        }}
                        className={`btn ${editingQuestion === selectedQuestion.id ? 'btn-primary' : 'btn-ghost'}`}
                      >
                        {editingQuestion === selectedQuestion.id ? 'Save' : 'Edit'}
                      </button>
                      <button className="btn btn-ghost">Duplicate</button>
                      <button 
                        onClick={() => deleteQuestion(selectedQuestion.id)}
                        className="btn btn-error"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Tabs */}
                <div className="tab-bar">
                  <div className="flex">
                    {(['overview', 'test-cases', 'hints', 'history'] as const).map(tab => (
                      <button
                        key={tab}
                        className={`tab ${activeTab === tab ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab)}
                      >
                        {tab.charAt(0).toUpperCase() + tab.slice(1).replace('-', ' ')}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Tab Content */}
                <div className="flex-1 overflow-auto p-6">
                  {activeTab === 'overview' && (
                    <div className="max-w-4xl">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div className="p-4 rounded-lg" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                          <h3 className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Description</h3>
                          {editingQuestion === selectedQuestion.id ? (
                            <textarea
                              value={selectedQuestion.description}
                              onChange={(e) => updateQuestion(selectedQuestion.id, { description: e.target.value })}
                              className="w-full p-2 text-sm rounded border focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                              style={{ 
                                background: 'var(--bg)', 
                                border: '1px solid var(--border)', 
                                color: 'var(--text-primary)',
                                minHeight: '200px'
                              }}
                              placeholder="Enter question description..."
                            />
                          ) : (
                            <div className="text-sm prose prose-sm max-w-none" style={{ color: 'var(--text-muted)' }}>
                              <div dangerouslySetInnerHTML={{ __html: selectedQuestion.description.replace(/\n/g, '<br/>') }} />
                            </div>
                          )}
                        </div>
                        
                        <div className="space-y-4">
                          <div className="p-4 rounded-lg" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                            <h3 className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Constraints</h3>
                            <div className="space-y-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                              <div>Time Limit: {selectedQuestion.timeLimit} minutes</div>
                              <div>Language: {selectedQuestion.language}</div>
                              <div>Test Cases: {selectedQuestion.testCases.length}</div>
                              <div>Hints: {selectedQuestion.hints.length}</div>
                            </div>
                          </div>
                          
                          {selectedQuestion.expectedOutput && (
                            <div className="p-4 rounded-lg" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                              <h3 className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Expected Output</h3>
                              <code className="text-sm block p-2 rounded" style={{ background: 'var(--bg)', color: 'var(--text-primary)' }}>
                                {selectedQuestion.expectedOutput}
                              </code>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {selectedQuestion.starterCode && (
                        <div className="mb-6">
                          <h3 className="font-medium mb-3" style={{ color: 'var(--text-primary)' }}>Starter Code</h3>
                          <div className="p-4 rounded-lg" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                            <pre className="text-sm font-mono" style={{ color: 'var(--text-primary)' }}>
                              {selectedQuestion.starterCode}
                            </pre>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {activeTab === 'test-cases' && (
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-medium" style={{ color: 'var(--text-primary)' }}>Test Cases</h3>
                        <button className="btn btn-primary text-sm">Add Test Case</button>
                      </div>
                      <div className="space-y-3">
                        {selectedQuestion.testCases.map((testCase, index) => (
                          <div key={index} className="p-4 rounded-lg" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>Test Case {index + 1}</span>
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-1 rounded text-xs ${testCase.hidden ? 'bg-gray-100 text-gray-600' : 'bg-green-100 text-green-800'}`}>
                                  {testCase.hidden ? 'Hidden' : 'Visible'}
                                </span>
                                <button className="btn btn-ghost p-1">
                                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
                                  </svg>
                                </button>
                              </div>
                            </div>
                            {testCase.description && (
                              <div className="mb-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                                {testCase.description}
                              </div>
                            )}
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <div className="font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Input:</div>
                                <code className="block p-2 rounded" style={{ background: 'var(--bg)', color: 'var(--text-primary)' }}>
                                  {testCase.input || 'No input'}
                                </code>
                              </div>
                              <div>
                                <div className="font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Expected Output:</div>
                                <code className="block p-2 rounded" style={{ background: 'var(--bg)', color: 'var(--text-primary)' }}>
                                  {testCase.expectedOutput}
                                </code>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {activeTab === 'hints' && (
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-medium" style={{ color: 'var(--text-primary)' }}>Hints</h3>
                        <button className="btn btn-primary text-sm">Add Hint</button>
                      </div>
                      <div className="space-y-3">
                        {selectedQuestion.hints.map((hint, index) => (
                          <div key={index} className="p-4 rounded-lg" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: 'var(--accent-primary)', color: 'white' }}>
                                {index + 1}
                              </span>
                              <span className="font-medium" style={{ color: 'var(--text-primary)' }}>Hint {index + 1}</span>
                              <button className="btn btn-ghost p-1 ml-auto">
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
                                </svg>
                              </button>
                            </div>
                            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{hint}</p>
                          </div>
                        ))}
                        {selectedQuestion.hints.length === 0 && (
                          <p className="text-sm italic text-center py-8" style={{ color: 'var(--text-muted)' }}>
                            No hints added yet. Click "Add Hint" to create helpful guidance for candidates.
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {activeTab === 'history' && (
                    <div>
                      <h3 className="font-medium mb-4" style={{ color: 'var(--text-primary)' }}>Question History</h3>
                      <div className="space-y-3">
                        <div className="p-4 rounded-lg" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>Created</div>
                              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                {selectedQuestion.createdAt?.toLocaleDateString() || 'Unknown'}
                              </div>
                            </div>
                            <span className="status-indicator status-success">Active</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center max-w-md">
                  <svg className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--text-muted)' }} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 01-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 111.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 111.414-1.414L15 13.586V12a1 1 0 011-1z" clipRule="evenodd"/>
                  </svg>
                  <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Select a Question</h3>
                  <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
                    Choose a question from the sidebar to edit, test, or manage interview settings.
                  </p>
                  
                  <div className="grid grid-cols-1 gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                    <div className="flex items-center justify-center gap-2">
                      <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                      </svg>
                      <span>Live Interview Mode</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                      <span>Progressive Hint System</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L10 9.586V6z" clipRule="evenodd"/>
                      </svg>
                      <span>Live Timer with Warnings</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      {solveMode ? renderSolveMode() : questionMode ? renderQuestionMode() : renderDashboard()}
      
      {/* New Question Form Modal */}
      {showNewQuestionForm && renderNewQuestionForm()}
      
      {/* Notification Toast */}
      {notification && (
        <div 
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg animate-fade-in ${
            notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'
          } text-white`}
        >
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
              </svg>
            )}
            <span className="font-medium">{notification.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}
