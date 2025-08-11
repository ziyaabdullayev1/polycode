'use client';

import React, { useState, useEffect } from 'react';
import PolyCode from '../../components/PolyCode';
import { QuestionData } from '../../types';

const TestQuestionsPage = () => {
  const [questions, setQuestions] = useState<QuestionData[]>([]);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  // Custom question form state
  const [customQuestion, setCustomQuestion] = useState({
    title: '',
    description: '',
    language: 'javascript',
    difficulty: 'easy',
    starterCode: '',
    timeLimit: 600, // 10 minutes default
    testCases: [{ input: '', expectedOutput: '', description: '' }],
    hints: [''],
    tags: ['']
  });

  // Sample test questions
  const sampleQuestions: Omit<QuestionData, 'id' | 'createdAt'>[] = [
    {
      title: "Hello World",
      description: "Write a simple program that prints 'Hello, World!' to the console.",
      language: "javascript",
      difficulty: "easy",
      starterCode: `// Write your Hello World program here
console.log();`,
      timeLimit: 300, // 5 minutes
      testCases: [
        {
          input: "",
          expectedOutput: "Hello, World!",
          description: "The program should output exactly 'Hello, World!'"
        }
      ],
      hints: [
        "Use console.log() to print to the console",
        "Make sure to include the exact text 'Hello, World!'"
      ],
      tags: ["beginner", "basics"]
    },
    {
      title: "Sum Calculator",
      description: "Create a function that takes two numbers and returns their sum.",
      language: "python",
      difficulty: "easy",
      starterCode: `def add_numbers(a, b):
    # Your code here
    pass

# Test your function
result = add_numbers(5, 3)
print(result)`,
      timeLimit: 600, // 10 minutes
      testCases: [
        {
          input: "a = 5, b = 3",
          expectedOutput: "8",
          description: "5 + 3 should equal 8"
        },
        {
          input: "a = -2, b = 7",
          expectedOutput: "5",
          description: "-2 + 7 should equal 5"
        }
      ],
      hints: [
        "Use the + operator to add two numbers",
        "Don't forget to return the result"
      ],
      tags: ["functions", "arithmetic", "basics"]
    },
    {
      title: "Array Reverse",
      description: "Implement a function that reverses an array without using built-in reverse methods.",
      language: "javascript",
      difficulty: "medium",
      starterCode: `function reverseArray(arr) {
    // Your code here - don't use arr.reverse()
    
}

// Test cases
console.log(reverseArray([1, 2, 3, 4, 5])); // Should output [5, 4, 3, 2, 1]
console.log(reverseArray(['a', 'b', 'c'])); // Should output ['c', 'b', 'a']`,
      timeLimit: 900, // 15 minutes
      testCases: [
        {
          input: "[1, 2, 3, 4, 5]",
          expectedOutput: "[5, 4, 3, 2, 1]",
          description: "Array should be reversed"
        },
        {
          input: "['a', 'b', 'c']",
          expectedOutput: "['c', 'b', 'a']",
          description: "String array should be reversed"
        }
      ],
      hints: [
        "Try using a loop to swap elements from start and end",
        "You can also create a new array and fill it backwards"
      ],
      tags: ["arrays", "algorithms", "loops"]
    }
  ];

  // Load questions from API
  const loadQuestions = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/question');
      if (response.ok) {
        const data = await response.json();
        setQuestions(data.questions);
      } else {
        throw new Error('Failed to load questions');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Create sample questions
  const createSampleQuestions = async () => {
    setLoading(true);
    setError(null);
    
    try {
      for (const question of sampleQuestions) {
        const response = await fetch('/api/question', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(question),
        });
        
        if (!response.ok) {
          throw new Error(`Failed to create question: ${question.title}`);
        }
      }
      
      // Reload questions after creating
      await loadQuestions();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Clear all questions
  const clearQuestions = async () => {
    setLoading(true);
    setError(null);
    
    try {
      for (const question of questions) {
        const response = await fetch(`/api/question?id=${question.id}`, {
          method: 'DELETE',
        });
        
        if (!response.ok) {
          throw new Error(`Failed to delete question: ${question.title}`);
        }
      }
      
      setQuestions([]);
      setSelectedQuestionId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Available languages and difficulties
  const availableLanguages = [
    { value: 'javascript', label: 'JavaScript' },
    { value: 'python', label: 'Python' },
    { value: 'go', label: 'Go' },
    { value: 'java', label: 'Java' },
    { value: 'cpp', label: 'C++' },
    { value: 'typescript', label: 'TypeScript' },
    { value: 'php', label: 'PHP' },
    { value: 'html', label: 'HTML' },
    { value: 'css', label: 'CSS' }
  ];

  const availableDifficulties = [
    { value: 'easy', label: 'Easy', color: 'green' },
    { value: 'medium', label: 'Medium', color: 'yellow' },
    { value: 'hard', label: 'Hard', color: 'red' }
  ];

  // Create custom question
  const createCustomQuestion = async () => {
    if (!customQuestion.title.trim() || !customQuestion.description.trim()) {
      setError('Please fill in the title and description fields');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const questionData = {
        ...customQuestion,
        testCases: customQuestion.testCases.filter(tc => tc.input.trim() || tc.expectedOutput.trim()),
        hints: customQuestion.hints.filter(hint => hint.trim()),
        tags: customQuestion.tags.filter(tag => tag.trim())
      };

      const response = await fetch('/api/question', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(questionData),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to create question: ${customQuestion.title}`);
      }
      
      // Reset form and reload questions
      setCustomQuestion({
        title: '',
        description: '',
        language: 'javascript',
        difficulty: 'easy',
        starterCode: '',
        timeLimit: 600,
        testCases: [{ input: '', expectedOutput: '', description: '' }],
        hints: [''],
        tags: ['']
      });
      setShowCreateForm(false);
      await loadQuestions();
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Helper functions for dynamic form fields
  const addTestCase = () => {
    setCustomQuestion(prev => ({
      ...prev,
      testCases: [...prev.testCases, { input: '', expectedOutput: '', description: '' }]
    }));
  };

  const removeTestCase = (index: number) => {
    setCustomQuestion(prev => ({
      ...prev,
      testCases: prev.testCases.filter((_, i) => i !== index)
    }));
  };

  const updateTestCase = (index: number, field: string, value: string) => {
    setCustomQuestion(prev => ({
      ...prev,
      testCases: prev.testCases.map((tc, i) => 
        i === index ? { ...tc, [field]: value } : tc
      )
    }));
  };

  const addHint = () => {
    setCustomQuestion(prev => ({
      ...prev,
      hints: [...prev.hints, '']
    }));
  };

  const removeHint = (index: number) => {
    setCustomQuestion(prev => ({
      ...prev,
      hints: prev.hints.filter((_, i) => i !== index)
    }));
  };

  const updateHint = (index: number, value: string) => {
    setCustomQuestion(prev => ({
      ...prev,
      hints: prev.hints.map((hint, i) => i === index ? value : hint)
    }));
  };

  const addTag = () => {
    setCustomQuestion(prev => ({
      ...prev,
      tags: [...prev.tags, '']
    }));
  };

  const removeTag = (index: number) => {
    setCustomQuestion(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index)
    }));
  };

  const updateTag = (index: number, value: string) => {
    setCustomQuestion(prev => ({
      ...prev,
      tags: prev.tags.map((tag, i) => i === index ? value : tag)
    }));
  };

  // Load questions on component mount
  useEffect(() => {
    loadQuestions();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-6 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <h1 className="text-3xl font-bold text-white">
                  <span className="text-blue-400">Poly</span>Code
                </h1>
                <span className="text-sm text-gray-400 bg-gray-700/50 px-3 py-1.5 rounded-full">
                  Question System Testing
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>Test Environment Active</span>
              </div>
            </div>
          </div>
          
          <p className="text-gray-300 mt-3 text-lg">
            Test the dynamic question integration with PolyCode interview platform
          </p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {showCreateForm ? (
          /* Full Screen Custom Question Creation */
          <div className="w-full">
            <div className="bg-gray-800 rounded-xl shadow-xl border border-gray-700 overflow-hidden">
              {/* Full Screen Form Header */}
              <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 p-6 border-b border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-white flex items-center space-x-3">
                    <svg className="w-7 h-7 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 01-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 111.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 111.414-1.414L15 13.586V12a1 1 0 011-1z" clipRule="evenodd"/>
                    </svg>
                    <span>Create Custom Question</span>
                  </h2>
                  <button
                    onClick={() => setShowCreateForm(false)}
                    className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-700"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
                    </svg>
                  </button>
                </div>
                <p className="text-gray-300 text-lg mt-2">Design and configure your custom coding question with all the details</p>
      </div>

              <div className="p-8">
                <div className="max-w-4xl mx-auto">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Column */}
                    <div className="space-y-6">
                      {/* Title */}
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-3">
                          Question Title *
                        </label>
                        <input
                          type="text"
                          value={customQuestion.title}
                          onChange={(e) => setCustomQuestion(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="Enter a clear, descriptive question title..."
                          className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors text-lg"
                        />
                      </div>

                      {/* Language and Difficulty Row */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-3">
                            Programming Language
                          </label>
                          <select
                            value={customQuestion.language}
                            onChange={(e) => setCustomQuestion(prev => ({ ...prev, language: e.target.value }))}
                            className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors text-lg [&>option]:bg-gray-800 [&>option]:text-white [&>option]:py-2"
                          >
                            {availableLanguages.map(lang => (
                              <option key={lang.value} value={lang.value} className="bg-gray-800 text-white py-2 px-4">
                                {lang.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-3">
                            Difficulty Level
                          </label>
                          <select
                            value={customQuestion.difficulty}
                            onChange={(e) => setCustomQuestion(prev => ({ ...prev, difficulty: e.target.value }))}
                            className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors text-lg [&>option]:bg-gray-800 [&>option]:text-white [&>option]:py-2"
                          >
                            {availableDifficulties.map(diff => (
                              <option key={diff.value} value={diff.value} className="bg-gray-800 text-white py-2 px-4">
                                {diff.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Time Limit */}
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-3">
                          Time Limit (minutes)
                        </label>
                        <input
                          type="number"
                          value={Math.floor(customQuestion.timeLimit / 60)}
                          onChange={(e) => setCustomQuestion(prev => ({ ...prev, timeLimit: parseInt(e.target.value) * 60 || 600 }))}
                          min="1"
                          max="180"
                          className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors text-lg"
                        />
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                      {/* Description */}
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-3">
                          Question Description *
                        </label>
                        <textarea
                          value={customQuestion.description}
                          onChange={(e) => setCustomQuestion(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Describe the problem in detail. What should the candidate implement? What are the requirements and constraints?"
                          rows={8}
                          className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors resize-none"
                        />
                      </div>

                      {/* Starter Code */}
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-3">
                          Starter Code (Optional)
                        </label>
                        <textarea
                          value={customQuestion.starterCode}
                          onChange={(e) => setCustomQuestion(prev => ({ ...prev, starterCode: e.target.value }))}
                          placeholder="Initial code template or boilerplate that candidates will start with..."
                          rows={8}
                          className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors resize-none font-mono text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Error Display */}
                  {error && (
                    <div className="bg-red-900/30 border border-red-700 rounded-lg p-4 mt-6">
                      <div className="flex items-center space-x-2">
                        <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                        </svg>
                        <p className="text-red-300 text-sm font-medium">{error}</p>
                      </div>
                    </div>
                  )}

                  {/* Advanced Sections */}
                  <div className="mt-8 space-y-8">
                    {/* Test Cases */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-white">Test Cases</h3>
                        <button
                          onClick={addTestCase}
                          className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/>
                          </svg>
                          <span>Add Test Case</span>
                        </button>
                      </div>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {customQuestion.testCases.map((testCase, index) => (
                          <div key={index} className="bg-gray-700/50 rounded-lg p-6 border border-gray-600">
                            <div className="flex items-center justify-between mb-4">
                              <span className="text-sm font-medium text-gray-300">Test Case {index + 1}</span>
                              {customQuestion.testCases.length > 1 && (
                                <button
                                  onClick={() => removeTestCase(index)}
                                  className="text-red-400 hover:text-red-300 transition-colors"
                                >
                                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clipRule="evenodd"/>
                                    <path fillRule="evenodd" d="M10 5a2 2 0 00-2 2v6a2 2 0 002 2h4a2 2 0 002-2V7a2 2 0 00-2-2H10z" clipRule="evenodd"/>
                                  </svg>
                                </button>
                              )}
                            </div>
                            <div className="space-y-3">
                              <input
                                type="text"
                                value={testCase.input}
                                onChange={(e) => updateTestCase(index, 'input', e.target.value)}
                                placeholder="Input"
                                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                              />
                              <input
                                type="text"
                                value={testCase.expectedOutput}
                                onChange={(e) => updateTestCase(index, 'expectedOutput', e.target.value)}
                                placeholder="Expected Output"
                                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                              />
                              <input
                                type="text"
                                value={testCase.description}
                                onChange={(e) => updateTestCase(index, 'description', e.target.value)}
                                placeholder="Test case description (optional)"
                                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Hints and Tags Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Hints */}
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-white">Hints (Optional)</h3>
                          <button
                            onClick={addHint}
                            className="bg-yellow-600 hover:bg-yellow-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/>
                            </svg>
                            <span>Add Hint</span>
                          </button>
                        </div>
                        <div className="space-y-3">
                          {customQuestion.hints.map((hint, index) => (
                            <div key={index} className="flex items-center space-x-2">
                              <input
                                type="text"
                                value={hint}
                                onChange={(e) => updateHint(index, e.target.value)}
                                placeholder={`Hint ${index + 1}`}
                                className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white placeholder-gray-400 focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-colors"
                              />
                              {customQuestion.hints.length > 1 && (
                                <button
                                  onClick={() => removeHint(index)}
                                  className="text-red-400 hover:text-red-300 transition-colors"
                                >
                                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clipRule="evenodd"/>
                                    <path fillRule="evenodd" d="M10 5a2 2 0 00-2 2v6a2 2 0 002 2h4a2 2 0 002-2V7a2 2 0 00-2-2H10z" clipRule="evenodd"/>
                                  </svg>
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Tags */}
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-white">Tags (Optional)</h3>
                          <button
                            onClick={addTag}
                            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/>
                            </svg>
                            <span>Add Tag</span>
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-3">
                          {customQuestion.tags.map((tag, index) => (
                            <div key={index} className="flex items-center space-x-2">
                              <input
                                type="text"
                                value={tag}
                                onChange={(e) => updateTag(index, e.target.value)}
                                placeholder={`Tag ${index + 1}`}
                                className="px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors w-32"
                              />
                              {customQuestion.tags.length > 1 && (
                                <button
                                  onClick={() => removeTag(index)}
                                  className="text-red-400 hover:text-red-300 transition-colors"
                                >
                                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clipRule="evenodd"/>
                                    <path fillRule="evenodd" d="M10 5a2 2 0 00-2 2v6a2 2 0 002 2h4a2 2 0 002-2V7a2 2 0 00-2-2H10z" clipRule="evenodd"/>
                                  </svg>
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="flex items-center justify-center space-x-4 pt-8 mt-8 border-t border-gray-600">
                    <button
                      onClick={() => setShowCreateForm(false)}
                      className="px-6 py-3 text-gray-400 hover:text-white transition-colors font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={createCustomQuestion}
                      disabled={loading || !customQuestion.title.trim() || !customQuestion.description.trim()}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:from-gray-600 disabled:to-gray-600 disabled:opacity-50 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center space-x-2 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" strokeOpacity="0.3" />
                            <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          <span>Creating Question...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                          </svg>
                          <span>Create Question</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Normal Grid Layout */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Control Panel */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-xl shadow-xl border border-gray-700 overflow-hidden">
              {/* Control Panel Header */}
              <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 p-6 border-b border-gray-700">
                <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                  <svg className="w-6 h-6 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd"/>
                  </svg>
                  <span>Test Controls</span>
                </h2>
                <p className="text-gray-300 text-sm mt-1">Manage question database and testing</p>
              </div>
              
              <div className="p-6">
              {/* Action Buttons */}
                <div className="space-y-4 mb-6">
                <button
                  onClick={loadQuestions}
                  disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 disabled:opacity-50 text-white px-4 py-3.5 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" strokeOpacity="0.3" />
                          <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span>Loading...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd"/>
                        </svg>
                        <span>Reload Questions</span>
                      </>
                    )}
                </button>
                
                <button
                  onClick={createSampleQuestions}
                  disabled={loading}
                    className="w-full bg-green-600 hover:bg-green-500 disabled:bg-gray-600 disabled:opacity-50 text-white px-4 py-3.5 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/>
                    </svg>
                    <span>Create Sample Questions</span>
                  </button>
                  
                  <button
                    onClick={() => setShowCreateForm(!showCreateForm)}
                    className="w-full bg-purple-600 hover:bg-purple-500 text-white px-4 py-3.5 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 01-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 111.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 111.414-1.414L15 13.586V12a1 1 0 011-1z" clipRule="evenodd"/>
                    </svg>
                    <span>{showCreateForm ? 'Hide Custom Form' : 'Create Custom Question'}</span>
                </button>
                
                <button
                  onClick={clearQuestions}
                  disabled={loading || questions.length === 0}
                    className="w-full bg-red-600 hover:bg-red-500 disabled:bg-gray-600 disabled:opacity-50 text-white px-4 py-3.5 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clipRule="evenodd"/>
                      <path fillRule="evenodd" d="M10 5a2 2 0 00-2 2v6a2 2 0 002 2h4a2 2 0 002-2V7a2 2 0 00-2-2H10z" clipRule="evenodd"/>
                    </svg>
                    <span>Clear All Questions</span>
                </button>
              </div>

              {/* Error Display */}
              {error && (
                  <div className="bg-red-900/30 border border-red-700 rounded-lg p-4 mb-6">
                    <div className="flex items-center space-x-2">
                      <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                      </svg>
                      <p className="text-red-300 text-sm font-medium">{error}</p>
                    </div>
                </div>
              )}



              {/* Questions List */}
              <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-white text-lg">Available Questions</h3>
                    <span className="bg-blue-600 text-white text-sm px-3 py-1 rounded-full font-medium">
                      {questions.length}
                    </span>
                  </div>
                  
                  <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
                  {questions.map((question) => (
                    <div
                      key={question.id}
                        className={`group p-4 border rounded-xl cursor-pointer transition-all duration-200 ${
                        selectedQuestionId === question.id
                            ? 'border-blue-500 bg-blue-900/20 shadow-lg shadow-blue-900/50'
                            : 'border-gray-600 bg-gray-700/50 hover:border-gray-500 hover:bg-gray-700/80 hover:shadow-lg'
                      }`}
                      onClick={() => {
                        setSelectedQuestionId(question.id);
                        // Navigate to PolyCode with question parameter
                        window.location.href = `/?question=${question.id}`;
                      }}
                    >
                        <div className="font-semibold text-white group-hover:text-blue-400 transition-colors">
                          {question.title}
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-2 mt-3">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                            question.difficulty === 'easy' ? 'bg-green-900/50 text-green-300 border border-green-700' :
                            question.difficulty === 'medium' ? 'bg-yellow-900/50 text-yellow-300 border border-yellow-700' :
                            'bg-red-900/50 text-red-300 border border-red-700'
                        }`}>
                          {question.difficulty}
                        </span>
                          
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-900/50 text-purple-300 border border-purple-700">
                            {question.language}
                          </span>
                          
                          {question.timeLimit && (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-700 text-gray-300 border border-gray-600">
                              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
                              </svg>
                              {Math.floor(question.timeLimit / 60)}min
                            </span>
                          )}
                        </div>
                        
                        {question.tags && question.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {question.tags.slice(0, 3).map((tag, index) => (
                              <span key={index} className="inline-block px-2 py-0.5 bg-blue-900/30 text-blue-300 rounded text-xs border border-blue-800">
                                {tag}
                              </span>
                            ))}
                            {question.tags.length > 3 && (
                              <span className="inline-block px-2 py-0.5 bg-gray-700 text-gray-300 rounded text-xs">
                                +{question.tags.length - 3} more
                              </span>
                            )}
                          </div>
                        )}
                    </div>
                  ))}
                  
                  {questions.length === 0 && !loading && (
                      <div className="text-center py-8">
                        <svg className="w-12 h-12 text-gray-600 mx-auto mb-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 01-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 111.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 111.414-1.414L15 13.586V12a1 1 0 011-1z" clipRule="evenodd"/>
                        </svg>
                        <p className="text-gray-400 text-sm font-medium">No questions available</p>
                        <p className="text-gray-500 text-xs mt-1">Create sample questions to get started</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

                      {/* PolyCode Interface Preview */}
            {!showCreateForm && (
          <div className="lg:col-span-2">
                <div className="bg-gray-800 rounded-xl shadow-xl border border-gray-700 overflow-hidden h-full">
                  {/* Preview Header */}
                  <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 p-6 border-b border-gray-700">
                    <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                      <svg className="w-6 h-6 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
                      </svg>
                      <span>PolyCode Interface</span>
                    </h2>
                    <p className="text-gray-300 text-sm mt-1">Question testing and validation environment</p>
                  </div>
                  
                  {selectedQuestionId ? (
                    <div className="p-8 flex flex-col items-center justify-center text-center min-h-96">
                      <div className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 rounded-2xl p-8 border border-gray-600 max-w-md">
                        <div className="mb-6">
                          <svg className="w-16 h-16 text-blue-400 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"/>
                          </svg>
                          <h3 className="text-xl font-bold text-white mb-2">Question Selected</h3>
                          <p className="text-gray-300 text-sm">Ready to launch in full PolyCode environment</p>
                        </div>
                        
                    <button
                      onClick={() => window.location.href = `/?question=${selectedQuestionId}`}
                          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-200 flex items-center space-x-3 shadow-lg hover:shadow-xl transform hover:scale-105 mx-auto"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
                          </svg>
                          <span>Open in PolyCode</span>
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"/>
                          </svg>
                    </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-8 flex flex-col items-center justify-center text-center min-h-96">
                      <div className="mb-6">
                        <svg className="w-20 h-20 text-gray-600 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 01-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 111.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 111.414-1.414L15 13.586V12a1 1 0 011-1z" clipRule="evenodd"/>
                        </svg>
                        <h3 className="text-xl font-semibold text-gray-300 mb-2">Select a Question</h3>
                        <p className="text-gray-400 text-sm max-w-md">
                          Choose a question from the left panel to test it in the full PolyCode interview environment. 
                          Questions will load with timer, test cases, and all interactive features enabled.
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-gray-500 mt-8">
                        <div className="flex items-center space-x-2">
                          <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                          </svg>
                          <span>Live Timer</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                          </svg>
                          <span>Test Cases</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
                          </svg>
                          <span>Smart Hints</span>
                        </div>
                      </div>
                  </div>
                )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 border-t border-gray-700 px-6 py-4 mt-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-sm text-gray-400">
          <div className="flex items-center space-x-4">
            <span className="font-medium">PolyCode Testing Environment</span>
            <span>•</span>
            <span>Dynamic Question System v2.0</span>
          </div>
          <div className="flex items-center space-x-4">
            <span>Questions: {questions.length}</span>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>Test Mode Active</span>
            </div>
          </div>
        </div>
      </footer>
      
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(75, 85, 99, 0.3);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(156, 163, 175, 0.5);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(156, 163, 175, 0.7);
        }
        
        /* Fix dropdown option readability */
        select option {
          background-color: #1f2937 !important;
          color: #ffffff !important;
          padding: 8px 12px !important;
        }
        
        select option:checked {
          background-color: #8b5cf6 !important;
          color: #ffffff !important;
        }
        
        select option:hover {
          background-color: #374151 !important;
          color: #ffffff !important;
        }
      `}</style>
    </div>
  );
};

export default TestQuestionsPage; 