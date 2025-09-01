# PolyCode API Documentation

## Overview

The PolyCode API provides a comprehensive set of endpoints for code execution, full-stack application deployment, question management, and health monitoring. This RESTful API is built with Next.js API routes and follows OpenAPI 3.0 specifications.

## Base URL

- **Development**: `http://localhost:3000`
- **Production**: `https://api.polycode.dev`

## Interactive Documentation

For the most up-to-date and interactive API documentation, visit:

👉 **[Interactive API Docs](http://localhost:3000/docs)**

This provides a Swagger UI interface where you can:
- Explore all available endpoints
- Test API calls directly in your browser
- View detailed request/response schemas
- Copy code examples for different programming languages

## Quick Start

### 1. Health Check
First, verify the API is running:

```bash
curl http://localhost:3000/api/health
```

### 2. Execute Code
Run code in any supported language:

```bash
curl -X POST http://localhost:3000/api/execute \
  -H "Content-Type: application/json" \
  -d '{
    "code": "console.log(\"Hello, World!\");",
    "language": "javascript"
  }'
```

### 3. Deploy Full-Stack App
Create a complete web application:

```bash
curl -X POST http://localhost:3000/api/fullstack \
  -H "Content-Type: application/json" \
  -d '{
    "html": "<!DOCTYPE html><html><head><title>My App</title></head><body><h1>Hello!</h1></body></html>",
    "css": "body { font-family: Arial, sans-serif; }",
    "javascript": "console.log(\"App loaded!\");"
  }'
```

### 4. Create Interview Question
Manage coding interview questions:

```bash
curl -X POST http://localhost:3000/api/question \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Two Sum",
    "description": "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
    "language": "javascript",
    "difficulty": "easy"
  }'
```

## API Endpoints

### Code Execution
- `POST /api/execute` - Execute code in various programming languages
- `GET /api/execute` - Get list of supported languages

### Full-Stack Deployment
- `POST /api/fullstack` - Deploy full-stack web applications

### Question Management
- `POST /api/question` - Create or update coding questions
- `GET /api/question` - Retrieve questions (with optional ID parameter)
- `DELETE /api/question` - Delete questions

### Health & Monitoring
- `GET /api/health` - Service health check
- `GET /api/docs` - OpenAPI specification (JSON)

## Supported Languages

The code execution API supports the following programming languages:

| Language   | Version  | File Extension |
|------------|----------|----------------|
| JavaScript | 18.15.0  | .js            |
| Python     | 3.10.0   | .py            |
| Go         | 1.16.2   | .go            |
| Java       | 15.0.2   | .java          |
| C++        | 10.2.0   | .cpp           |
| C#         | 6.12.0   | .cs            |
| TypeScript | 4.4.4    | .ts            |
| PHP        | 8.2.3    | .php           |
| HTML       | 5        | .html          |
| CSS        | 3        | .css           |

## Authentication

Currently, the API does not require authentication. This may change in future versions for production deployments.

## Rate Limiting

No rate limiting is currently implemented, but it's recommended to implement appropriate rate limiting for production use.

## Error Handling

The API uses standard HTTP status codes:

- `200` - Success
- `400` - Bad Request (missing or invalid parameters)
- `404` - Not Found
- `410` - Gone (for expired resources)
- `500` - Internal Server Error

All error responses include a JSON object with an `error` field describing the issue:

```json
{
  "error": "Code and language are required"
}
```

## Response Formats

All API responses are in JSON format. Successful responses typically include:

- `success`: Boolean indicating operation success
- Data fields specific to the endpoint
- Additional metadata (timestamps, IDs, etc.)

## Code Examples

### JavaScript/Node.js

```javascript
// Execute code
const response = await fetch('http://localhost:3000/api/execute', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    code: 'print("Hello from Python!")',
    language: 'python'
  })
});

const result = await response.json();
console.log(result.output);
```

### Python

```python
import requests

# Execute code
response = requests.post('http://localhost:3000/api/execute', 
  json={
    'code': 'console.log("Hello from JavaScript!");',
    'language': 'javascript'
  }
)

result = response.json()
print(result['output'])
```

### cURL

```bash
# Get supported languages
curl http://localhost:3000/api/execute

# Execute Python code
curl -X POST http://localhost:3000/api/execute \
  -H "Content-Type: application/json" \
  -d '{"code": "print(\"Hello, World!\")", "language": "python"}'

# Create a question
curl -X POST http://localhost:3000/api/question \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Reverse String",
    "description": "Write a function that reverses a string",
    "language": "javascript",
    "difficulty": "easy",
    "starterCode": "function reverseString(s) {\n    // Your code here\n}"
  }'
```

## Development

### Running Locally

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Access the API documentation:
   ```bash
   npm run docs
   ```

### API Schema

The complete OpenAPI 3.0 specification is available at `/api/docs` and includes:
- Detailed endpoint descriptions
- Request/response schemas
- Example payloads
- Parameter validation rules

### Contributing

When adding new endpoints:

1. Update the OpenAPI specification in `swagger.json`
2. Add comprehensive examples and documentation
3. Include proper error handling and validation
4. Test all endpoints thoroughly

## Support

For issues, questions, or feature requests:
- Check the interactive documentation at `/docs`
- Review the OpenAPI specification at `/api/docs`
- Test endpoints using the built-in Swagger UI

## License

This API documentation is part of the PolyCode project and is available under the MIT License.
