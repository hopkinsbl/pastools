#!/bin/bash

echo "==================================="
echo "PAStools Platform Setup Verification"
echo "==================================="
echo ""

# Check Node.js version
echo "Checking Node.js version..."
node_version=$(node -v)
echo "Node.js version: $node_version"
echo ""

# Check Docker
echo "Checking Docker..."
if command -v docker &> /dev/null; then
    docker_version=$(docker --version)
    echo "Docker: $docker_version"
else
    echo "WARNING: Docker not found. Please install Docker."
fi
echo ""

# Check Docker Compose
echo "Checking Docker Compose..."
if command -v docker-compose &> /dev/null; then
    compose_version=$(docker-compose --version)
    echo "Docker Compose: $compose_version"
else
    echo "WARNING: Docker Compose not found. Please install Docker Compose."
fi
echo ""

# Check project structure
echo "Verifying project structure..."
directories=(
    "packages/backend"
    "packages/frontend"
    "packages/shared"
    "packages/backend/src"
    "packages/frontend/src"
    "packages/shared/src"
)

for dir in "${directories[@]}"; do
    if [ -d "$dir" ]; then
        echo "✓ $dir exists"
    else
        echo "✗ $dir missing"
    fi
done
echo ""

# Check configuration files
echo "Verifying configuration files..."
files=(
    "docker-compose.yml"
    "packages/backend/package.json"
    "packages/frontend/package.json"
    "packages/shared/package.json"
    "packages/backend/.env.example"
    "packages/frontend/.env.example"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "✓ $file exists"
    else
        echo "✗ $file missing"
    fi
done
echo ""

echo "==================================="
echo "Setup verification complete!"
echo "==================================="
echo ""
echo "Next steps:"
echo "1. Install dependencies: npm install"
echo "2. Copy environment files:"
echo "   cp packages/backend/.env.example packages/backend/.env"
echo "   cp packages/frontend/.env.example packages/frontend/.env"
echo "3. Start Docker services: npm run docker:up"
echo "4. Start backend: npm run backend:dev"
echo "5. Start frontend: npm run frontend:dev"
