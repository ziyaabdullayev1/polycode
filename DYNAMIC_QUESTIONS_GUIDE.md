# Dynamic Questions Guide 🎯

This guide explains how to send custom questions, prompts, and coding challenges to your PolyCode service from external applications.

## 🚀 Quick Start

### **Step 1: Create a Question**

Send a POST request to `/api/question` with your question data:

```javascript
const response = await fetch('http://localhost:3100/api/question', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'Python Hello World',
    description: 'Write a Python program that prints "Hello, World!" to the console.',
    language: 'python',
    difficulty: 'easy',
    starterCode: '# Write your code here\n',
    timeLimit: 5
  })
});

const data = await response.json();
console.log('Question URL:', data.url); // Use this URL to access the question
```

### **Step 2: Access the Question**

Open the returned URL in a browser or iframe:
```
http://localhost:3100?question=q_1234567890_abc123def
```

The PolyCode interface will automatically:
- Display the question prominently
- Set up the editor with the correct language
- Load starter code if provided
- Start the timer if there's a time limit
- Show hints, test cases, and expected output

---

## 📋 Question Data Format

### **Required Fields:**
- `title` - Question title
- `description` - Detailed problem description

### **Optional Fields:**
- `language` - Programming language (default: 'javascript')
- `difficulty` - 'easy', 'medium', or 'hard' (default: 'medium')
- `starterCode` - Pre-filled code in the editor
- `expectedOutput` - What the program should output
- `timeLimit` - Time limit in minutes
- `testCases` - Array of input/output test cases
- `hints` - Array of helpful hints
- `tags` - Array of tags for categorization
- `expiresAt` - When the question expires (ISO date string)

### **Complete Example:**

```javascript
const questionData = {
  title: 'Fibonacci Sequence',
  description: `Write a function that returns the nth Fibonacci number.
  
The Fibonacci sequence is: 0, 1, 1, 2, 3, 5, 8, 13, 21, ...

Requirements:
- Function name: fibonacci(n)
- Return the nth Fibonacci number (0-indexed)
- Handle edge cases properly`,
  
  language: 'javascript',
  difficulty: 'medium',
  starterCode: `function fibonacci(n) {
    // Write your implementation here
}

// Test your function
console.log(fibonacci(5)); // Should output: 5`,
  
  expectedOutput: '5',
  timeLimit: 15,
  
  testCases: [
    { input: '0', expectedOutput: '0', description: 'First Fibonacci number' },
    { input: '1', expectedOutput: '1', description: 'Second Fibonacci number' },
    { input: '5', expectedOutput: '5', description: 'Sixth Fibonacci number' }
  ],
  
  hints: [
    'You can solve this iteratively or recursively',
    'Base cases: fib(0) = 0, fib(1) = 1',
    'For n > 1: fib(n) = fib(n-1) + fib(n-2)'
  ],
  
  tags: ['javascript', 'algorithms', 'recursion'],
  expiresAt: '2024-12-31T23:59:59Z'
};
```

---

## 🎯 Integration Examples

### **1. Interview Platform Integration**

Create questions on-demand for coding interviews:

```javascript
// Interview platform sends question to PolyCode
app.post('/start-interview', async (req, res) => {
  const { candidateId, questionType } = req.body;
  
  const questionData = {
    title: 'Array Manipulation Challenge',
    description: 'Write a function that finds the two numbers in an array that add up to a target sum.',
    language: 'python',
    difficulty: 'medium',
    starterCode: 'def two_sum(nums, target):\n    # Your code here\n    pass',
    timeLimit: 20
  };
  
  const response = await fetch('http://localhost:3100/api/question', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(questionData)
  });
  
  const result = await response.json();
  
  // Send candidate to PolyCode with the question
  res.json({
    success: true,
    codingUrl: result.url,
    message: 'Please complete the coding challenge in the new tab'
  });
});
```

### **2. Learning Management System (LMS)**

Create progressive coding exercises:

```javascript
// LMS creates course exercises
const exercises = [
  {
    title: 'Lesson 1: Variables and Data Types',
    description: 'Create variables of different types and print their values.',
    language: 'python',
    difficulty: 'easy',
    starterCode: '# Lesson 1: Variables\nname = ""\nage = 0\n# Add your code below',
    timeLimit: 10
  },
  {
    title: 'Lesson 2: Control Structures',
    description: 'Write a program using if-else statements.',
    language: 'python',
    difficulty: 'easy',
    starterCode: '# Lesson 2: If-Else\n# Write your code here',
    timeLimit: 15
  }
];

// Create all exercises and get URLs
const exerciseUrls = await Promise.all(
  exercises.map(async (exercise) => {
    const response = await fetch('http://localhost:3100/api/question', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(exercise)
    });
    return response.json();
  })
);
```

### **3. Assessment Platform**

Create timed coding assessments:

```javascript
// Assessment with multiple questions
const assessmentQuestions = [
  {
    title: 'Question 1: String Manipulation',
    description: 'Reverse a string without using built-in reverse functions.',
    language: 'javascript',
    difficulty: 'easy',
    timeLimit: 10
  },
  {
    title: 'Question 2: Algorithm Implementation',
    description: 'Implement a binary search algorithm.',
    language: 'javascript',
    difficulty: 'hard',
    timeLimit: 25
  }
];

