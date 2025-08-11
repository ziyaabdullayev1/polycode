// Interview Platform Integration Example
// This example shows how to integrate PolyCode with an interview/assessment platform

const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

// Configuration
const POLYCODE_SERVICE_URL = 'http://localhost:3100';
const INTERVIEW_PLATFORM_PORT = 3000;

// Sample interview questions database
const interviewQuestions = {
  'python-basics': {
    title: 'Python Hello World',
    description: `Write a Python program that prints "Hello, World!" to the console.

Requirements:
- Use the print() function
- The output should be exactly: Hello, World!`,
    language: 'python',
    difficulty: 'easy',
    starterCode: '# Write your code here\n',
    expectedOutput: 'Hello, World!',
    timeLimit: 5, // 5 minutes
    tags: ['python', 'basics', 'print'],
    hints: [
      'Use the print() function to output text',
      'Remember to include the comma and space in "Hello, World!"'
    ]
  },
  
  'javascript-fibonacci': {
    title: 'Fibonacci Sequence',
    description: `Write a JavaScript function that returns the nth number in the Fibonacci sequence.

The Fibonacci sequence is: 0, 1, 1, 2, 3, 5, 8, 13, 21, ...

Requirements:
- Function name: fibonacci(n)
- Return the nth Fibonacci number (0-indexed)
- Handle edge cases (n = 0 should return 0, n = 1 should return 1)`,
    language: 'javascript',
    difficulty: 'medium',
    starterCode: `function fibonacci(n) {
    // Write your implementation here
}

// Test your function
console.log(fibonacci(0)); // Should output: 0
console.log(fibonacci(1)); // Should output: 1
console.log(fibonacci(5)); // Should output: 5`,
    expectedOutput: `0
1
5`,
    testCases: [
      { input: '0', expectedOutput: '0', description: 'First Fibonacci number' },
      { input: '1', expectedOutput: '1', description: 'Second Fibonacci number' },
      { input: '5', expectedOutput: '5', description: 'Sixth Fibonacci number' }
    ],
    timeLimit: 15,
    tags: ['javascript', 'algorithms', 'recursion'],
    hints: [
      'You can solve this iteratively or recursively',
      'Base cases: fib(0) = 0, fib(1) = 1',
      'For n > 1: fib(n) = fib(n-1) + fib(n-2)'
    ]
  },

  'fullstack-api': {
    title: 'REST API Endpoint',
    description: `Create a simple REST API with the following requirements:

1. Create a GET endpoint /api/users that returns a JSON array of users
2. Each user should have: id, name, email
3. Return at least 3 sample users
4. Set proper Content-Type headers

Test your API by making a request to the endpoint.`,
    language: 'javascript',
    difficulty: 'hard',
    starterCode: `// Create your Express.js API here
// The server will be automatically set up for you

app.get('/api/users', (req, res) => {
    // Implement your endpoint here
});`,
    expectedOutput: `[
  {"id":1,"name":"John Doe","email":"john@example.com"},
  {"id":2,"name":"Jane Smith","email":"jane@example.com"},
  {"id":3,"name":"Bob Johnson","email":"bob@example.com"}
]`,
    timeLimit: 20,
    tags: ['javascript', 'nodejs', 'api', 'express'],
    hints: [
      'Use res.json() to send JSON responses',
      'Make sure to return an array of objects',
      'Each user object should have id, name, and email properties'
    ]
  }
};

// Interview Platform Routes

