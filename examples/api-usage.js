/**
 * PolyCode API Usage Examples
 * 
 * This file demonstrates how to interact with the PolyCode API
 * using various HTTP methods and endpoints.
 * 
 * For full interactive documentation, visit: http://localhost:3000/docs
 */

const API_BASE_URL = 'http://localhost:3000';

// Example 1: Execute JavaScript code
async function executeJavaScript() {
  console.log('🚀 Executing JavaScript code...');
  
  const response = await fetch(`${API_BASE_URL}/api/execute`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      code: `
        function fibonacci(n) {
          if (n <= 1) return n;
          return fibonacci(n - 1) + fibonacci(n - 2);
        }
        
        console.log('Fibonacci sequence:');
        for (let i = 0; i < 10; i++) {
          console.log(\`F(\${i}) = \${fibonacci(i)}\`);
        }
      `,
      language: 'javascript'
    })
  });
  
  const result = await response.json();
  console.log('✅ JavaScript Output:', result.output);
  console.log('❌ Errors:', result.error || 'None');
}

// Example 2: Execute Python code with input
async function executePythonWithInput() {
  console.log('\n🐍 Executing Python code with input...');
  
  const response = await fetch(`${API_BASE_URL}/api/execute`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      code: `
        name = input("Enter your name: ")
        age = int(input("Enter your age: "))
        
        print(f"Hello, {name}!")
        print(f"You are {age} years old.")
        
        if age >= 18:
            print("You are an adult.")
        else:
            print("You are a minor.")
      `,
      language: 'python',
      input: 'Alice\n25'
    })
  });
  
  const result = await response.json();
  console.log('✅ Python Output:', result.output);
  console.log('❌ Errors:', result.error || 'None');
}

// Example 3: Get available languages
async function getAvailableLanguages() {
  console.log('\n📋 Getting available languages...');
  
  const response = await fetch(`${API_BASE_URL}/api/execute`);
  const result = await response.json();
  
  console.log('✅ Available Languages:');
  result.languages.forEach(lang => {
    console.log(`  - ${lang.name} (v${lang.version}) - ${lang.available ? '✅ Available' : '❌ Unavailable'}`);
  });
}

// Example 4: Deploy a full-stack application
async function deployFullStackApp() {
  console.log('\n🌐 Deploying full-stack application...');
  
  const response = await fetch(`${API_BASE_URL}/api/fullstack`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Todo App</title>
            <link rel="stylesheet" href="styles.css">
        </head>
        <body>
            <div class="container">
                <h1>My Todo App</h1>
                <div class="input-section">
                    <input type="text" id="todoInput" placeholder="Enter a new todo...">
                    <button onclick="addTodo()">Add Todo</button>
                </div>
                <ul id="todoList"></ul>
                <div class="stats">
                    <p>Total todos: <span id="totalCount">0</span></p>
                </div>
            </div>
            <script src="script.js"></script>
        </body>
        </html>
      `,
      css: `
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 15px;
            padding: 30px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        }
        
        h1 {
            color: #333;
            margin-bottom: 30px;
            text-align: center;
        }
        
        .input-section {
            display: flex;
            gap: 10px;
            margin-bottom: 30px;
        }
        
        input[type="text"] {
            flex: 1;
            padding: 12px;
            border: 2px solid #e1e1e1;
            border-radius: 8px;
            font-size: 16px;
        }
        
        button {
            padding: 12px 24px;
            background: #4CAF50;
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 16px;
            transition: background 0.3s;
        }
        
        button:hover {
            background: #45a049;
        }
        
        ul {
            list-style: none;
        }
        
        .todo-item {
            padding: 15px;
            margin: 10px 0;
            background: #f9f9f9;
            border-radius: 8px;
            border-left: 4px solid #4CAF50;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .stats {
            margin-top: 30px;
            text-align: center;
            color: #666;
        }
      `,
      javascript: `
        let todos = [];
        let nextId = 1;
        
        function addTodo() {
            const input = document.getElementById('todoInput');
            const text = input.value.trim();
            
            if (text) {
                const todo = {
                    id: nextId++,
                    text: text,
                    completed: false
                };
                
                todos.push(todo);
                input.value = '';
                renderTodos();
                updateStats();
                
                // Make API call to save todo
                saveTodo(todo);
            }
        }
        
        function renderTodos() {
            const todoList = document.getElementById('todoList');
            todoList.innerHTML = '';
            
            todos.forEach(todo => {
                const li = document.createElement('li');
                li.className = 'todo-item';
                li.innerHTML = \`
                    <span>\${todo.text}</span>
                    <button onclick="removeTodo(\${todo.id})" style="background: #f44336; padding: 8px 16px;">Delete</button>
                \`;
                todoList.appendChild(li);
            });
        }
        
        function removeTodo(id) {
            todos = todos.filter(todo => todo.id !== id);
            renderTodos();
            updateStats();
        }
        
        function updateStats() {
            document.getElementById('totalCount').textContent = todos.length;
        }
        
        async function saveTodo(todo) {
            try {
                const response = await fetch('/api/todos', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(todo)
                });
                
                if (response.ok) {
                    console.log('Todo saved successfully');
                }
            } catch (error) {
                console.error('Error saving todo:', error);
            }
        }
        
        // Load todos on page load
        document.addEventListener('DOMContentLoaded', () => {
            renderTodos();
            updateStats();
        });
      `,
      nodejs: `
        // Todo API endpoints
        let todos = [];
        
        app.get('/api/todos', (req, res) => {
            res.json(todos);
        });
        
        app.post('/api/todos', (req, res) => {
            const todo = req.body;
            todos.push(todo);
            res.json({ success: true, todo });
        });
        
        app.delete('/api/todos/:id', (req, res) => {
            const id = parseInt(req.params.id);
            todos = todos.filter(todo => todo.id !== id);
            res.json({ success: true });
        });
        
        app.get('/api/todos/stats', (req, res) => {
            res.json({
                total: todos.length,
                completed: todos.filter(t => t.completed).length,
                pending: todos.filter(t => !t.completed).length
            });
        });
      `,
      port: 3002
    })
  });
  
  const result = await response.json();
  
  if (result.success) {
    console.log('✅ Full-stack app deployed successfully!');
    console.log(`🌐 URL: ${result.url}`);
    console.log(`📁 Project ID: ${result.projectId}`);
    console.log('📋 Features:', result.features);
  } else {
    console.log('❌ Deployment failed:', result.error);
  }
}

