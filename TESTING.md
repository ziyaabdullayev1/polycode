# Testing the Dynamic Question System

This guide explains how to test the PolyCode dynamic question system locally.

## Quick Start

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Run API tests:**
   ```bash
   node test-runner.js api
   ```

3. **Open the UI test page:**
   ```bash
   node test-runner.js ui
   ```

## Test Components

### 1. API Test Script (`test-api.js`)

Tests all Question API endpoints with sample data:

- ✅ **POST** `/api/question` - Create questions
- ✅ **GET** `/api/question` - Get all questions  
- ✅ **GET** `/api/question?id=123` - Get specific question
- ✅ **PUT** `/api/question` - Update question
- ✅ **DELETE** `/api/question?id=123` - Delete question
- ✅ **GET** `/api/question?difficulty=easy` - Filter by difficulty
- ✅ **GET** `/api/question?language=javascript` - Filter by language

**Sample Output:**
```
🧪 Testing Question API endpoints...

1. Testing POST /api/question (Create questions)
✅ Created question: "Two Sum Problem" (ID: q_1234567890)
✅ Created question: "Fibonacci Sequence" (ID: q_1234567891)

2. Testing GET /api/question (Get all questions)
✅ Retrieved 2 questions
   - Two Sum Problem (easy) - javascript
   - Fibonacci Sequence (medium) - python
...
```

### 2. UI Test Page (`/test-questions`)

Interactive test interface with:

**Control Panel:**
- 🔄 **Reload Questions** - Fetch all questions from API
- ➕ **Create Sample Questions** - Add test questions to database
- 🗑️ **Clear All Questions** - Remove all test data

**Question Browser:**
- View all available questions
- See difficulty badges and metadata
- Click to test questions in PolyCode

**Features Tested:**
- Question creation and management
- API integration
- PolyCode question loading
- Timer functionality
- Test cases and hints display

## Test Runner Commands

Use the `test-runner.js` script for convenient testing:

```bash
# Run API endpoint tests
node test-runner.js api

# Open UI test page in browser
node test-runner.js ui

# Show help
node test-runner.js help
```

## Manual Testing Steps

### 1. Test API Endpoints

```bash
# Start dev server
npm run dev

# Run API tests
node test-api.js
```

Expected: All API operations succeed with ✅ indicators

### 2. Test UI Integration

1. Open http://localhost:3000/test-questions
2. Click "Create Sample Questions"
3. Select a question from the left panel
4. Click "Open Question in PolyCode"
5. Verify question loads with:
   - Question header with title and description
   - Timer countdown
   - Difficulty badge
   - Test cases panel
   - Hints panel
   - Starter code in editor

### 3. Test Question Flow

**Full Interview Simulation:**
1. Visit `http://localhost:3000/?question=QUESTION_ID`
2. Verify question loads automatically
3. Check timer starts counting down
4. Test code execution
5. Verify test cases display correctly
6. Test hint functionality
7. Test question exit functionality

## Sample Questions

The test system includes three sample questions:

1. **Hello World** (Easy, JavaScript, 5 min)
   - Basic console.log exercise
   - Single test case
   - Beginner-friendly hints

2. **Sum Calculator** (Easy, Python, 10 min)
   - Function creation exercise
   - Multiple test cases
   - Function and arithmetic practice

3. **Array Reverse** (Medium, JavaScript, 15 min)
   - Algorithm implementation
   - No built-in methods allowed
   - Multiple test cases and approaches

## Troubleshooting

### Common Issues

**"Failed to fetch" errors:**
- Ensure dev server is running on http://localhost:3000
- Check browser console for CORS issues

**Questions not loading in PolyCode:**
- Verify question ID is valid
- Check browser URL includes `?question=ID` parameter
- Confirm API returns question data

**Timer not working:**
- Check question has `timeLimit` property set
- Verify question loaded correctly
- Check browser console for JavaScript errors

### Debug Tips

**Check API responses:**
```bash
# Test single endpoint
curl http://localhost:3000/api/question

# Create test question
curl -X POST http://localhost:3000/api/question \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","description":"Test question","language":"javascript","difficulty":"easy"}'
```

**Browser debugging:**
- Open DevTools → Console for error messages
- Check Network tab for failed API requests
- Verify localStorage for any cached data issues

## Test Data Cleanup

To reset the test environment:

1. Use "Clear All Questions" button in UI
2. Or run API delete requests manually
3. Restart the dev server for complete reset

## Integration Testing

For testing integration with other systems, see:
- `MICROSERVICE_INTEGRATION.md` - Integration methods
- `interview-platform-integration.js` - Complete example
- `DYNAMIC_QUESTIONS_GUIDE.md` - API documentation

---

**Next Steps:**
- Test Docker deployment (see `DOCKER.md`)
- Set up production question database
- Configure external authentication
- Test with real interview scenarios 