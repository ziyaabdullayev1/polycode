import { LanguageConfig } from '@/types';

export const LANGUAGES: LanguageConfig = {
  javascript: {
    name: 'javascript',
    displayName: 'JavaScript',
    version: '18.15.0',
    available: true,
    defaultCode: `// Node.js Express Server + Frontend JavaScript
// This works with the HTML/CSS panels for full-stack deployment!

// API Routes (Backend)
app.get('/api/users', (req, res) => {
    const users = [
        { id: 1, name: 'Alice', role: 'Developer' },
        { id: 2, name: 'Bob', role: 'Designer' },
        { id: 3, name: 'Charlie', role: 'Manager' }
    ];
    res.json(users);
});

app.post('/api/users', (req, res) => {
    const { name, role } = req.body;
    const newUser = {
        id: Date.now(),
        name: name || 'Anonymous',
        role: role || 'User'
    };
    res.json({ success: true, user: newUser });
});

app.get('/api/stats', (req, res) => {
    res.json({
        users: 3,
        projects: 12,
        uptime: '99.9%',
        version: '1.0.0'
    });
});

// Frontend JavaScript (for browser)
// Uncomment this section for client-side code:

/*
document.addEventListener('DOMContentLoaded', async () => {
    // Load users from API
    try {
        const response = await fetch('/api/users');
        const users = await response.json();
        
        const usersList = document.getElementById('users-list');
        if (usersList) {
            usersList.innerHTML = users.map(user => 
                \`<div class="user-card">
                    <h3>\${user.name}</h3>
                    <p>\${user.role}</p>
                </div>\`
            ).join('');
        }
    } catch (error) {
        console.error('Failed to load users:', error);
    }
    
    // Add user form handler
    const form = document.getElementById('add-user-form');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            
            try {
                const response = await fetch('/api/users', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: formData.get('name'),
                        role: formData.get('role')
                    })
                });
                
                const result = await response.json();
                if (result.success) {
                    location.reload(); // Refresh to show new user
                }
            } catch (error) {
                console.error('Failed to add user:', error);
            }
        });
    }
});
*/`
  },

  python: {
    name: 'python',
    displayName: 'Python',
    version: '3.10.0',
    available: true,
    defaultCode: `# Python Example
def greet(name):
    return f"Hello, {name}!"

print(greet("PolyCode"))

# List comprehension
numbers = [1, 2, 3, 4, 5]
doubled = [n * 2 for n in numbers]
print("Doubled:", doubled)

# Class example
class Person:
    def __init__(self, name, age):
        self.name = name
        self.age = age
    
    def greet(self):
        return f"Hi, I'm {self.name}"

person = Person("Alice", 30)
print(person.greet())

# Dictionary usage
student = {"name": "Bob", "grade": "A"}
print(f"Student: {student['name']}, Grade: {student['grade']}")`
  },

  go: {
    name: 'go',
    displayName: 'Go',
    version: '1.16.2',
    available: true,
    defaultCode: `package main

import "fmt"

// Go Example
func greet(name string) string {
    return fmt.Sprintf("Hello, %s!", name)
}

func main() {
    fmt.Println(greet("PolyCode"))
    
    // Slice manipulation
    numbers := []int{1, 2, 3, 4, 5}
    var doubled []int
    
    for _, n := range numbers {
        doubled = append(doubled, n*2)
    }
    
    fmt.Println("Doubled:", doubled)
    
    // Struct example
    type Person struct {
        Name string
        Age  int
    }
    
    person := Person{Name: "Alice", Age: 30}
    fmt.Printf("Person: %+v\\n", person)
    
    // Map usage
    student := map[string]interface{}{
        "name":  "Bob",
        "grade": "A",
    }
    fmt.Printf("Student: %v\\n", student)
}`
  },

  java: {
    name: 'java',
    displayName: 'Java',
    version: '15.0.2',
    available: true,
    defaultCode: `import java.util.*;
import java.util.stream.*;

public class Main {
    // Java Example
    public static String greet(String name) {
        return String.format("Hello, %s!", name);
    }
    
    public static void main(String[] args) {
        System.out.println(greet("PolyCode"));
        
        // Stream API
        List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5);
        List<Integer> doubled = numbers.stream()
            .map(n -> n * 2)
            .collect(Collectors.toList());
        
        System.out.println("Doubled: " + doubled);
        
        // Object example
        Person person = new Person("Alice", 30);
        System.out.println(person.greet());
        
        // Map usage
        Map<String, Object> student = new HashMap<>();
        student.put("name", "Bob");
        student.put("grade", "A");
        System.out.println("Student: " + student);
    }
}

class Person {
    private String name;
    private int age;
    
    public Person(String name, int age) {
        this.name = name;
        this.age = age;
    }
    
    public String greet() {
        return String.format("Hi, I'm %s", this.name);
    }
}`
  },

  cpp: {
    name: 'cpp',
    displayName: 'C++',
    version: '10.2.0',
    available: true,
    defaultCode: `#include <iostream>
#include <vector>
#include <string>
#include <map>

using namespace std;

// C++ Example
string greet(const string& name) {
    return "Hello, " + name + "!";
}

int main() {
    cout << greet("PolyCode") << endl;
    
    // Vector manipulation
    vector<int> numbers = {1, 2, 3, 4, 5};
    vector<int> doubled;
    
    for (int n : numbers) {
        doubled.push_back(n * 2);
    }
    
    cout << "Doubled: ";
    for (int n : doubled) {
        cout << n << " ";
    }
    cout << endl;
    
    // Class example
    class Person {
    public:
        string name;
        int age;
        
        Person(string n, int a) : name(n), age(a) {}
        
        string greet() {
            return "Hi, I'm " + name;
        }
    };
    
    Person person("Alice", 30);
    cout << person.greet() << endl;
    
    // Map usage
    map<string, string> student;
    student["name"] = "Bob";
    student["grade"] = "A";
    cout << "Student: " << student["name"] << ", Grade: " << student["grade"] << endl;
    
    return 0;
}`
  },

  typescript: {
    name: 'typescript',
    displayName: 'TypeScript',
    version: '4.4.4',
    available: true,
    defaultCode: `// TypeScript Example
interface Person {
    name: string;
    age: number;
    greet(): string;
}

function greet(name: string): string {
    return \`Hello, \${name}!\`;
}

console.log(greet("PolyCode"));

// Array manipulation with types
const numbers: number[] = [1, 2, 3, 4, 5];
const doubled: number[] = numbers.map((n: number) => n * 2);
console.log("Doubled:", doubled);

// Class with interface implementation
class Student implements Person {
    constructor(public name: string, public age: number, public grade: string) {}
    
    greet(): string {
        return \`Hi, I'm \${this.name}, grade \${this.grade}\`;
    }
}

const student = new Student("Alice", 20, "A");
console.log(student.greet());

// Generic function
function identity<T>(arg: T): T {
    return arg;
}

console.log(identity<string>("TypeScript"));
console.log(identity<number>(42));`
  },

  php: {
    name: 'php',
    displayName: 'PHP',
    version: '8.2.3',
    available: true,
    defaultCode: `<?php
// PHP Example
function greet($name) {
    return "Hello, $name!";
}

echo greet("PolyCode") . "\\n";

// Array manipulation
$numbers = [1, 2, 3, 4, 5];
$doubled = array_map(function($n) {
    return $n * 2;
}, $numbers);

echo "Doubled: " . implode(", ", $doubled) . "\\n";

// Class example
class Person {
    private $name;
    private $age;
    
    public function __construct($name, $age) {
        $this->name = $name;
        $this->age = $age;
    }
    
    public function greet() {
        return "Hi, I'm " . $this->name;
    }
    
    public function getName() {
        return $this->name;
    }
}

$person = new Person("Alice", 30);
echo $person->greet() . "\\n";

// Associative array
$student = [
    "name" => "Bob",
    "grade" => "A",
    "subjects" => ["Math", "Science", "English"]
];

echo "Student: " . $student["name"] . ", Grade: " . $student["grade"] . "\\n";
echo "Subjects: " . implode(", ", $student["subjects"]) . "\\n";

// Built-in functions
$text = "PolyCode Platform";
echo "Uppercase: " . strtoupper($text) . "\\n";
echo "Length: " . strlen($text) . "\\n";
?>`
  },

  html: {
    name: 'html',
    displayName: 'HTML',
    version: '5',
    available: true,
    defaultCode: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PolyCode HTML Example</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            line-height: 1.6;
            background-color: #f4f4f4;
        }
        .container {
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }
        .header {
            color: #333;
            text-align: center;
            border-bottom: 2px solid #4CAF50;
            padding-bottom: 10px;
        }
        .feature {
            background: #e8f5e8;
            padding: 15px;
            margin: 15px 0;
            border-left: 4px solid #4CAF50;
            border-radius: 5px;
        }
        .button {
            background: #4CAF50;
            color: white;
            padding: 10px 20px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
        }
        .button:hover {
            background: #45a049;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1 class="header">Welcome to PolyCode</h1>
        
        <p>This is an example HTML document showcasing various HTML5 features and semantic elements.</p>
        
        <section>
            <h2>Features</h2>
            <div class="feature">
                <h3>Multi-language Support</h3>
                <p>Code in JavaScript, Python, Go, Java, C++, PHP, and more!</p>
            </div>
            
            <div class="feature">
                <h3>Real-time Execution</h3>
                <p>See your code results instantly with our powerful execution engine.</p>
            </div>
            
            <div class="feature">
                <h3>Modern Interface</h3>
                <p>Clean, intuitive design for the best coding experience.</p>
            </div>
        </section>
        
        <section>
            <h2>Interactive Elements</h2>
            <form>
                <label for="name">Your Name:</label>
                <input type="text" id="name" name="name" placeholder="Enter your name">
                
                <label for="language">Favorite Language:</label>
                <select id="language" name="language">
                    <option value="javascript">JavaScript</option>
                    <option value="python">Python</option>
                    <option value="php">PHP</option>
                    <option value="html">HTML</option>
                </select>
                
                <button type="button" class="button" onclick="showGreeting()">Greet Me!</button>
            </form>
            
            <div id="greeting"></div>
        </section>
        
        <footer>
            <p>&copy; 2024 PolyCode Platform. Built with HTML5, CSS3, and modern web standards.</p>
        </footer>
    </div>
    
    <script>
        function showGreeting() {
            const name = document.getElementById('name').value || 'Anonymous';
            const language = document.getElementById('language').value;
            const greeting = document.getElementById('greeting');
            
            greeting.innerHTML = \`
                <div class="feature">
                    <h3>Hello, \${name}!</h3>
                    <p>Great choice with \${language}! Happy coding!</p>
                </div>
            \`;
        }
    </script>
</body>
</html>`
  },

  css: {
    name: 'css',
    displayName: 'CSS',
    version: '3',
    available: true,
    defaultCode: `/* CSS Example - Modern Card Layout */

/* Reset and base styles */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
}

/* Main container */
.container {
    max-width: 1200px;
    width: 100%;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 30px;
    padding: 20px;
}

/* Card styles */
.card {
    background: rgba(255, 255, 255, 0.95);
    border-radius: 15px;
    padding: 30px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(10px);
    transform: translateY(0);
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
}

.card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #ff6b6b, #4ecdc4, #45b7d1);
    animation: shimmer 2s infinite;
}

@keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
}

.card:hover {
    transform: translateY(-10px);
    box-shadow: 0 30px 60px rgba(0, 0, 0, 0.2);
}

/* Typography */
.card h2 {
    color: #333;
    margin-bottom: 15px;
    font-size: 1.5rem;
    position: relative;
}

.card p {
    color: #666;
    line-height: 1.6;
    margin-bottom: 20px;
}

/* Button styles */
.btn {
    display: inline-block;
    padding: 12px 24px;
    background: linear-gradient(45deg, #667eea, #764ba2);
    color: white;
    text-decoration: none;
    border-radius: 25px;
    font-weight: 600;
    transition: all 0.3s ease;
    border: none;
    cursor: pointer;
    font-size: 14px;
    text-transform: uppercase;
    letter-spacing: 1px;
}

.btn:hover {
    background: linear-gradient(45deg, #764ba2, #667eea);
    transform: scale(1.05);
    box-shadow: 0 10px 25px rgba(102, 126, 234, 0.4);
}

/* Feature list */
.features {
    list-style: none;
    margin: 20px 0;
}

.features li {
    padding: 8px 0;
    position: relative;
    padding-left: 25px;
    color: #555;
}

.features li::before {
    content: '✓';
    position: absolute;
    left: 0;
    color: #4ecdc4;
    font-weight: bold;
}

/* Code block */
.code-block {
    background: #f8f9fa;
    border: 1px solid #e9ecef;
    border-radius: 8px;
    padding: 15px;
    font-family: 'Courier New', monospace;
    font-size: 14px;
    color: #333;
    margin: 15px 0;
    overflow-x: auto;
}

/* Responsive design */
@media (max-width: 768px) {
    .container {
        grid-template-columns: 1fr;
        gap: 20px;
        padding: 10px;
    }
    
    .card {
        padding: 20px;
    }
    
    body {
        padding: 10px;
    }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
    .card {
        background: rgba(30, 30, 30, 0.95);
        color: #fff;
    }
    
    .card h2 {
        color: #fff;
    }
    
    .card p {
        color: #ccc;
    }
    
    .code-block {
        background: #2d2d2d;
        border-color: #555;
        color: #fff;
    }
}

/* Animation utilities */
.fade-in {
    opacity: 0;
    animation: fadeIn 1s ease forwards;
}

@keyframes fadeIn {
    to { opacity: 1; }
}

.slide-up {
    transform: translateY(30px);
    opacity: 0;
    animation: slideUp 0.6s ease forwards;
}

@keyframes slideUp {
    to {
        transform: translateY(0);
        opacity: 1;
    }
}`
  }
};

export const DEFAULT_EDITORS = [
  { id: '1', language: 'html' },
  { id: '2', language: 'css' },
  { id: '3', language: 'javascript' }
];

// Full-stack demo setup
export const FULLSTACK_DEMO_SETUP = [
  { id: '1', language: 'html' },
  { id: '2', language: 'css' },
  { id: '3', language: 'javascript' }
]; 