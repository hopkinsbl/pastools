@echo off
echo ===================================
echo Installing PAStools Dependencies
echo ===================================
echo.

echo Installing root dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install root dependencies
    pause
    exit /b 1
)
echo.

echo Installing backend dependencies...
cd packages\backend
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install backend dependencies
    cd ..\..
    pause
    exit /b 1
)
cd ..\..
echo.

echo Installing frontend dependencies...
cd packages\frontend
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install frontend dependencies
    cd ..\..
    pause
    exit /b 1
)
cd ..\..
echo.

echo Installing shared dependencies...
cd packages\shared
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install shared dependencies
    cd ..\..
    pause
    exit /b 1
)
cd ..\..
echo.

echo ===================================
echo All dependencies installed successfully!
echo ===================================
echo.
echo Next steps:
echo 1. Copy environment files:
echo    copy packages\backend\.env.example packages\backend\.env
echo    copy packages\frontend\.env.example packages\frontend\.env
echo 2. Start Docker services: npm run docker:up
echo 3. Start backend: npm run backend:dev
echo 4. Start frontend: npm run frontend:dev
echo.
pause
