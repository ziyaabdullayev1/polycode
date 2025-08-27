

const BASE_URL = 'http://localhost:3000';

// Sample questions for testing
const sampleQuestions = [
  {
    title: "Two Sum Problem",
    description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
    language: "javascript",
    difficulty: "easy",
    starterCode: `function twoSum(nums, target) {
    // Your code here
    return [];
}`,
    timeLimit: 900, // 15 minutes
    testCases: [
      {
        input: "nums = [2,7,11,15], target = 9",
        output: "[0,1]",
        explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]."
      }
    ],
    hints: [
      "Try using a hash map to store values and their indices",
      "For each number, check if target - number exists in the hash map"
    ],
    tags: ["arrays", "hash-table", "easy"]
  },
  {
    title: "Fibonacci Sequence",
    description: "Write a function that returns the nth Fibonacci number.",
    language: "python",
    difficulty: "medium",
    starterCode: `def fibonacci(n):
    # Your code here
    pass`,
    timeLimit: 600, // 10 minutes
    testCases: [
      {
        input: "n = 5",
        output: "5",
        explanation: "F(5) = F(4) + F(3) = 3 + 2 = 5"
      }
    ],
    hints: [
      "Consider using dynamic programming",
      "You can solve this iteratively or recursively"
    ],
    tags: ["dynamic-programming", "recursion", "medium"]
  },
  {
    title: "Reverse String",
    description: "Write a function that reverses a string. The input string is given as an array of characters s.",
    language: "javascript",
    difficulty: "easy",
    starterCode: `function reverseString(s) {
    // Your code here
    // Do not return anything, modify s in-place instead
}`,
    timeLimit: 300, // 5 minutes
    testCases: [
      {
        input: `s = ["h","e","l","l","o"]`,
        output: `["o","l","l","e","h"]`,
        explanation: "The string 'hello' becomes 'olleh' when reversed."
      },
      {
        input: `s = ["H","a","n","n","a","h"]`,
        output: `["h","a","n","n","a","H"]`,
        explanation: "The string 'Hannah' becomes 'hannaH' when reversed."
      }
    ],
    hints: [
      "Use two pointers, one at the beginning and one at the end",
      "Swap characters and move pointers toward each other"
    ],
    tags: ["two-pointers", "string", "easy"]
  },
  {
    title: "Binary Search",
    description: "Given an array of integers nums which is sorted in ascending order, and an integer target, write a function to search target in nums. If target exists, then return its index. Otherwise, return -1.",
    language: "python",
    difficulty: "medium",
    starterCode: `def search(nums, target):
    # Your code here
    return -1`,
    timeLimit: 480, // 8 minutes
    testCases: [
      {
        input: "nums = [-1,0,3,5,9,12], target = 9",
        output: "4",
        explanation: "9 exists in nums and its index is 4"
      },
      {
        input: "nums = [-1,0,3,5,9,12], target = 2",
        output: "-1",
        explanation: "2 does not exist in nums so return -1"
      }
    ],
    hints: [
      "Use the divide and conquer approach",
      "Compare target with the middle element to decide which half to search"
    ],
    tags: ["binary-search", "array", "divide-and-conquer", "medium"]
  },
  {
    title: "Valid Parentheses",
    description: "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid. An input string is valid if: Open brackets must be closed by the same type of brackets and in the correct order.",
    language: "javascript", 
    difficulty: "easy",
    starterCode: `function isValid(s) {
    // Your code here
    return false;
}`,
    timeLimit: 420, // 7 minutes
    testCases: [
      {
        input: `s = "()"`,
        output: "true",
        explanation: "The string contains valid parentheses."
      },
      {
        input: `s = "()[]{}"`,
        output: "true", 
        explanation: "All brackets are properly matched and nested."
      },
      {
        input: `s = "(]"`,
        output: "false",
        explanation: "The brackets are not properly matched."
      }
    ],
    hints: [
      "Use a stack data structure to keep track of opening brackets",
      "When you encounter a closing bracket, check if it matches the most recent opening bracket"
    ],
    tags: ["stack", "string", "easy"]
  }
];

