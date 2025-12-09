#!/bin/bash

# Setup script for TTS API backend

set -e

echo "======================================"
echo "TTS API Backend Setup"
echo "======================================"

# Check Python version
python_version=$(python --version | cut -d' ' -f2)
echo "✓ Python version: $python_version"

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python -m venv venv
    echo "✓ Virtual environment created"
else
    echo "✓ Virtual environment already exists"
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "Installing dependencies..."
pip install --upgrade pip
pip install -r requirements.txt
echo "✓ Dependencies installed"

# Copy .env.example to .env if .env doesn't exist
if [ ! -f ".env" ]; then
    echo "Creating .env file from template..."
    cp .env.example .env
    echo "✓ .env file created. Please review and update if needed."
else
    echo "✓ .env file already exists"
fi

# Test the application
echo ""
echo "Testing application..."
python test_api.py

echo ""
echo "======================================"
echo "Setup Complete!"
echo "======================================"
echo ""
echo "To start the development server, run:"
echo "  source venv/bin/activate"
echo "  python -m uvicorn app.main:app --reload"
echo ""
echo "The API will be available at http://localhost:8000"
echo "API documentation: http://localhost:8000/docs"
