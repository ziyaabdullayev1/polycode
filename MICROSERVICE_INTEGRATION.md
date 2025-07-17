# PolyCode Microservice Integration Guide

This guide explains how to integrate PolyCode as a microservice in your existing application.

## 🎯 Integration Options

### **Option 1: Reverse Proxy Integration (Recommended)**

**Perfect for**: Production environments, multiple services
**Pros**: Clean URLs, no CORS issues, full feature access
**Cons**: Requires proxy configuration

#### Setup with Nginx:
```nginx
# Add to your nginx.conf
location /flow/ {
    rewrite ^/flow/(.*)$ /$1 break;
    proxy_pass http://localhost:3100;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}
```

#### Setup with Node.js/Express:
```bash
npm install http-proxy-middleware
```

```javascript
const { createProxyMiddleware } = require('http-proxy-middleware');

app.use('/flow', createProxyMiddleware({
  target: 'http://localhost:3100',
  changeOrigin: true,
  pathRewrite: { '^/flow': '' }
}));
```

**Result**: `yourapp.com/flow` → Full PolyCode interface

---

### **Option 2: Next.js Rewrites (Next.js Apps)**

**Perfect for**: Next.js applications
**Pros**: Built-in solution, server-side routing
**Cons**: Next.js specific

#### Setup:
```javascript
// next.config.js
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/flow/:path*',
        destination: 'http://localhost:3100/:path*',
      },
      {
        source: '/api/polycode/:path*',
        destination: 'http://localhost:3100/api/:path*',
      },
    ];
  },
};
```

**Result**: `yourapp.com/flow` → Full PolyCode interface

---

### **Option 3: Iframe Integration (Simplest)**

**Perfect for**: Quick integration, proof of concept
**Pros**: No configuration needed, isolated environment
**Cons**: Limited customization, potential UX issues

#### React Implementation:
```jsx
const PolycodeEmbed = () => (
  <iframe
    src="http://localhost:3100"
    width="100%"
    height="600px"
    frameBorder="0"
    title="PolyCode Editor"
    style={{ borderRadius: '8px' }}
  />
);
```

#### HTML Implementation:
```html
<iframe 
  src="http://localhost:3100" 
  width="100%" 
  height="600px" 
  frameborder="0"
  title="PolyCode Editor">
</iframe>
```

**Result**: PolyCode embedded in your page

---

### **Option 4: API-Only Integration (Custom UI)**

**Perfect for**: Custom interfaces, specific workflows
**Pros**: Complete control, custom UX
**Cons**: More development work

#### Available APIs:

##### Code Execution:
```javascript
const response = await fetch('http://localhost:3100/api/execute', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    code: 'console.log("Hello World!")',
    language: 'javascript',
    input: '' // Optional stdin input
  })
});
```

##### Full-Stack Deployment:
```javascript
const response = await fetch('http://localhost:3100/api/fullstack', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    html: '<h1>Hello World</h1>',
    css: 'h1 { color: blue; }',
    javascript: 'console.log("Deployed!");',
    nodejs: 'app.get("/api/test", (req, res) => res.json({status: "ok"}))'
  })
});
```

##### Health Check:
```javascript
const health = await fetch('http://localhost:3100/api/health');
```

---

## 🔧 Configuration for Different URLs

### Method 1: Environment-Based URL Configuration

Update your main app to detect the environment:

```javascript
// In your main application
const POLYCODE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://yourapp.com/flow'  // Production with reverse proxy
  : 'http://localhost:3100';    // Development with direct access

// Use in your integration:
const iframe = document.createElement('iframe');
iframe.src = POLYCODE_URL;
```

### Method 2: Dynamic URL Detection

```javascript
// Auto-detect if running under a path
const getPolycodeUrl = () => {
  const currentPath = window.location.pathname;
  if (currentPath.includes('/flow')) {
    return window.location.origin + '/flow';
  }
  return 'http://localhost:3100';
};
```