// Example 5: Create a coding interview question
async function createInterviewQuestion() {
  console.log('\n📝 Creating interview question...');
  
  const response = await fetch(`${API_BASE_URL}/api/question`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: 'Two Sum',
      description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nYou can return the answer in any order.',
      language: 'javascript',
      difficulty: 'easy',
      starterCode: `function twoSum(nums, target) {
    // Your code here
    
}

// Test cases
console.log(twoSum([2,7,11,15], 9)); // Expected: [0,1]
console.log(twoSum([3,2,4], 6));     // Expected: [1,2]
console.log(twoSum([3,3], 6));       // Expected: [0,1]`,
      testCases: [
        {
          input: '[2,7,11,15], 9',
          expectedOutput: '[0,1]',
          description: 'nums[0] + nums[1] = 2 + 7 = 9'
        },
        {
          input: '[3,2,4], 6',
          expectedOutput: '[1,2]',
          description: 'nums[1] + nums[2] = 2 + 4 = 6'
        },
        {
          input: '[3,3], 6',
          expectedOutput: '[0,1]',
          description: 'nums[0] + nums[1] = 3 + 3 = 6'
        }
      ],
      hints: [
        'Try using a hash map to store the values you have seen so far',
        'For each number, check if target - current number exists in the hash map',
        'Remember to store both the value and its index'
      ],
      timeLimit: 30,
      tags: ['array', 'hash-table', 'two-pointers']
    })
  });
  
  const result = await response.json();
  
  if (result.success) {
    console.log('✅ Question created successfully!');
    console.log(`📝 Question ID: ${result.questionId}`);
    console.log(`🔗 URL: ${result.url}`);
  } else {
    console.log('❌ Question creation failed:', result.error);
  }
}

// Example 6: Check API health
async function checkHealth() {
  console.log('\n❤️ Checking API health...');
  
  const response = await fetch(`${API_BASE_URL}/api/health`);
  const result = await response.json();
  
  console.log('✅ Health Status:', result);
}

// Run all examples
async function runAllExamples() {
  console.log('🎯 PolyCode API Usage Examples\n');
  console.log('For interactive documentation, visit: http://localhost:3000/docs\n');
  
  try {
    await checkHealth();
    await getAvailableLanguages();
    await executeJavaScript();
    await executePythonWithInput();
    await createInterviewQuestion();
    await deployFullStackApp();
    
    console.log('\n🎉 All examples completed successfully!');
    console.log('\n📚 Next Steps:');
    console.log('1. Visit http://localhost:3000/docs for interactive API documentation');
    console.log('2. Try the Swagger UI to test endpoints directly');
    console.log('3. Explore the OpenAPI specification at /api/docs');
    console.log('4. Check out the deployed full-stack app (if deployment succeeded)');
    
  } catch (error) {
    console.error('❌ Error running examples:', error);
    console.log('\n💡 Make sure the PolyCode server is running on http://localhost:3000');
  }
}

// Export functions for individual use
module.exports = {
  executeJavaScript,
  executePythonWithInput,
  getAvailableLanguages,
  deployFullStackApp,
  createInterviewQuestion,
  checkHealth,
  runAllExamples
};

// Run all examples if this file is executed directly
if (require.main === module) {
  runAllExamples();
}
