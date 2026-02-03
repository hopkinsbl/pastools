#!/bin/bash

echo "==================================="
echo "Installing PAStools Dependencies"
echo "==================================="
echo ""

echo "Installing root dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install root dependencies"
    exit 1
fi
echo ""

echo "Installing backend dependencies..."
cd packages/backend
npm install
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install backend dependencies"
    cd ../..
    exit 1
fi
cd ../..
echo ""

echo "Installing frontend dependencies..."
cd packages/frontend
npm install
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install frontend dependencies"
    cd ../..
    exit 1
fi
cd ../..
echo ""

echo "Installing shared dependencies..."
cd packages/shared
npm install
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install shared dependencies"
    cd ../..
    exit 1
fi
cd ../..
echo ""

echo "==================================="
echo "All dependencies installed successfully!"
echo "==================================="
echo ""
echo "Next steps:"
echo "1. Copy environment files:"
echo "   cp packages/backend/.env.example packages/backend/.env"
echo "   cp packages/frontend/.env.example packages/frontend/.env"
echo "2. Start Docker services: npm run docker:up"
echo "3. Start backend: npm run backend:dev"
echo "4. Start frontend: npm run frontend:dev"
echo ""
