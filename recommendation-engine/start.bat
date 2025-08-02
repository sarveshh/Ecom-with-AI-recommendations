@echo off
echo 🤖 Starting AI Recommendation Engine...

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is not installed. Please install Python 3.8+ first.
    pause
    exit /b 1
)

REM Check if pip is installed
pip --version >nul 2>&1
if errorlevel 1 (
    echo ❌ pip is not installed. Please install pip first.
    pause
    exit /b 1
)

REM Install dependencies if requirements.txt exists
if exist requirements.txt (
    echo 📦 Installing dependencies...
    pip install -r requirements.txt
    if errorlevel 1 (
        echo ❌ Failed to install dependencies.
        pause
        exit /b 1
    )
) else (
    echo ⚠️  requirements.txt not found. Make sure dependencies are installed.
)

REM Start the Flask application
echo 🚀 Starting recommendation engine on http://localhost:5000
echo 📋 Available endpoints:
echo    GET  /health - Health check
echo    POST /recommendations - Get product recommendations
echo.
echo Press Ctrl+C to stop the service
echo.

python app.py

pause
