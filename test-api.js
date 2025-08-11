

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