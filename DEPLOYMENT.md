# TTS API Deployment Guide

This guide covers deploying the TTS API backend to various platforms.

## Table of Contents

1. [Local Development](#local-development)
2. [Docker Deployment](#docker-deployment)
3. [Heroku Deployment](#heroku-deployment)
4. [Vercel Serverless Deployment](#vercel-serverless-deployment)
5. [AWS Deployment](#aws-deployment)
6. [Environment Configuration](#environment-configuration)

## Local Development

### Prerequisites

- Python 3.8 or higher
- pip or uv package manager

### Quick Start

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Run setup script:**
   
   **On Linux/macOS:**
   ```bash
   bash setup.sh
   ```
   
   **On Windows:**
   ```bash
   setup.bat
   ```

3. **Activate virtual environment (if not already activated):**
   
   **Linux/macOS:**
   ```bash
   source venv/bin/activate
   ```
   
   **Windows:**
   ```bash
   venv\Scripts\activate
   ```

4. **Start development server:**
   ```bash
   python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

5. **Access the API:**
   - API: http://localhost:8000
   - Swagger UI: http://localhost:8000/docs
   - ReDoc: http://localhost:8000/redoc

## Docker Deployment

### Build and Run with Docker

1. **Build the image:**
   ```bash
   docker build -t tts-api:latest .
   ```

2. **Run the container:**
   ```bash
   docker run -p 8000:8000 \
     -e HOST=0.0.0.0 \
     -e PORT=8000 \
     -e CORS_ORIGINS=http://localhost:3000 \
     tts-api:latest
   ```

3. **Access the API:**
   ```bash
   curl http://localhost:8000/api/health
   ```

### Docker Compose (Recommended for Development)

1. **Start services:**
   ```bash
   docker-compose up -d
   ```

2. **View logs:**
   ```bash
   docker-compose logs -f tts-api
   ```

3. **Stop services:**
   ```bash
   docker-compose down
   ```

4. **Rebuild after code changes:**
   ```bash
   docker-compose up --build
   ```

## Heroku Deployment

### Prerequisites

- Heroku CLI installed
- Heroku account
- Git repository

### Deployment Steps

1. **Create Procfile** (already included):
   ```
   web: uvicorn app.main:app --host 0.0.0.0 --port $PORT
   ```

2. **Create runtime.txt** (already included):
   ```
   python-3.11.0
   ```

3. **Login to Heroku:**
   ```bash
   heroku login
   ```

4. **Create Heroku app:**
   ```bash
   heroku create your-app-name
   ```

5. **Set environment variables:**
   ```bash
   heroku config:set CORS_ORIGINS=https://your-frontend-domain.com
   heroku config:set ENV=production
   ```

6. **Deploy:**
   ```bash
   git push heroku main
   ```

7. **View logs:**
   ```bash
   heroku logs --tail
   ```

### Heroku Configuration

Add the following buildpacks (optional):

```bash
heroku buildpacks:add heroku/python
```

## Vercel Serverless Deployment

### Note on Serverless Compatibility

FastAPI can run on Vercel using serverless functions, though with some limitations:
- Function timeout: 60 seconds
- Maximum file size: 250MB
- No persistent storage

### Deployment Structure

1. **Restructure for Vercel:**
   ```
   api/
   └── index.py          # Wrapped FastAPI app
   ```

2. **Create api/index.py:**
   ```python
   from fastapi import FastAPI
   from fastapi.middleware.cors import CORSMiddleware
   import os
   from dotenv import load_dotenv
   
   # Import your app
   from app.main import app as fastapi_app
   
   # Configure for Vercel
   app = fastapi_app
   
   # Add Vercel-specific middleware if needed
   ```

3. **Create vercel.json:**
   ```json
   {
     "buildCommand": "pip install -r requirements.txt",
     "outputDirectory": ".",
     "env": {
       "PYTHONPATH": "/var/task"
     }
   }
   ```

4. **Deploy to Vercel:**
   ```bash
   vercel deploy
   ```

### Vercel Environment Variables

Set these in your Vercel project settings:

```
CORS_ORIGINS=https://your-frontend.vercel.app
ENV=production
TTS_CACHE_FILE=robots.json
```

## AWS Deployment

### Option 1: Elastic Beanstalk

1. **Create Elastic Beanstalk application:**
   ```bash
   eb init -p python-3.11 tts-api
   ```

2. **Create .ebextensions/python.config:**
   ```yaml
   option_settings:
     aws:elasticbeanstalk:container:python:
       WSGIPath: app.main:app
   ```

3. **Deploy:**
   ```bash
   eb create tts-api-env
   eb deploy
   ```

### Option 2: ECS with Docker

1. **Push image to ECR:**
   ```bash
   aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com
   docker tag tts-api:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/tts-api:latest
   docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/tts-api:latest
   ```

2. **Create ECS Task Definition:**
   Use AWS Console or CLI to create task definition with Docker image

3. **Deploy via ECS Service**

### Option 3: Lambda with Serverless Framework

1. **Install Serverless Framework:**
   ```bash
   npm install -g serverless
   ```

2. **Deploy:**
   ```bash
   serverless deploy
   ```

## Environment Configuration

### Production Environment Variables

Create `.env.production`:

```env
# Server
HOST=0.0.0.0
PORT=8000
ENV=production

# CORS - Update with your frontend domain
CORS_ORIGINS=https://your-frontend-domain.com,https://www.your-frontend-domain.com

# TTS
TTS_CACHE_FILE=robots.json

# Logging
LOG_LEVEL=INFO
```

### Key Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `HOST` | `0.0.0.0` | Server host address |
| `PORT` | `8000` | Server port |
| `ENV` | `development` | Environment type |
| `CORS_ORIGINS` | `http://localhost:3000` | Allowed CORS origins (comma-separated) |
| `TTS_CACHE_FILE` | `robots.json` | Voice cache file path |
| `LOG_LEVEL` | `INFO` | Logging level |

## Monitoring and Logging

### Health Check

All deployments should periodically check:

```bash
curl https://your-api-domain.com/api/health
```

### Logging Configuration

Log files are output to stdout/stderr. Configure your deployment platform to capture and store logs:

- **Heroku:** Automatically captured, view with `heroku logs`
- **Docker:** Use logging drivers
- **AWS:** CloudWatch Logs
- **Vercel:** Function logs in dashboard

### Performance Monitoring

Monitor these metrics:

- API response time
- Error rate
- Voice list cache hits
- Concurrent requests

## Security Best Practices

1. **Always use HTTPS** in production
2. **Validate CORS_ORIGINS** - only allow trusted domains
3. **Rate limiting** - consider adding rate limiting middleware
4. **API Keys** - consider adding API key authentication
5. **Environment variables** - never commit secrets

## Scaling Considerations

- **Horizontal Scaling:** Deploy multiple instances behind a load balancer
- **Caching:** Voice list is cached locally (robots.json)
- **Connection Pooling:** HTTP connections are managed by uvicorn
- **Async Processing:** All endpoints use async/await for concurrency

## Troubleshooting

### Common Issues

**Port already in use:**
```bash
# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Linux/macOS
lsof -i :8000
kill -9 <PID>
```

**CORS errors:**
- Verify frontend domain is in CORS_ORIGINS
- Check for trailing slashes consistency
- Clear browser cache

**Voice list empty:**
- Ensure robots.json exists and is valid
- Check internet connection for API call
- Verify file permissions

**Timeout errors:**
- Check API server connectivity
- Verify firewall allows HTTPS outbound
- Check request timeout settings

## Additional Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Uvicorn Documentation](https://www.uvicorn.org/)
- [Docker Documentation](https://docs.docker.com/)
- [Heroku Documentation](https://devcenter.heroku.com/)
