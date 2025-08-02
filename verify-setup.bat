@echo off
echo 🔧 AI E-Commerce Platform Setup Verification
echo =============================================

REM Check Node.js
echo 📦 Checking Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js not found. Please install Node.js 18+
    pause
    exit /b 1
) else (
    echo ✅ Node.js version:
    node --version
)

REM Check npm
echo 📦 Checking npm...
npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ npm not found. Please install npm
    pause
    exit /b 1
) else (
    echo ✅ npm version:
    npm --version
)

REM Check Python
echo 🐍 Checking Python...
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python not found. Please install Python 3.8+
    pause
    exit /b 1
) else (
    echo ✅ Python version:
    python --version
)

REM Check project structure
if exist "aiecom\package.json" if exist "recommendation-engine\app.py" (
    echo ✅ Project structure looks good!
) else (
    echo ❌ Please run this script from the AIEcom root directory
    pause
    exit /b 1
)

REM Test frontend dependencies
echo 🔍 Checking frontend dependencies...
cd aiecom
if exist "node_modules" (
    echo ✅ Frontend dependencies installed
) else (
    echo 📦 Installing frontend dependencies...
    npm install
)

REM Test MongoDB connection
echo 🗄️  Testing MongoDB connection...
npm run seed >nul 2>&1
if errorlevel 1 (
    echo ❌ MongoDB connection failed. Please check:
    echo    1. MongoDB is running (local^) or
    echo    2. MongoDB Atlas connection string is correct in .env.local
) else (
    echo ✅ MongoDB connection successful!
    echo ✅ Sample data added to database
)

REM Test Python dependencies
echo 🔍 Checking Python dependencies...
cd ..\recommendation-engine
python -c "import flask, flask_cors" >nul 2>&1
if errorlevel 1 (
    echo 📦 Installing Python dependencies...
    pip install -r requirements.txt
) else (
    echo ✅ Python dependencies installed
)

echo.
echo 🎉 Setup verification complete!
echo.
echo To start development:
echo 1. Frontend: cd aiecom ^&^& npm run dev
echo 2. AI Engine: cd recommendation-engine ^&^& python app.py
echo 3. Or both: npm run dev (from root directory^)

pause
