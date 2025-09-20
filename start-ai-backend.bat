@echo off
echo Starting Mental Health AI Platform Services...

REM Start AI Service (Python)
echo Starting AI Service on port 5010...
start "AI Service" cmd /k "cd ai-services && python main.py"

REM Wait a moment for AI service to start
timeout /t 3 /nobreak > nul

REM Start Backend (Node.js)
echo Starting Backend Service on port 3001...
start "Backend Service" cmd /k "cd backend && npm run dev"

echo Both services are starting...
echo AI Service: http://localhost:5010
echo Backend Service: http://localhost:3001
echo Press any key to close this window...
pause > nul