#!/bin/bash

# SpotSaver Docker Build Script
# This script builds and runs the SpotSaver application using Docker

set -e

echo "🐳 Building SpotSaver Docker image..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  Warning: .env file not found!"
    echo "   Please create a .env file with your SPOTIFY_SP_DC value"
    echo "   You can copy env.example to .env and update the values"
    echo ""
    read -p "Do you want to continue without .env file? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Build cancelled"
        exit 1
    fi
fi

# Build the Docker image
echo "🔨 Building image..."
docker build -t spotsaver:latest .

echo "✅ Build completed successfully!"

# Ask if user wants to run the container
echo ""
read -p "Do you want to run the container now? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🚀 Starting SpotSaver container..."
    
    # Check if container is already running
    if docker ps -q -f name=spotsaver | grep -q .; then
        echo "🛑 Stopping existing container..."
        docker stop spotsaver
        docker rm spotsaver
    fi
    
    # Run the container
    docker run -d \
        --name spotsaver \
        -p 3000:3000 \
        --env-file .env \
        --restart unless-stopped \
        spotsaver:latest
    
    echo "✅ SpotSaver is now running!"
    echo "🌐 Access the application at: http://localhost:3000"
    echo ""
    echo "📋 Useful commands:"
    echo "   View logs: docker logs -f spotsaver"
    echo "   Stop: docker stop spotsaver"
    echo "   Start: docker start spotsaver"
    echo "   Remove: docker rm spotsaver"
else
    echo ""
    echo "📋 To run the container manually:"
    echo "   docker run -d --name spotsaver -p 3000:3000 --env-file .env spotsaver:latest"
    echo ""
    echo "   Or use docker-compose:"
    echo "   docker-compose up -d"
fi 