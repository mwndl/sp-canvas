# 🐳 Docker Setup Guide

## Prerequisites

1. **Install Docker Desktop** (macOS/Windows) or Docker Engine (Linux)
   - [Docker Desktop](https://www.docker.com/products/docker-desktop/)
   - [Docker Engine](https://docs.docker.com/engine/install/)

2. **Install Docker Compose** (usually included with Docker Desktop)
   - [Docker Compose](https://docs.docker.com/compose/install/)

3. **Start Docker**
   ```bash
   # macOS/Windows: Start Docker Desktop
   # Linux: Start Docker service
   sudo systemctl start docker
   ```

## Quick Start

1. **Clone and setup**:
   ```bash
   git clone <repository-url>
   cd spotsaver
   cp env.example .env
   ```

2. **Configure environment**:
   Edit `.env` file and add your Spotify SP_DC cookie:
   ```
   SPOTIFY_SP_DC=your_sp_dc_cookie_value_here
   ```

3. **Build and run**:
   ```bash
   # Option 1: Automated script
   ./docker-build.sh
   
   # Option 2: Docker Compose
   docker-compose up -d
   
   # Option 3: Manual Docker
   docker build -t spotsaver:latest .
   docker run -d --name spotsaver -p 3000:3000 --env-file .env spotsaver:latest
   ```

4. **Access the application**:
   Open http://localhost:3000 in your browser

## Troubleshooting

### Docker daemon not running
```bash
# macOS/Windows: Start Docker Desktop
# Linux:
sudo systemctl start docker
sudo systemctl enable docker
```

### Permission denied
```bash
# Add user to docker group (Linux)
sudo usermod -aG docker $USER
# Log out and back in, or run:
newgrp docker
```

### Port already in use
```bash
# Check what's using port 3000
lsof -i :3000

# Use a different port
docker run -d --name spotsaver -p 3001:3000 --env-file .env spotsaver:latest
```

### Build fails
```bash
# Clean Docker cache
docker system prune -a

# Rebuild without cache
docker build --no-cache -t spotsaver:latest .
```

### Container won't start
```bash
# Check logs
docker logs spotsaver

# Check container status
docker ps -a

# Remove and recreate
docker rm spotsaver
docker run -d --name spotsaver -p 3000:3000 --env-file .env spotsaver:latest
```

## Production Deployment

### Using Docker Compose
```bash
# Start in background
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down

# Update and restart
docker-compose down
docker-compose up -d --build
```

### Using Docker directly
```bash
# Build image
docker build -t spotsaver:latest .

# Run with restart policy
docker run -d \
  --name spotsaver \
  -p 3000:3000 \
  --env-file .env \
  --restart unless-stopped \
  spotsaver:latest

# Update
docker stop spotsaver
docker rm spotsaver
docker build -t spotsaver:latest .
docker run -d --name spotsaver -p 3000:3000 --env-file .env --restart unless-stopped spotsaver:latest
```

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `SPOTIFY_SP_DC` | Yes | - | Spotify SP_DC cookie value |
| `PORT` | No | 3000 | Application port |
| `NODE_ENV` | No | production | Node.js environment |

## Health Check

The container includes a health check that monitors the `/api/spotify/token` endpoint:
- **Interval**: 30 seconds
- **Timeout**: 10 seconds
- **Retries**: 3
- **Start period**: 40 seconds

Check health status:
```bash
docker ps
# Look for "healthy" status in the STATUS column
```

## Useful Commands

```bash
# View running containers
docker ps

# View all containers (including stopped)
docker ps -a

# View logs
docker logs -f spotsaver

# Execute commands in container
docker exec -it spotsaver sh

# Stop container
docker stop spotsaver

# Start container
docker start spotsaver

# Remove container
docker rm spotsaver

# Remove image
docker rmi spotsaver:latest

# Clean up unused resources
docker system prune
``` 