---

## 🚀 Production Deployment

### Docker Compose with Reverse Proxy

```yaml
version: '3.8'
services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - main-app
      - polycode

  main-app:
    build: ./your-main-app
    ports:
      - "3000:3000"

  polycode:
    build: ./polycode-app
    ports:
      - "3100:3000"
    environment:
      - DOCKER_ENV=true
      - DOCKER_PORT_OFFSET=100
```

### Kubernetes Deployment

```yaml
apiVersion: v1
kind: Service
metadata:
  name: polycode-service
spec:
  selector:
    app: polycode
  ports:
    - port: 3100
      targetPort: 3000

---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: app-ingress
spec:
  rules:
  - host: yourapp.com
    http:
      paths:
      - path: /flow
        pathType: Prefix
        backend:
          service:
            name: polycode-service
            port:
              number: 3100
```

---

## 📱 Integration Examples

### 1. Learning Management System (LMS)
```
yourapp.com/courses/javascript/exercise/1
↓ (Embedded PolyCode)
Full coding environment for JavaScript exercises
```

### 2. Developer Portfolio
```
portfolio.com/playground
↓ (PolyCode iframe)
Interactive coding demos
```

### 3. Corporate Training Platform
```
training.company.com/coding-bootcamp
↓ (API integration)
Custom learning interface with PolyCode execution
```

### 4. SaaS Platform Feature
```
saas.com/dashboard/code-editor
↓ (Reverse proxy)
Integrated coding capabilities
```

---

## 🔒 Security Considerations

### CORS Configuration
For API-only integration, configure CORS in PolyCode:

```javascript
// Add to your main app's CORS middleware
app.use(cors({
  origin: ['http://localhost:3000', 'https://yourapp.com'],
  credentials: true
}));
```

### Authentication Integration
Forward authentication headers:

```javascript
// In your proxy configuration
app.use('/flow', createProxyMiddleware({
  target: 'http://localhost:3100',
  changeOrigin: true,
  onProxyReq: (proxyReq, req) => {
    // Forward auth headers
    if (req.headers.authorization) {
      proxyReq.setHeader('Authorization', req.headers.authorization);
    }
  }
}));
```

---

## 🧪 Testing Your Integration

### 1. Start PolyCode Service
```bash
cd polycode-app
docker-compose up -d
```

### 2. Test Direct Access
```bash
curl http://localhost:3100/api/health
```

### 3. Test Through Your App
```bash
curl http://localhost:3000/flow/api/health  # Via reverse proxy
```

### 4. Test Full Integration
- Navigate to `yourapp.com/flow`
- Verify all features work
- Test full-stack deployments
- Check URL generation

---

## 🎛️ Configuration Summary

| Method | URL Pattern | Setup Complexity | Features |
|--------|-------------|------------------|----------|
| Reverse Proxy | `yourapp.com/flow` | Medium | Full ✅ |
| Next.js Rewrites | `yourapp.com/flow` | Low | Full ✅ |
| Iframe | `yourapp.com/embed` | Very Low | Limited ⚠️ |
| API Only | Custom | High | Custom ✅ |

**Recommended**: Start with iframe for testing, then implement reverse proxy for production.

---

## 🆘 Troubleshooting

### Common Issues:

**1. CORS Errors (API Integration)**
- Add your domain to CORS whitelist
- Use proxy instead of direct API calls

**2. Assets Not Loading (Iframe)**
- Check network tab for failed requests
- Ensure PolyCode service is accessible

**3. URLs Not Working (Reverse Proxy)**
- Verify proxy path rewriting
- Check PolyCode service health

**4. Full-Stack URLs Wrong**
- Ensure `DOCKER_ENV` and `DOCKER_PORT_OFFSET` are set
- Verify port mappings in docker-compose.yml

Need help? Check the logs:
```bash
docker-compose logs polycode-app
``` 