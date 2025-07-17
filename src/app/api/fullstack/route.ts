import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir, readFile } from 'fs/promises';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { randomUUID } from 'crypto';

const execAsync = promisify(exec);

interface FullStackRequest {
  html?: string;
  css?: string;
  javascript?: string;
  nodejs?: string;
  port?: number;
}

export async function POST(request: NextRequest) {
  try {
    const { html, css, javascript, nodejs, port = 3001 }: FullStackRequest = await request.json();

    if (!html && !css && !javascript && !nodejs) {
      return NextResponse.json(
        { error: 'At least one code type is required' },
        { status: 400 }
      );
    }

    const projectId = randomUUID().substring(0, 8);
    const projectPath = path.join(process.cwd(), 'temp-projects', projectId);

    // Create project directory
    await mkdir(projectPath, { recursive: true });
    await mkdir(path.join(projectPath, 'public'), { recursive: true });

    let serverCode = '';
    let hasBackend = false;

    // Create package.json
    const packageJson = {
      name: `polycode-app-${projectId}`,
      version: '1.0.0',
      type: 'module',
      scripts: {
        start: 'node server.js'
      },
      dependencies: {
        express: '^4.18.2',
        cors: '^2.8.5'
      }
    };

    await writeFile(
      path.join(projectPath, 'package.json'),
      JSON.stringify(packageJson, null, 2)
    );

    // Handle Node.js backend
    if (nodejs && nodejs.trim()) {
      hasBackend = true;
      
      // Check if it's a complete Express app or just routes
      if (nodejs.includes('express') || nodejs.includes('app.listen')) {
        // Complete Express app - modify to bind to 0.0.0.0 for Docker compatibility
        serverCode = nodejs.replace(
          /app\.listen\s*\(\s*([^,)]+)\s*,?\s*([^)]*)\)/g,
          (match, port, callback) => {
            // If callback is provided, keep it; otherwise use empty function
            const cb = callback.trim() ? callback : '() => {}'
            return `app.listen(${port}, '0.0.0.0', ${cb})`
          }
        );
      } else {
        // Just routes - wrap in Express app
        serverCode = `
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = ${port};

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Custom routes from user
${nodejs}

// Serve main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(\`🚀 PolyCode app running on http://localhost:\${PORT}\`);
  console.log(\`📁 Project ID: ${projectId}\`);
});

export default app;
        `;
      }
    } else {
      // Static file server only
      serverCode = `
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = ${port};

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(\`🌐 PolyCode static site running on http://localhost:\${PORT}\`);
  console.log(\`📁 Project ID: ${projectId}\`);
});

export default app;
      `;
    }

    // Create server.js
    await writeFile(path.join(projectPath, 'server.js'), serverCode);

    // Create HTML file
    let htmlContent = html || `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PolyCode App</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div class="container">
        <h1>Welcome to PolyCode!</h1>
        <p>Your full-stack application is running successfully.</p>
        <div class="status">
            <span class="badge">✅ Frontend</span>
            ${hasBackend ? '<span class="badge">✅ Backend</span>' : '<span class="badge">📄 Static</span>'}
        </div>
    </div>
    <script src="script.js"></script>
</body>
</html>`;

    // If HTML doesn't include CSS link, add it
    if (css && !htmlContent.includes('styles.css')) {
      htmlContent = htmlContent.replace(
        '</head>',
        '    <link rel="stylesheet" href="styles.css">\n</head>'
      );
    }

    // If HTML doesn't include JS script, add it
    if (javascript && !htmlContent.includes('script.js')) {
      htmlContent = htmlContent.replace(
        '</body>',
        '    <script src="script.js"></script>\n</body>'
      );
    }

    await writeFile(path.join(projectPath, 'public', 'index.html'), htmlContent);

    // Create CSS file
    const cssContent = css || `
/* PolyCode Default Styles */
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

.container {
    background: rgba(255, 255, 255, 0.95);
    border-radius: 15px;
    padding: 40px;
    text-align: center;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(10px);
}

.container h1 {
    color: #333;
    margin-bottom: 20px;
    font-size: 2.5rem;
}

.container p {
    color: #666;
    font-size: 1.2rem;
    margin-bottom: 30px;
}

.status {
    display: flex;
    justify-content: center;
    gap: 15px;
}

.badge {
    background: #4CAF50;
    color: white;
    padding: 8px 16px;
    border-radius: 20px;
    font-size: 14px;
    font-weight: 600;
}
`;

    await writeFile(path.join(projectPath, 'public', 'styles.css'), cssContent);

    // Create JavaScript file
    const jsContent = javascript || `
// PolyCode Default JavaScript
console.log('🚀 PolyCode application loaded successfully!');

document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ DOM loaded');
    
    // Add some interactive functionality
    const container = document.querySelector('.container');
    if (container) {
        container.addEventListener('click', () => {
            console.log('👆 Container clicked!');
        });
    }
    
    // Log application info
    console.log('📊 Application Info:', {
        title: document.title,
        url: window.location.href,
        timestamp: new Date().toISOString()
    });
});

// Example API call function (if backend is available)
async function callAPI(endpoint, data = null) {
    try {
        const options = {
            method: data ? 'POST' : 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        };
        
        if (data) {
            options.body = JSON.stringify(data);
        }
        
        const response = await fetch(endpoint, options);
        return await response.json();
    } catch (error) {
        console.error('API call failed:', error);
        return null;
    }
}

// Make callAPI available globally
window.callAPI = callAPI;
`;

    await writeFile(path.join(projectPath, 'public', 'script.js'), jsContent);

    // Install dependencies and start server
    try {
      // Install npm packages
      await execAsync('npm install', { cwd: projectPath });
      
      // Start the server in background
      const serverProcess = exec('npm start', { cwd: projectPath });
      
      // Give server time to start
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Check if server is running
      try {
        const response = await fetch(`http://localhost:${port}`);
        const isRunning = response.ok;

        // Determine the correct external URL (adjust for Docker)
        const isDocker = process.env.DOCKER_ENV === 'true';
        const portOffset = isDocker ? parseInt(process.env.DOCKER_PORT_OFFSET || '100') : 0;
        const externalPort = port + portOffset;
        const externalUrl = `http://localhost:${externalPort}`;

        return NextResponse.json({
          success: true,
          projectId,
          url: externalUrl,
          message: isRunning 
            ? `🚀 Full-stack application is running on port ${port}!`
            : `⚠️ Server started but may still be initializing...`,
          files: {
            'server.js': hasBackend ? '✅ Express server with custom routes' : '📄 Static file server',
            'public/index.html': '🌐 HTML structure',
            'public/styles.css': '🎨 CSS styling',
            'public/script.js': '⚡ JavaScript functionality'
          },
          features: {
            frontend: true,
            backend: hasBackend,
            port: port,
            endpoints: hasBackend ? 'Custom routes available' : 'Static files only'
          }
        });
      } catch (fetchError) {
        // Determine the correct external URL (adjust for Docker)
        const isDocker = process.env.DOCKER_ENV === 'true';
        const portOffset = isDocker ? parseInt(process.env.DOCKER_PORT_OFFSET || '100') : 0;
        const externalPort = port + portOffset;
        const externalUrl = `http://localhost:${externalPort}`;

        return NextResponse.json({
          success: true,
          projectId,
          url: externalUrl,
          message: `🔄 Server is starting... Check ${externalUrl} in a few seconds`,
          files: {
            'server.js': hasBackend ? '✅ Express server with custom routes' : '📄 Static file server',
            'public/index.html': '🌐 HTML structure',
            'public/styles.css': '🎨 CSS styling',
            'public/script.js': '⚡ JavaScript functionality'
          },
          features: {
            frontend: true,
            backend: hasBackend,
            port: port,
            endpoints: hasBackend ? 'Custom routes available' : 'Static files only'
          }
        });
      }

    } catch (execError: any) {
      console.error('Server execution error:', execError);
      return NextResponse.json({
        success: false,
        error: `Failed to start server: ${execError.message}`,
        projectId,
        suggestion: 'Check your Node.js code for syntax errors'
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error('Full-stack execution error:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to create full-stack application',
      suggestion: 'Make sure your code is valid and try again'
    }, { status: 500 });
  }
} 