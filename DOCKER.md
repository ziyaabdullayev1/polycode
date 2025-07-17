# Docker Setup for PolyCode App

This guide explains how to run your PolyCode application as a Docker service.

## Quick Start

### Using Docker Compose (Recommended)

1. **Build and start the service:**
   ```bash
   docker-compose up -d --build
   ```

2. **Access your application:**
   - **Docker version**: Open your browser and go to `http://localhost:3100`
   - **Local development**: Use `http://localhost:3000` (no conflicts!)

3. **Stop the service:**
   ```bash
   docker-compose down
   ```

### Using Docker Commands

1. **Build the Docker image:**
   ```bash
   docker build -t polycode-app .
   ```

2. **Run the container:**
   ```bash
   docker run -d \
     --name polycode-app \
     -p 3000:3000 \
     --restart unless-stopped \
     polycode-app
   ```

3. **Stop the container:**
   ```bash
   docker stop polycode-app
   docker rm polycode-app
   ```

## Configuration

### Port Configuration

**🚀 No More Port Conflicts!**
- **Docker version**: Runs on port `3100` (main app) and `3101-3120` (full-stack deployments)
- **Local development**: Uses standard port `3000` - you can run both simultaneously!

### Environment Variables

You can customize the application by setting environment variables:

```bash
# In docker-compose.yml, add to environment section:
environment:
  - NODE_ENV=production
  - NEXT_TELEMETRY_DISABLED=1
  - DOCKER_ENV=true
  - DOCKER_PORT_OFFSET=100
  # Add your custom variables here
```

### Volume Mounts

The docker-compose.yml includes a volume mount for persistent storage:
```yaml
volumes:
  - ./temp-projects:/app/temp-projects
```

This ensures that any temporary projects created by your app persist between container restarts.

## Monitoring

### Health Check

The application includes a health check endpoint at `/api/health`. You can test it:

```bash
# For Docker version
curl http://localhost:3100/api/health

# For local development
curl http://localhost:3000/api/health
```

### Container Logs

View application logs:
```bash
# With docker-compose
docker-compose logs -f polycode-app

# With docker
docker logs -f polycode-app
```

### Container Status

Check if the container is running:
```bash
# With docker-compose
docker-compose ps

# With docker
docker ps
```

## Production Deployment

### With Reverse Proxy

For production deployment, uncomment the nginx service in `docker-compose.yml` and create an `nginx.conf` file:

```nginx
events {
    worker_connections 1024;
}

http {
    upstream polycode {
        server polycode-app:3000;
    }

    server {
        listen 80;
        server_name your-domain.com;

        location / {
            proxy_pass http://polycode;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
```

### SSL/HTTPS

For HTTPS support, you can use tools like:
- Let's Encrypt with Certbot
- Traefik with automatic SSL
- CloudFlare in front of your service

## Troubleshooting

### Container won't start
```bash
# Check logs for errors
docker-compose logs polycode-app

# Rebuild the image
docker-compose up -d --build --force-recreate
```

### Port already in use
```bash
# Change the port in docker-compose.yml
ports:
  - "3001:3000"  # Use port 3001 instead
```

### Out of disk space
```bash
# Clean up unused Docker resources
docker system prune -a
```

## Development vs Production

- **Development**: Use `npm run dev` directly (not Docker)
- **Production**: Use the Docker setup for consistent deployment

The Docker image is optimized for production with:
- Multi-stage build for smaller image size
- Non-root user for security
- Standalone Next.js output for better performance
- Health checks for monitoring 