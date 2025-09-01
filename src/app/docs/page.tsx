'use client';

import { useEffect } from 'react';

declare global {
  interface Window {
    SwaggerUIBundle: any;
  }
}

export default function SwaggerDocsPage() {
  useEffect(() => {
    // Load Swagger UI from CDN
    const loadSwaggerUI = () => {
      // Load CSS
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/swagger-ui-dist@4.19.0/swagger-ui.css';
      document.head.appendChild(link);

      // Load JS
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/swagger-ui-dist@4.19.0/swagger-ui-bundle.js';
      script.onload = () => {
        // Initialize Swagger UI
        if (window.SwaggerUIBundle) {
          window.SwaggerUIBundle({
            url: '/api/docs',
            dom_id: '#swagger-ui-container',
            deepLinking: true,
            presets: [
              window.SwaggerUIBundle.presets.apis,
              window.SwaggerUIBundle.presets.standalone
            ],
            plugins: [
              window.SwaggerUIBundle.plugins.DownloadUrl
            ],
            layout: 'StandaloneLayout',
            tryItOutEnabled: true,
            filter: true,
            supportedSubmitMethods: ['get', 'post', 'put', 'delete', 'patch'],
            onComplete: () => {
              console.log('Swagger UI loaded successfully');
            }
          });
        }
      };
      document.head.appendChild(script);
    };

    loadSwaggerUI();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-3xl font-bold text-gray-900">PolyCode API Documentation</h1>
              <span className="ml-3 inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-green-100 text-green-800">
                v1.0.0
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <a
                href="/api/health"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Health Check
              </a>
              <a
                href="/"
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Back to App
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Overview */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">API Overview</h2>
          <p className="text-gray-600 mb-6">
            The PolyCode API provides comprehensive functionality for code execution, full-stack application deployment, 
            question management, and health monitoring. This interactive documentation allows you to explore and test 
            all available endpoints.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-medium text-blue-900 mb-2">Code Execution</h3>
              <p className="text-sm text-blue-700">Execute code in 10+ programming languages</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <h3 className="font-medium text-green-900 mb-2">Full-Stack Deployment</h3>
              <p className="text-sm text-green-700">Deploy complete web applications instantly</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <h3 className="font-medium text-purple-900 mb-2">Question Management</h3>
              <p className="text-sm text-purple-700">Create and manage coding interview questions</p>
            </div>
            <div className="bg-orange-50 rounded-lg p-4">
              <h3 className="font-medium text-orange-900 mb-2">Health Monitoring</h3>
              <p className="text-sm text-orange-700">Monitor service health and status</p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              OpenAPI 3.0
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              REST API
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              JSON
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              Next.js API Routes
            </span>
          </div>
        </div>

        {/* Quick Start */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Start</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">1. Execute Code</h3>
              <div className="bg-gray-50 rounded-md p-3">
                <code className="text-sm text-gray-800">
                  POST /api/execute<br/>
                  {`{ "code": "console.log('Hello, World!');", "language": "javascript" }`}
                </code>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">2. Deploy Full-Stack App</h3>
              <div className="bg-gray-50 rounded-md p-3">
                <code className="text-sm text-gray-800">
                  POST /api/fullstack<br/>
                  {`{ "html": "...", "css": "...", "javascript": "...", "nodejs": "..." }`}
                </code>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">3. Create Question</h3>
              <div className="bg-gray-50 rounded-md p-3">
                <code className="text-sm text-gray-800">
                  POST /api/question<br/>
                  {`{ "title": "Two Sum", "description": "...", "language": "javascript" }`}
                </code>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Swagger UI Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div 
            id="swagger-ui-container" 
            className="swagger-ui-container"
            style={{ minHeight: '600px' }}
          >
            {/* Loading state */}
            <div className="flex items-center justify-center p-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading interactive API documentation...</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-12 border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-gray-500">
            <p>© 2024 PolyCode. Built with Next.js and Swagger UI.</p>
          </div>
        </div>
      </div>

      {/* Swagger UI Styles */}
      <style jsx global>{`
        .swagger-ui-container .swagger-ui {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        }
        
        .swagger-ui-container .swagger-ui .topbar {
          display: none;
        }
        
        .swagger-ui-container .swagger-ui .info {
          margin: 20px 0;
        }
        
        .swagger-ui-container .swagger-ui .scheme-container {
          background: #f8f9fa;
          border: 1px solid #e9ecef;
          border-radius: 6px;
          padding: 15px;
          margin-bottom: 20px;
        }
        
        .swagger-ui-container .swagger-ui .opblock.opblock-post {
          border-color: #10b981;
          background: rgba(16, 185, 129, 0.1);
        }
        
        .swagger-ui-container .swagger-ui .opblock.opblock-get {
          border-color: #3b82f6;
          background: rgba(59, 130, 246, 0.1);
        }
        
        .swagger-ui-container .swagger-ui .opblock.opblock-delete {
          border-color: #ef4444;
          background: rgba(239, 68, 68, 0.1);
        }
        
        .swagger-ui-container .swagger-ui .opblock-summary {
          font-weight: 600;
        }
        
        .swagger-ui-container .swagger-ui .btn.execute {
          background-color: #4f46e5;
          border-color: #4f46e5;
        }
        
        .swagger-ui-container .swagger-ui .btn.execute:hover {
          background-color: #4338ca;
          border-color: #4338ca;
        }
      `}</style>
    </div>
  );
}
