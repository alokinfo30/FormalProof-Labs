#!/bin/bash

# FormalProof Labs Deployment Script

set -e

echo "🚀 Starting FormalProof Labs Deployment..."

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '#' | awk '/=/ {print $1}')
fi

# Build and deploy with Docker Compose
echo "📦 Building Docker images..."
docker-compose -f docker/docker-compose.yml build

# Run database migrations
echo "🗄️  Running database migrations..."
docker-compose -f docker/docker-compose.yml run --rm backend python -c "from app import app, db; app.app_context().push(); db.create_all()"

# Start services
echo "▶️  Starting services..."
docker-compose -f docker/docker-compose.yml up -d

# Check service health
echo "🏥  Checking service health..."
sleep 10
if curl -f http://localhost/health; then
    echo "✅ Deployment successful! Services are running."
else
    echo "❌ Health check failed. Please check the logs."
    docker-compose -f docker/docker-compose.yml logs
    exit 1
fi

# Show running containers
echo "📊 Running containers:"
docker-compose -f docker/docker-compose.yml ps

echo "✨ Deployment complete! Access the application at http://localhost"