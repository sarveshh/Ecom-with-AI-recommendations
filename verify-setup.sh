#!/bin/bash

echo "🔧 AI E-Commerce Platform Setup Verification"
echo "============================================="

# Check Node.js
echo "📦 Checking Node.js..."
if command -v node &> /dev/null; then
    echo "✅ Node.js version: $(node --version)"
else
    echo "❌ Node.js not found. Please install Node.js 18+"
    exit 1
fi

# Check npm
echo "📦 Checking npm..."
if command -v npm &> /dev/null; then
    echo "✅ npm version: $(npm --version)"
else
    echo "❌ npm not found. Please install npm"
    exit 1
fi

# Check Python
echo "🐍 Checking Python..."
if command -v python &> /dev/null; then
    echo "✅ Python version: $(python --version)"
elif command -v python3 &> /dev/null; then
    echo "✅ Python version: $(python3 --version)"
else
    echo "❌ Python not found. Please install Python 3.8+"
    exit 1
fi

# Check if we're in the right directory
if [ -f "aiecom/package.json" ] && [ -f "recommendation-engine/app.py" ]; then
    echo "✅ Project structure looks good!"
else
    echo "❌ Please run this script from the AIEcom root directory"
    exit 1
fi

# Test frontend dependencies
echo "🔍 Checking frontend dependencies..."
cd aiecom
if [ -d "node_modules" ]; then
    echo "✅ Frontend dependencies installed"
else
    echo "📦 Installing frontend dependencies..."
    npm install
fi

# Test if we can connect to MongoDB
echo "🗄️  Testing MongoDB connection..."
if npm run seed > /dev/null 2>&1; then
    echo "✅ MongoDB connection successful!"
    echo "✅ Sample data added to database"
else
    echo "❌ MongoDB connection failed. Please check:"
    echo "   1. MongoDB is running (local) or"
    echo "   2. MongoDB Atlas connection string is correct in .env.local"
fi

# Test Python dependencies
echo "🔍 Checking Python dependencies..."
cd ../recommendation-engine
if python -c "import flask, flask_cors" 2>/dev/null; then
    echo "✅ Python dependencies installed"
else
    echo "📦 Installing Python dependencies..."
    pip install -r requirements.txt
fi

echo ""
echo "🎉 Setup verification complete!"
echo ""
echo "To start development:"
echo "1. Frontend: cd aiecom && npm run dev"
echo "2. AI Engine: cd recommendation-engine && python app.py"
echo "3. Or both: npm run dev (from root directory)"