// 1. Main interview dashboard
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Interview Platform</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; }
          .card { border: 1px solid #ddd; padding: 20px; margin: 10px 0; border-radius: 8px; }
          .difficulty { padding: 4px 8px; border-radius: 4px; color: white; font-size: 12px; }
          .easy { background-color: #10b981; }
          .medium { background-color: #f59e0b; }
          .hard { background-color: #ef4444; }
          button { background: #3b82f6; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; }
          button:hover { background: #2563eb; }
        </style>
      </head>
      <body>
        <h1>🎯 Interview Platform</h1>
        <p>Select a coding question for the candidate:</p>
        
        ${Object.entries(interviewQuestions).map(([key, question]) => `
          <div class="card">
            <h3>${question.title} <span class="difficulty ${question.difficulty}">${question.difficulty}</span></h3>
            <p><strong>Language:</strong> ${question.language}</p>
            <p><strong>Time Limit:</strong> ${question.timeLimit} minutes</p>
            <p><strong>Description:</strong> ${question.description.substring(0, 100)}...</p>
            <button onclick="startInterview('${key}')">Start Interview</button>
          </div>
        `).join('')}
        
        <script>
          async function startInterview(questionKey) {
            try {
              const response = await fetch('/api/interview/start', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ questionKey })
              });
              
              const data = await response.json();
              if (data.success) {
                // Open PolyCode with the question
                window.open(data.polycodeUrl, '_blank');
                alert('Interview started! The coding environment has opened in a new tab.');
              } else {
                alert('Error: ' + data.error);
              }
            } catch (error) {
              alert('Failed to start interview: ' + error.message);
            }
          }
        </script>
      </body>
    </html>
  `);
});

// 2. Start an interview session
app.post('/api/interview/start', async (req, res) => {
  try {
    const { questionKey } = req.body;
    const questionData = interviewQuestions[questionKey];
    
    if (!questionData) {
      return res.status(404).json({ success: false, error: 'Question not found' });
    }

    // Send question to PolyCode service
    const polycodeResponse = await axios.post(`${POLYCODE_SERVICE_URL}/api/question`, {
      ...questionData,
      expiresAt: new Date(Date.now() + (questionData.timeLimit + 5) * 60 * 1000) // Expire 5 minutes after time limit
    });

    if (polycodeResponse.data.success) {
      res.json({
        success: true,
        questionId: polycodeResponse.data.questionId,
        polycodeUrl: polycodeResponse.data.url,
        message: 'Interview session created successfully'
      });
    } else {
      res.status(500).json({ 
        success: false, 
        error: 'Failed to create question in PolyCode service' 
      });
    }

  } catch (error) {
    console.error('Error starting interview:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});

// 3. Get interview results (for monitoring)
app.get('/api/interview/:questionId/status', async (req, res) => {
  try {
    const { questionId } = req.params;
    
    // Check question status in PolyCode
    const response = await axios.get(`${POLYCODE_SERVICE_URL}/api/question?id=${questionId}`);
    
    res.json({
      success: true,
      status: response.data.success ? 'active' : 'expired',
      question: response.data.question
    });

  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get interview status' 
    });
  }
});

// 4. Custom question creation API
app.post('/api/interview/custom-question', async (req, res) => {
  try {
    const questionData = req.body;
    
    // Validate required fields
    if (!questionData.title || !questionData.description) {
      return res.status(400).json({ 
        success: false, 
        error: 'Title and description are required' 
      });
    }

    // Send to PolyCode service
    const polycodeResponse = await axios.post(`${POLYCODE_SERVICE_URL}/api/question`, questionData);

    res.json({
      success: true,
      questionId: polycodeResponse.data.questionId,
      polycodeUrl: polycodeResponse.data.url,
      message: 'Custom question created successfully'
    });

  } catch (error) {
    console.error('Error creating custom question:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to create custom question' 
    });
  }
});

// Start the interview platform
app.listen(INTERVIEW_PLATFORM_PORT, () => {
  console.log(`🎯 Interview Platform running on http://localhost:${INTERVIEW_PLATFORM_PORT}`);
  console.log(`📝 PolyCode Service should be running on ${POLYCODE_SERVICE_URL}`);
  console.log('');
  console.log('Available endpoints:');
  console.log(`  GET  / - Interview dashboard`);
  console.log(`  POST /api/interview/start - Start interview session`);
  console.log(`  GET  /api/interview/:id/status - Get interview status`);
  console.log(`  POST /api/interview/custom-question - Create custom question`);
});

module.exports = app; 