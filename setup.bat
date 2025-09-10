@echo off
echo ================================================
echo Mental Health AI Platform - Hackathon Setup
echo ================================================
echo.

:: Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed. Please install Node.js 18+ from https://nodejs.org
    echo.
    pause
    exit /b 1
)

:: Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Python is not installed. Please install Python 3.9+ from https://python.org
    echo.
    pause
    exit /b 1
)

echo [1/5] Creating environment file...
if not exist .env (
    copy .env.example .env
    echo Created .env file. Please add your Gemini API key!
    echo.
)

echo [2/5] Installing root dependencies...
npm install
echo.

echo [3/5] Installing frontend dependencies...
cd frontend
npm install
cd ..
echo.

echo [4/5] Installing backend dependencies...
cd backend
npm install
cd ..
echo.

echo [5/5] Installing AI services dependencies...
cd ai-services
python -m venv venv
call venv\Scripts\activate
pip install fastapi uvicorn google-generativeai python-dotenv langchain langchain-google-genai
cd ..
echo.

echo ================================================
echo Hackathon Setup Complete! 🚀
echo ================================================
echo.
echo Next steps:
echo 1. Add your GEMINI_API_KEY to the .env file
echo 2. Start development servers:
echo    npm run dev
echo.
echo Or run services individually:
echo    Frontend: npm run dev:frontend
echo    Backend:  npm run dev:backend  
echo    AI:       npm run dev:ai
echo.
echo Quick Start Tips:
echo - Use SQLite/JSON files for data (no database setup needed)
echo - Focus on core demo features first
echo - Test integration frequently
echo - Prepare demo scenarios early
echo.
echo Ready to build something amazing! �
echo.
pause
