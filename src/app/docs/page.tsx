'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the component with no SSR to avoid hydration issues
const SwaggerDocsContent = dynamic(() => Promise.resolve(SwaggerDocsContentComponent), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading documentation...</p>
      </div>
    </div>
  )
});

declare global {
  interface Window {
    SwaggerUIBundle: any;
  }
}

function SwaggerDocsContentComponent() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Load Swagger UI from CDN
    const loadSwaggerUI = () => {
      // Check if already loaded
      if (document.querySelector('link[href*="swagger-ui.css"]')) {
        initializeSwaggerUI();
        return;
      }

      // Load CSS
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/swagger-ui-dist@4.19.0/swagger-ui.css';
      document.head.appendChild(link);

      // Load JS
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/swagger-ui-dist@4.19.0/swagger-ui-bundle.js';
      script.onload = () => {
        initializeSwaggerUI();
      };
      script.onerror = () => {
        console.error('Failed to load Swagger UI script');
        const loadingState = document.getElementById('loading-state');
        if (loadingState) {
          loadingState.innerHTML = '<div class="text-center"><p class="text-red-600">Failed to load Swagger UI. Please refresh the page.</p></div>';
        }
      };
      document.head.appendChild(script);
    };

    const initializeSwaggerUI = () => {
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
          tryItOutEnabled: true,
          filter: true,
          supportedSubmitMethods: ['get', 'post', 'put', 'delete', 'patch'],
          docExpansion: 'list',
          defaultModelsExpandDepth: 1,
          defaultModelExpandDepth: 1,
          showExtensions: true,
          showCommonExtensions: true,
          onComplete: () => {
            console.log('Swagger UI loaded successfully');
            setIsLoaded(true);
            // Hide loading state
            const loadingState = document.getElementById('loading-state');
            if (loadingState) {
              loadingState.style.display = 'none';
            }
          },
          onFailure: (error: any) => {
            console.error('Swagger UI failed to load:', error);
            const loadingState = document.getElementById('loading-state');
            if (loadingState) {
              loadingState.innerHTML = '<div class="text-center"><p class="text-red-600">Failed to load API documentation. Please refresh the page.</p></div>';
            }
          }
        });
      }
    };

    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      loadSwaggerUI();
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <div className="min-h-screen bg-gray-50" style={{ height: 'auto', overflow: 'visible' }}>
        {/* Header */}
        <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center">
                <h1 className="text-3xl font-bold text-gray-900">polycode API Documentation</h1>
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

        {/* Swagger UI Container - Full Width with proper scrolling */}
        <div className="w-full bg-white" style={{ minHeight: 'calc(100vh - 100px)', overflow: 'auto' }}>
          <div 
            id="swagger-ui-container" 
            className="swagger-ui-container w-full"
            style={{ 
              minHeight: '100%',
              height: 'auto',
              padding: '20px',
              backgroundColor: 'white',
              overflow: 'visible'
            }}
          >
            {/* Loading state */}
            <div id="loading-state" className="flex items-center justify-center p-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading interactive API documentation...</p>
                <p className="text-sm text-gray-500 mt-2">If this takes too long, try refreshing the page.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Swagger UI Styles */}
      <style jsx global>{`
        body {
          overflow: auto !important;
        }
        
        .swagger-ui-container {
          overflow: visible !important;
          height: auto !important;
        }
        
        .swagger-ui-container .swagger-ui {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          height: auto !important;
          overflow: visible !important;
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
          border-color: #49cc90;
          background: rgba(73, 204, 144, 0.1);
        }
        
        .swagger-ui-container .swagger-ui .opblock.opblock-post .opblock-summary-method {
          background: #49cc90;
        }
        
        .swagger-ui-container .swagger-ui .opblock.opblock-get {
          border-color: #61affe;
          background: rgba(97, 175, 254, 0.1);
        }
        
        .swagger-ui-container .swagger-ui .opblock.opblock-get .opblock-summary-method {
          background: #61affe;
        }
        
        .swagger-ui-container .swagger-ui .opblock.opblock-delete {
          border-color: #f93e3e;
          background: rgba(249, 62, 62, 0.1);
        }
        
        .swagger-ui-container .swagger-ui .opblock.opblock-delete .opblock-summary-method {
          background: #f93e3e;
        }
        
        .swagger-ui-container .swagger-ui .opblock.opblock-put {
          border-color: #fca130;
          background: rgba(252, 161, 48, 0.1);
        }
        
        .swagger-ui-container .swagger-ui .opblock.opblock-put .opblock-summary-method {
          background: #fca130;
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
        
        .swagger-ui-container .swagger-ui .opblock-tag {
          font-size: 18px;
          font-weight: 700;
          color: #3b4151;
          margin: 20px 0 5px 0;
        }
      `}</style>
    </>
  );
}

export default function SwaggerDocsPage() {
  return <SwaggerDocsContent />;
}