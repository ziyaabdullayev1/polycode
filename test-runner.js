#!/usr/bin/env node

const { exec } = require('child_process');
const path = require('path');

console.log('🧪 PolyCode Question System Test Runner\n');

const args = process.argv.slice(2);
const command = args[0];

const openBrowser = (url) => {
  const start = process.platform === 'darwin' ? 'open' : 
                process.platform === 'win32' ? 'start' : 'xdg-open';
  exec(`${start} ${url}`);
};

const runApiTests = () => {
  console.log('🔌 Running API tests...\n');
  console.log('📝 Make sure your Next.js dev server is running on http://localhost:3000');
  console.log('   Run: npm run dev\n');
  
  const testFile = path.join(__dirname, 'test-api.js');
  exec(`node "${testFile}"`, (error, stdout, stderr) => {
    if (error) {
      console.error('❌ Test execution failed:', error.message);
      return;
    }
    if (stderr) {
      console.error('⚠️  Test warnings:', stderr);
    }
    console.log(stdout);
  });
};

const openTestPage = () => {
  console.log('🌐 Opening test page in browser...\n');
  const url = 'http://localhost:3000/test-questions';
  console.log(`📖 Test page: ${url}`);
  console.log('📝 Make sure your Next.js dev server is running first!\n');
  
  openBrowser(url);
};

const showHelp = () => {
  console.log(`Usage: node test-runner.js [command]

Commands:
  api        Run API endpoint tests
  ui         Open the UI test page in browser
  help       Show this help message

Examples:
  node test-runner.js api     # Test all API endpoints
  node test-runner.js ui      # Open test page in browser
  
Before running tests:
  1. Start the Next.js dev server: npm run dev
  2. Make sure the server is running on http://localhost:3000
  
The test page allows you to:
  - Create sample questions
  - View all questions
  - Test question loading in PolyCode
  - Clear test data
`);
};

switch (command) {
  case 'api':
    runApiTests();
    break;
  case 'ui':
    openTestPage();
    break;
  case 'help':
  case '--help':
  case '-h':
    showHelp();
    break;
  default:
    console.log('❓ Unknown command. Use "help" to see available commands.\n');
    showHelp();
} 