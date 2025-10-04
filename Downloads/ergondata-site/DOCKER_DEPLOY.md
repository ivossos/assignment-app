# Docker Deployment Guide

## Quick Start

### 1. Build and Run with Docker Compose

```bash
# Build and start the container
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the container
docker-compose down
```

The application will be available at http://localhost:3000

### 2. Build and Run with Docker (without compose)

```bash
# Build the image
docker build -t ergondata-site .

# Run the container
docker run -d \
  -p 3000:3000 \
  -e GOOGLE_GENERATIVE_AI_API_KEY=your_api_key_here \
  -e GEMINI_API_KEY=your_api_key_here \
  --name ergondata-site \
  ergondata-site

# View logs
docker logs -f ergondata-site

# Stop the container
docker stop ergondata-site
docker rm ergondata-site
```

## Environment Variables

Make sure to set the following environment variables:

- `GOOGLE_GENERATIVE_AI_API_KEY` - Your Google Gemini API key
- `GEMINI_API_KEY` - Your Gemini API key (same as above)

You can set these in:
1. `.env.local` file (for docker-compose)
2. Docker run command with `-e` flag
3. Docker compose environment section

## Production Deployment

### Google Cloud Run

```bash
# Build and push to Google Container Registry
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/ergondata-site

# Deploy to Cloud Run
gcloud run deploy ergondata-site \
  --image gcr.io/YOUR_PROJECT_ID/ergondata-site \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars GOOGLE_GENERATIVE_AI_API_KEY=your_api_key_here
```

### AWS ECS/Fargate

```bash
# Build and tag
docker build -t ergondata-site .
docker tag ergondata-site:latest YOUR_AWS_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/ergondata-site:latest

# Push to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin YOUR_AWS_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com
docker push YOUR_AWS_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/ergondata-site:latest
```

### Docker Hub

```bash
# Build and tag
docker build -t yourusername/ergondata-site .

# Push to Docker Hub
docker login
docker push yourusername/ergondata-site

# Pull and run on any server
docker pull yourusername/ergondata-site
docker run -d -p 3000:3000 \
  -e GOOGLE_GENERATIVE_AI_API_KEY=your_key \
  yourusername/ergondata-site
```

## Troubleshooting

### Container won't start
```bash
# Check logs
docker logs ergondata-site

# Check if port 3000 is already in use
lsof -i :3000
```

### API errors
Make sure your environment variables are correctly set:
```bash
docker exec ergondata-site printenv | grep GEMINI
```

### Rebuild after code changes
```bash
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

## Health Check

Check if the application is running:
```bash
curl http://localhost:3000
```

## Performance

The Docker image uses multi-stage builds for optimal size:
- Builder stage: ~1.2GB
- Final image: ~300MB

## Security

- The container runs as a non-root user
- Only necessary files are copied to production
- Environment variables are used for sensitive data
- No development dependencies in production image
