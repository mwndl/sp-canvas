#!/bin/bash

# SpCanvas Docker Build Script
# This script builds and runs the SpCanvas application using Docker

set -e

echo "🐳 Building SpCanvas Docker image..."

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
docker build -t spcanvas:latest .

echo "✅ Build completed successfully!"

# Ask if user wants to run the container
echo ""
read -p "Do you want to run the container now? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🚀 Starting SpCanvas container..."
    
    # Check if container is already running
    if docker ps -q -f name=spcanvas | grep -q .; then
        echo "🛑 Stopping existing container..."
        docker stop spcanvas
        docker rm spcanvas
    fi
    
    # Run the container
    docker run -d \
        --name spcanvas \
        -p 3000:3000 \
        --env-file .env \
        --restart unless-stopped \
        spcanvas:latest
    
    echo "✅ SpCanvas is now running!"
    echo "🌐 Access the application at: http://localhost:3000"
    echo ""
    echo "📋 Useful commands:"
    echo "   View logs: docker logs -f spcanvas"
    echo "   Stop: docker stop spcanvas"
    echo "   Start: docker start spcanvas"
    echo "   Remove: docker rm spcanvas"
else
    echo ""
    echo "📋 To run the container manually:"
    echo "   docker run -d --name spcanvas -p 3000:3000 --env-file .env spcanvas:latest"
    echo ""
    echo "   Or use docker-compose:"
    echo "   docker-compose up -d"
fi 