#!/bin/bash

# Start script for AI Recommendation Engine

echo "🤖 Starting AI Recommendation Engine..."

# Check if Python is installed
if ! command -v python &> /dev/null; then
    echo "❌ Python is not installed. Please install Python 3.8+ first."
    exit 1
fi

# Check if pip is installed
if ! command -v pip &> /dev/null; then
    echo "❌ pip is not installed. Please install pip first."
    exit 1
fi

# Install dependencies if requirements.txt exists
if [ -f "requirements.txt" ]; then
    echo "📦 Installing dependencies..."
    pip install -r requirements.txt
    
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install dependencies."
        exit 1
    fi
else
    echo "⚠️  requirements.txt not found. Make sure dependencies are installed."
fi

# Start the Flask application
echo "🚀 Starting recommendation engine on http://localhost:5000"
echo "📋 Available endpoints:"
echo "   GET  /health - Health check"
echo "   POST /recommendations - Get product recommendations"
echo ""
echo "Press Ctrl+C to stop the service"
echo ""

python app.py