// Create assessment session
app.post('/create-assessment', async (req, res) => {
  const questionUrls = [];
  
  for (const question of assessmentQuestions) {
    const response = await fetch('http://localhost:3100/api/question', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(question)
    });
    
    const result = await response.json();
    questionUrls.push(result.url);
  }
  
  res.json({
    success: true,
    assessmentUrls: questionUrls,
    totalQuestions: questionUrls.length
  });
});
```

---

## 🔧 API Reference

### **POST /api/question**
Create a new question

**Request Body:**
```javascript
{
  "title": "string (required)",
  "description": "string (required)",
  "language": "string (optional, default: 'javascript')",
  "difficulty": "easy|medium|hard (optional, default: 'medium')",
  "starterCode": "string (optional)",
  "expectedOutput": "string (optional)",
  "testCases": "array (optional)",
  "hints": "array (optional)",
  "timeLimit": "number (optional, minutes)",
  "tags": "array (optional)",
  "expiresAt": "string (optional, ISO date)"
}
```

**Response:**
```javascript
{
  "success": true,
  "questionId": "q_1234567890_abc123def",
  "question": { /* question data */ },
  "url": "http://localhost:3100?question=q_1234567890_abc123def",
  "message": "Question created successfully"
}
```

### **GET /api/question?id=questionId**
Retrieve a question by ID

### **GET /api/question**
List all questions (for debugging)

### **DELETE /api/question?id=questionId**
Delete a question

---

## 🎨 UI Features

When a question is loaded, PolyCode displays:

### **Question Header:**
- **Title** with difficulty badge
- **Language** and **tags**
- **Timer** (if time limit is set)
- **Hints** (expandable section)

### **Question Content:**
- **Description** with full formatting
- **Expected Output** (if provided)
- **Test Cases** with input/output examples
- **Starter Code** pre-loaded in editor

### **Interactive Elements:**
- **Live timer** with color-coded warnings
- **Hint system** with progressive disclosure
- **Exit question mode** button
- **All standard PolyCode features** (run code, full-stack deploy, etc.)

---

## 🔄 Workflow Examples

### **Typical Interview Workflow:**

1. **Interviewer** selects question from platform
2. **Platform** sends question to PolyCode API
3. **PolyCode** returns unique URL
4. **Candidate** opens URL and sees question
5. **Candidate** codes solution with timer running
6. **Interviewer** can monitor progress via question status API

### **LMS Course Workflow:**

1. **Instructor** creates course with coding exercises
2. **LMS** generates questions for each lesson
3. **Students** access exercises through course portal
4. **PolyCode** provides coding environment with guided prompts
5. **Students** complete exercises at their own pace

### **Assessment Workflow:**

1. **Assessment platform** creates timed coding test
2. **Multiple questions** generated with different difficulties
3. **Candidates** work through questions sequentially
4. **Timer enforcement** prevents overtime work
5. **Results** can be reviewed by evaluators

---

## 🛡️ Security & Best Practices

### **Question Expiration:**
```javascript
// Set expiration for sensitive questions
expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000) // 2 hours from now
```

### **Content Validation:**
- Always validate question data before sending
- Sanitize user input in descriptions
- Use appropriate time limits for complexity

### **Access Control:**
- Generate unique question IDs
- Use expiration timestamps for temporary access
- Monitor question usage via status API

### **Production Considerations:**
- Use a database instead of in-memory storage
- Implement authentication for question creation
- Add rate limiting for question generation
- Log question access for security auditing

---

## 🧪 Testing Your Integration

### **1. Test Question Creation:**
```bash
curl -X POST http://localhost:3100/api/question \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Question",
    "description": "Write hello world",
    "language": "python",
    "starterCode": "# Write here"
  }'
```

### **2. Test Question Access:**
```bash
# Get the URL from the creation response, then:
curl "http://localhost:3100/api/question?id=QUESTION_ID"
```

### **3. Test in Browser:**
1. Create a question via API
2. Open the returned URL
3. Verify question appears correctly
4. Test timer functionality (if applicable)
5. Try coding and running solution

---

## 📱 Mobile & Responsive Design

The question display is fully responsive and works on:
- **Desktop** - Full featured experience
- **Tablet** - Optimized layout with touch support
- **Mobile** - Compact view with essential features

---

## 🎯 Next Steps

1. **Start with simple questions** to test the integration
2. **Implement your question creation logic** 
3. **Test the complete workflow** from creation to completion
4. **Add monitoring and analytics** using the status API
5. **Scale to production** with proper database and security

Need help? Check the `integration-examples/interview-platform-integration.js` for a complete working example! 