async function testAPI() {
  console.log('🧪 Testing Question API endpoints...\n');

  try {
    // Test 1: Create questions
    console.log('1. Testing POST /api/question (Create questions)');
    const createdQuestions = [];
    
    for (const question of sampleQuestions) {
      const response = await fetch(`${BASE_URL}/api/question`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(question),
      });
      
      if (response.ok) {
        const result = await response.json();
        createdQuestions.push(result.question);
        console.log(`✅ Created question: "${result.question.title}" (ID: ${result.question.id})`);
      } else {
        const error = await response.text();
        console.log(`❌ Failed to create question: ${error}`);
      }
    }

    // Test 2: Get all questions
    console.log('\n2. Testing GET /api/question (Get all questions)');
    const getAllResponse = await fetch(`${BASE_URL}/api/question`);
    if (getAllResponse.ok) {
      const result = await getAllResponse.json();
      console.log(`✅ Retrieved ${result.questions.length} questions`);
      result.questions.forEach(q => {
        console.log(`   - ${q.title} (${q.difficulty}) - ${q.language}`);
      });
    } else {
      console.log(`❌ Failed to get questions: ${getAllResponse.status}`);
    }

    // Test 3: Get question by ID
    if (createdQuestions.length > 0) {
      const questionId = createdQuestions[0].id;
      console.log(`\n3. Testing GET /api/question?id=${questionId} (Get specific question)`);
      
      const getByIdResponse = await fetch(`${BASE_URL}/api/question?id=${questionId}`);
      if (getByIdResponse.ok) {
        const result = await getByIdResponse.json();
        console.log(`✅ Retrieved question: "${result.question.title}"`);
        console.log(`   Difficulty: ${result.question.difficulty}`);
        console.log(`   Time limit: ${result.question.timeLimit} seconds`);
        console.log(`   Test cases: ${result.question.testCases.length}`);
        console.log(`   Hints: ${result.question.hints.length}`);
      } else {
        console.log(`❌ Failed to get question by ID: ${getByIdResponse.status}`);
      }
    }

    // Test 4: Update question
    if (createdQuestions.length > 0) {
      const questionId = createdQuestions[0].id;
      console.log(`\n4. Testing PUT /api/question (Update question)`);
      
      const updateData = {
        id: questionId,
        difficulty: "hard",
        timeLimit: 1800, // 30 minutes
        tags: [...createdQuestions[0].tags, "updated"]
      };

      const updateResponse = await fetch(`${BASE_URL}/api/question`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (updateResponse.ok) {
        const result = await updateResponse.json();
        console.log(`✅ Updated question: "${result.question.title}"`);
        console.log(`   New difficulty: ${result.question.difficulty}`);
        console.log(`   New time limit: ${result.question.timeLimit} seconds`);
      } else {
        console.log(`❌ Failed to update question: ${updateResponse.status}`);
      }
    }

    // Test 5: Filter questions
    console.log('\n5. Testing GET /api/question?difficulty=easy (Filter by difficulty)');
    const filterResponse = await fetch(`${BASE_URL}/api/question?difficulty=easy`);
    if (filterResponse.ok) {
      const result = await filterResponse.json();
      console.log(`✅ Found ${result.questions.length} easy questions`);
    } else {
      console.log(`❌ Failed to filter questions: ${filterResponse.status}`);
    }

    console.log('\n6. Testing GET /api/question?language=javascript (Filter by language)');
    const languageFilterResponse = await fetch(`${BASE_URL}/api/question?language=javascript`);
    if (languageFilterResponse.ok) {
      const result = await languageFilterResponse.json();
      console.log(`✅ Found ${result.questions.length} JavaScript questions`);
    } else {
      console.log(`❌ Failed to filter by language: ${languageFilterResponse.status}`);
    }

    // Test 6: Delete questions
    console.log('\n7. Testing DELETE /api/question (Delete questions)');
    for (const question of createdQuestions) {
      const deleteResponse = await fetch(`${BASE_URL}/api/question?id=${question.id}`, {
        method: 'DELETE',
      });

      if (deleteResponse.ok) {
        console.log(`✅ Deleted question: "${question.title}"`);
      } else {
        console.log(`❌ Failed to delete question: ${deleteResponse.status}`);
      }
    }

    console.log('\n🎉 All API tests completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n💡 Make sure your Next.js dev server is running on http://localhost:3000');
  }
}

// Run the tests
testAPI(); 